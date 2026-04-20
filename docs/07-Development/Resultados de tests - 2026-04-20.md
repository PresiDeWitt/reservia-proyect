# Resultados de tests - 20/04/2026 (actualizado)

## Resumen ejecutivo

Estado general: Aprobado.

- Backend: 40/40 tests OK.
- Frontend: 28/28 tests OK.
- Total: 68/68 tests OK.
- Fallos: 0.

Estado de seguridad automatizada:

- `python manage.py check --deploy`: sin warnings.
- `python -m bandit -r backend/api backend/reservia -x backend/api/migrations -ll -ii`: 0 issues.
- `npm audit --omit=dev --audit-level=moderate`: 0 vulnerabilidades.
- `npm audit --audit-level=moderate`: 0 vulnerabilidades.

## 0) Problemas encontrados y solucionados

Se corrigieron y validaron los siguientes hallazgos:

1. Hardening de Django en despliegue:
   - Problema detectado: warnings `security.W004`, `W008`, `W009`, `W012`, `W016` y `staticfiles.W004`.
   - Solucion aplicada: endurecimiento de `settings.py` con HSTS, SSL redirect, cookies seguras, `SECURE_PROXY_SSL_HEADER`, `X_FRAME_OPTIONS`, `SECRET_KEY` robusta y rutas estaticas condicionales.
   - Resultado: `check --deploy` limpio.

2. Riesgo de fuerza bruta/abuso en endpoints publicos:
   - Problema detectado: sin rate limiting especifico en register/login/chat.
   - Solucion aplicada: throttling por IP con scopes dedicados (`register`, `login`, `chat`) y aplicacion en vistas sensibles.
   - Resultado: test de seguridad backend valida respuestas `429 Too Many Requests` en login y chat.

3. Vulnerabilidades en dependencias frontend:
   - Problema detectado: `npm audit` reportaba 4 vulnerabilidades (1 moderada, 3 altas).
   - Solucion aplicada: `npm audit fix` y actualizacion de arbol de dependencias.
   - Resultado: auditoria dev y runtime en 0 vulnerabilidades.

4. Ruido en pruebas por rutas estaticas inexistentes:
   - Problema detectado: avisos locales por `frontend/dist/assets` y staticfiles.
   - Solucion aplicada: configuracion condicional de `STATICFILES_DIRS`/`WHITENOISE_ROOT` y creacion de `STATIC_ROOT`.
   - Resultado: ejecucion backend sin warnings de staticfiles.

## 1) Resultado backend

Comandos ejecutados:

```powershell
python manage.py check --deploy
python manage.py test tests --verbosity 1
```

Resultado:

- `check --deploy`: System check identified no issues (0 silenced).
- Tests detectados: 40
- Tests ejecutados: 40
- Tiempo total: 53.082 s
- Estado: OK

Salida clave:

```text
Found 40 test(s).
Ran 40 tests in 53.082s
OK
```

## 2) Resultado frontend

Comandos ejecutados:

```powershell
npm run test:run
npm audit --omit=dev --audit-level=moderate
npm audit --audit-level=moderate
npm ls vite
```

Resultado:

- Test files: 8/8 OK
- Tests: 28/28 OK
- Tiempo total: 15.18 s
- Runtime audit: 0 vulnerabilidades
- Dev audit: 0 vulnerabilidades
- Vite instalado tras fix: `7.3.2`

Salida clave:

```text
Test Files  8 passed (8)
Tests       28 passed (28)
Duration    15.18s
found 0 vulnerabilities
vite@7.3.2
```

## 3) Que se prueba ahora

### Backend

Cobertura validada:

- Auth/JWT (register, login, refresh).
- Reservas (creacion, consulta propia, cancelacion con control de propietario).
- Restaurantes (listado, filtros, detalle, cocinas).
- Modelos y serializers.
- Smoke de endpoints criticos.
- Seguridad de abuso: throttling en login y chat con validacion de `429`.

### Frontend

Cobertura validada:

- Contexto de autenticacion (hidratacion, login, logout).
- Componentes clave (CategoryCard, RestaurantCard).
- Flujos de Home/Header/MyBookings.
- Wrappers de API (auth, restaurants, reservations).

## 4) Seguridad: estado por riesgo

Ataque o riesgo | Estado actual | Evidencia | Comentario
--- | --- | --- | ---
Broken Access Control / IDOR en reservas | Cubierto | Tests de cancelacion y lectura por usuario | Validado: un usuario no puede operar sobre reservas de otro.
Autenticacion JWT y ciclo de token | Cubierto | Tests backend de login/register/refresh + frontend | Flujo principal validado.
Fuerza bruta de login | Mitigado | Throttle por IP + test `429` | Scope `login` activo en endpoint.
Abuso de endpoint de chat | Mitigado | Throttle por IP + test `429` | Scope `chat` activo en endpoint.
Hardening HTTPS/cookies seguras | Mitigado | `check --deploy` sin issues | HSTS, SSL redirect y cookies seguras configurables por entorno.
Dependencias frontend runtime | Cubierto | `npm audit --omit=dev` | 0 vulnerabilidades.
Dependencias frontend dev | Cubierto | `npm audit` | 0 vulnerabilidades tras `audit fix`.
SQL Injection | Mitigado parcialmente | ORM Django | Falta bateria ofensiva dedicada SQLi.
XSS | Mitigado parcialmente | Escape por defecto de React | Falta CSP explicita y casos ofensivos dedicados.
CSRF | Parcial | CSRF middleware + token Bearer | Recomendable ampliar pruebas de escenario mixto cookie/token.
Clickjacking | Mitigado | `X_FRAME_OPTIONS='DENY'` | Endurecido en settings.

## 5) Veredicto claro

Los problemas detectados en esta fase han sido corregidos y validados con ejecuciones reales.

El sistema queda en estado apto para despliegue controlado con una base solida de seguridad tecnica y calidad automatizada.

Riesgos residuales recomendados para siguiente iteracion:

- añadir pruebas ofensivas dedicadas para SQLi/XSS/CSRF,
- definir y validar una politica CSP explicita,
- mantener auditoria recurrente de dependencias en CI.

## 6) Conclusion

La remediacion solicitada queda completada:

- Se corrigieron los hallazgos de hardening y throttling.
- Se resolvieron las vulnerabilidades detectadas por `npm audit`.
- Se documentaron resultados con evidencia antes/despues.
- Se validaron pruebas backend y frontend sin regresiones.
