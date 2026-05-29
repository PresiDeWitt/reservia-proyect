# Auditoría técnica crítica — ReserVia (2026-05-29)

> Auditoría production-grade: backend Django/DRF, frontend React/TS, infra Docker/CI.
> Este documento lista hallazgos por severidad, marca los **corregidos en este pase**
> y deja propuestos los refactors mayores (acordado: solo críticos/altos seguros).

---

## Problema / Solución / Qué se hizo

- **Problema**: el endpoint de creación de reservas usaba `select_for_update()` sin
  `transaction.atomic()`, y había varios fallos de seguridad/correctitud.
- **Solución**: corregir los críticos/altos quirúrgicos verificables con la suite
  existente (103 tests). Dejar refactors de infra/arquitectura documentados.
- **Cómo**: ediciones mínimas, una por hallazgo, con tests verdes antes y después.

---

## CRÍTICO

### C1 — `select_for_update()` sin `transaction.atomic()` (race / 500)
- **Archivo**: `backend/api/views_reservations.py:25`
- **Impacto**: en SQLite (producción actual) el bloqueo de fila es un *no-op* →
  dos peticiones concurrentes asignan la **misma mesa** (doble reserva). En
  PostgreSQL (soportado vía `DATABASE_URL`) lanza `TransactionManagementError`
  → **toda** creación de reserva responde 500.
- **Causa raíz**: `select_for_update` requiere transacción explícita; Django no la
  abre por request (no hay `ATOMIC_REQUESTS`).
- **Estado**: ✅ **CORREGIDO** — bloque `with transaction.atomic():` alrededor de
  selección+marcado del slot+save. El bloqueo ahora es real en Postgres y la
  escritura queda serializada en SQLite.
- **Riesgo futuro si no se corrige**: overbooking sistemático y caída del endpoint
  al migrar a Postgres.

---

## ALTO

### A1 — Emails enviados antes del commit (fire-and-forget)
- **Archivo**: `backend/api/models.py` (signals) + `backend/api/emails.py`
- **Impacto**: con la reserva ahora dentro de `atomic`, el signal `post_save`
  despachaba el email en el acto; si la transacción hace rollback, el cliente
  recibe "Reserva confirmada" de una reserva inexistente.
- **Estado**: ✅ **CORREGIDO** — despacho envuelto en `transaction.on_commit(...)`
  para confirmación, cancelación y bienvenida.
- **Pendiente (propuesto)**: el envío real usa un `ThreadPoolExecutor` global
  (`emails.py:10`). Es fire-and-forget: sin reintentos, sin backpressure, los hilos
  mueren si el worker de gunicorn se recicla, y no hay trazabilidad. **Recomendado**
  migrar a una cola (Celery + Redis, que ya está en el stack, o `django-rq`).

### A2 — Inyección de HTML en emails (campos sin escapar)
- **Archivo**: `backend/api/emails.py`
- **Impacto**: `reservation.note` (texto libre del cliente), nombres y datos de
  restaurante se interpolaban crudos en el HTML del correo → inyección de
  HTML/atributos en el cliente de correo del destinatario.
- **Estado**: ✅ **CORREGIDO** — `escape()` aplicado a `note`, `first_name`,
  `restaurant.name`, `address`, `label`, `zone`, `occasion`.

### A3 — Comparación de códigos de staff no constante (timing attack)
- **Archivo**: `backend/api/views_auth.py:78`
- **Impacto**: `code == owner_code` permite inferir el secreto por timing; además
  son secretos estáticos compartidos (modelo de auth débil de por sí).
- **Estado**: ✅ **CORREGIDO** — `hmac.compare_digest` + guarda de vacío.
- **Pendiente (propuesto)**: el bucle que prueba cada `StaffCode` activo con
  `check_password` (`views_auth.py:69`) es O(n) por login y no es escalable; los
  códigos en `.env.example` son placeholders, asegurar que no se commitean reales.

### A4 — Endpoint de chat: sin límite de tamaño y crash con `history` malformado
- **Archivo**: `backend/api/views_chat.py`
- **Impacto**: `history` no validado (items no-dict → `AttributeError`/500) y sin
  tope de longitud → prompt arbitrariamente grande a OpenRouter (coste) por
  usuario anónimo (endpoint `AllowAny`).
- **Estado**: ✅ **CORREGIDO** — `message` tipado y acotado a 2000 chars; `history`
  saneado (lista de dicts, últimos 10 turnos, contenido recortado).
- **Pendiente (propuesto)**: considerar exigir autenticación o un throttle anónimo
  más estricto para `chat/` por coste.

### A5 — Race en cancelación de reserva
- **Archivo**: `backend/api/views_reservations.py:60`
- **Estado**: ✅ **CORREGIDO** — `atomic` + `select_for_update` + idempotencia
  (si ya está cancelada, no re-libera ni re-notifica).

### A6 — Comparación de fecha/hora sin zona horaria
- **Archivo**: `backend/api/views_reservations.py`
- **Impacto**: `USE_TZ=True` pero el chequeo de "hora pasada" usaba
  `datetime.now()` naive; con el servidor en UTC y `TIME_ZONE=Europe/Madrid` el
  desfase de 1–2h permitía reservar slots ya pasados o bloquear válidos.
- **Estado**: ✅ **CORREGIDO** — `timezone.make_aware` + `timezone.localtime()`.

---

## Pase 2 — Infra/arquitectura

Aplicado (seguro, no toca datos ni auto-despliegue):
- **M6** ✅ `encrypted_fields.py`: excepción estrechada a `(InvalidToken, ValueError)`
  + logging; ya no enmascara errores inesperados.
- **M7** ✅ `docker-compose.prod.yml`: `REDIS_URL` garantizado → rate-limit global.
- **M8** ✅ `nginx.conf`: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `client_max_body_size 2m`.
- **M1** ✅ (cableado opt-in) `DATABASE_URL` en prod compose (default vacío = SQLite)
  + nuevo `docker-compose.postgres.yml` (servicio Postgres + runbook de cutover).

Descartado deliberadamente (sobreingeniería para esta escala):
- **Celery / cola de emails**: el bug real (emails de transacciones con rollback)
  ya está resuelto con `on_commit`. El `ThreadPoolExecutor` es aceptable a bajo
  volumen. Migrar a Celery+Redis solo si el volumen de correo crece.

Recomendado, NO aplicado (rompería el deploy SQLite automático en `main`):
- **M3 — Dockerfile no-root**: debe ir acompañado del cutover a Postgres (sin
  volumen SQLite escribible no hay problema de permisos). Imagen objetivo:
  ```dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
  RUN apt-get update && apt-get install -y --no-install-recommends curl \
      && rm -rf /var/lib/apt/lists/* \
      && useradd -m -u 10001 appuser
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  RUN python manage.py collectstatic --noinput || true
  USER appuser
  EXPOSE 8000
  # migrate como job de release (no en CMD) para evitar carrera con réplicas:
  CMD ["gunicorn","-w","3","--timeout","60","reservia.wsgi:application","--bind","0.0.0.0:8000"]
  ```
  Nota: `build-essential` se elimina (psycopg2-binary/cryptography traen wheels).
- **M4 — migrate fuera del CMD**: ejecutar `python manage.py migrate` como paso de
  release del pipeline antes de `up -d`, no en el arranque de cada contenedor.

## MEDIO (propuestos, no aplicados en este pase)

- **M1 — SQLite en producción con `gunicorn -w 3`**: escrituras concurrentes →
  `database is locked`. La infra ya tiene Redis; falta PostgreSQL. (`docker-compose.prod.yml`)
- **M2 — `nearby_restaurants` carga toda la tabla en memoria** y calcula haversine
  en Python por request (`views_restaurants.py:177`). No escala; usar bounding-box
  en SQL para prefiltrar (o PostGIS).
- **M3 — Contenedor backend corre como root** y arrastra `build-essential`
  (`backend/Dockerfile`). Añadir `USER` no-root y multi-stage; cuidado con permisos
  del volumen `db_data`.
- **M4 — `migrate`/`collectstatic` en el `CMD`**: con varias réplicas hay carrera
  de migraciones. Mover a un job de release/entrypoint con lock.
- **M5 — Inconsistencia de rol en frontend**: `App.tsx:55` lee `user?.role`, pero
  `UserSerializer` solo devuelve `{id,name,email}` → la lógica de confinamiento de
  owner/admin es código muerto (el rol vive en `STAFF_ROLE`).
- **M6 — Excepción demasiado amplia en campos cifrados**: `except (InvalidToken,
  Exception)` devuelve el ciphertext crudo en fallo de descifrado
  (`encrypted_fields.py:23`) → puede filtrar datos cifrados como texto.
- **M7 — Throttle sobre `LocMemCache` por defecto**: sin `REDIS_URL`, el rate-limit
  es por-proceso (3 workers = 3x el límite). En prod fijar `REDIS_URL` como cache de DRF.
- **M8 — `nginx.conf` sin cabeceras de seguridad** ni `client_max_body_size`.

## BAJO (propuestos)

- B1 — Tests de email con `assertTrue(x or True)`: asersiones que siempre pasan
  (`tests/test_emails.py`). No verifican nada real.
- B2 — `CI` ejecuta `pnpm build` dentro del job de lint (duplica build).
- B3 — `secrets`/PII: `ESTADO_ACTUAL_PROYECTO.md` y docs varias podrían contener
  datos sensibles; revisar antes de hacer público el repo.
- B4 — Naming mixto ES/EN en modelos y respuestas (`priceRange` vs `price_range`).

---

## Refactorizaciones aplicadas (resumen de diffs)

| Archivo | Cambio |
|---|---|
| `api/views_reservations.py` | `atomic` en create+cancel, tz-aware, idempotencia cancelación |
| `api/models.py` | emails vía `transaction.on_commit` |
| `api/emails.py` | `escape()` en todo dato de usuario |
| `api/views_auth.py` | `hmac.compare_digest` en códigos de staff |
| `api/views_chat.py` | validación/acotado de `message` e `history` |

## Verificación
- Baseline: 103 tests OK.
- Tras cambios: re-ejecución de `python manage.py test tests api.tests`.

## Score técnico (1-10)
- Seguridad: 5 → 6.5 (tras fixes) · Arquitectura: 5 · Rendimiento: 5
- Escalabilidad: 4 (SQLite) · Mantenibilidad: 6 · Calidad código: 6
- Preparación producción: 4.5 → 5.5
