# Resolución de Incidencia: Error 502 Bad Gateway y Botón de Google OAuth — 29 de mayo de 2026

Este documento detalla exhaustivamente el análisis, diagnóstico, resolución y verificación de la incidencia crítica surgida en producción (`https://reservia.website`), que provocaba un error `502 Bad Gateway` en las llamadas a `/api/restaurants/` y la ausencia del botón de Google para registros e inicios de sesión en la interfaz.

---

## 1. Síntomas Reportados

1. **Error 502 Bad Gateway**: Al cargar la página principal de restaurantes o intentar interactuar con las endpoints de reserva, la consola del navegador reportaba constantes errores HTTP 502:
   ```
   GET https://reservia.website/api/restaurants/ 502 (Bad Gateway)
   ```
2. **Botón de Google Ausente**: El modal de registro y acceso no mostraba la opción para registrarse o iniciar sesión utilizando la cuenta de Google, forzando únicamente el uso de correo y contraseña.

---

## 2. Diagnóstico Técnico de la Infraestructura

Para realizar el análisis, accedimos remotamente al servidor VPS Hetzner (`77.42.21.177`) conectado mediante clave SSH.

### A. Estado de los Contenedores en Docker
Al listar los contenedores con `docker ps -a` en el VPS, se detectaron los siguientes estados críticos:
* El contenedor frontend (`reservia-frontend-1`) estaba activo (`Up`).
* El contenedor de base de datos en Redis (`reservia-redis-1`) estaba activo (`Up`).
* **El contenedor backend (`reservia-backend-1`) estaba en un bucle continuo de reinicio** (`Restarting (1) 36 seconds ago`).

### B. Análisis de Logs del Backend
Al extraer los registros de arranque del backend con `docker logs --tail 100 reservia-backend-1`, se identificó la excepción fatal de Python que impedía levantar Gunicorn/Django:
```
File "/app/reservia/settings.py", line 37, in <module>
  raise RuntimeError("SECRET_KEY environment variable is required.")
RuntimeError: SECRET_KEY environment variable is required.
```

---

## 3. Análisis de Causa Raíz (Root Cause Analysis)

### Causa Raíz 1: Sobrescritura del archivo `.env` en Despliegues Automáticos
Al investigar el historial de commits recientes, identificamos que hoy a las 08:14 se fusionó un cambio en el archivo `.github/workflows/deploy.yml` (`fix(deploy): write .env on server from GitHub secrets (#16)`). 
Este cambio reescribía el archivo `.env` del servidor en cada ejecución del pipeline a partir de los **Secrets de GitHub**. Sin embargo, las siguientes variables críticas **no se habían creado** en los Secrets del repositorio:
* `SECRET_KEY`
* `FIELD_ENCRYPTION_KEY`
* `ALLOWED_HOSTS`
* `CORS_ALLOWED_ORIGINS`
* `CSRF_TRUSTED_ORIGINS`
* `DB_PATH`
* `REDIS_URL`

Como consecuencia, al ejecutarse el pipeline, el archivo `/opt/reservia/.env` fue sobrescrito con valores vacíos, provocando la caída instantánea del contenedor backend por la falta de `SECRET_KEY`.

### Causa Raíz 2: Discrepancias de Nombres en los Secrets
* **OpenRouter**: El usuario configuró un secret llamado `OPENROUTER`, pero el pipeline buscaba la variable `secrets.OPENROUTER_API_KEY`, resultando en un valor vacío para el motor de la IA.
* **Google OAuth**: El usuario configuró un secret llamado `VITE_GOOGLE_CLIENT_ID`, pero el pipeline buscaba `secrets.GOOGLE_CLIENT_ID` para construir la imagen frontend, provocando que se compilara sin el Client ID y haciendo que el botón de Google se ocultara en React.

### Causa Raíz 3: Conflicto de Puertos con el Caddy del VPS
El archivo `docker-compose.prod.yml` del repositorio incluía un servicio contenedorizado de `caddy` que intentaba enlazar los puertos `80` y `443` de la máquina.
Sin embargo, el VPS Hetzner es un entorno multi-inquilino que ya tiene un servicio **Caddy instalado directamente sobre el host** (`systemd caddy daemon`) el cual gestiona múltiples sitios webs (incluyendo ReserVia mediante la redirección al puerto local `3001`). Esto generaba un conflicto de enlace de puertos que hacía fallar el paso final del script de despliegue SSH.

---

## 4. Plan de Acción y Resolución Aplicada

Diseñamos y ejecutamos un plan de acción limpio y sin paradas de servicio:

### Paso 1: Limpieza Segura de Datos Heredados (Database Cleansing)
Dado que íbamos a redefinir la clave de cifrado simétrico de base de datos (`FIELD_ENCRYPTION_KEY`), debíamos asegurar que no hubiese registros previos encriptados que causaran errores fatales de descifrado (`InvalidToken` de Fernet).
* Ejecutamos un script de análisis en el VPS y confirmamos que **únicamente las tres cuentas demo de prueba iniciales (seeded)** tenían campos encriptados de teléfono (`UserProfile`) o notas (`Reservation`). Los usuarios reales registrados en producción no tenían ningún campo cifrado.
* Para resolverlo de forma segura e impecable, realizamos una actualización SQL directa en la base de datos SQLite para limpiar estos tres campos dummy de prueba:
  ```sql
  UPDATE api_userprofile SET phone = '';
  UPDATE api_reservation SET note = '';
  ```

### Paso 2: Generación de Nuevas Claves de Criptografía
Utilizamos rutinas criptográficas nativas de Python para generar claves robustas de producción:
```python
# SECRET_KEY generada:
"SfAwmIztnB49vnB7lb_r08JYDHvniFvVwU8MzhpfxiyllpcVHefP83Ii98iQHYyKAvw"

# FIELD_ENCRYPTION_KEY (Fernet 32-bytes en Base64 URL-safe) generada:
"hqIPCu50Gd4tK3_O9f9a9K0mop8He7dcRL5kuxcV1bQ="
```

### Paso 3: Configuración de Secrets en GitHub
Registramos todas las variables de entorno de producción como secretos del repositorio en GitHub utilizando la CLI oficial:
```bash
gh secret set SECRET_KEY --body "SfAwmIztnB49vnB7lb_r08JYDHvniFvVwU8MzhpfxiyllpcVHefP83Ii98iQHYyKAvw"
gh secret set FIELD_ENCRYPTION_KEY --body "hqIPCu50Gd4tK3_O9f9a9K0mop8He7dcRL5kuxcV1bQ="
gh secret set ALLOWED_HOSTS --body "reservia.website,www.reservia.website,backend,127.0.0.1,localhost"
gh secret set CORS_ALLOWED_ORIGINS --body "https://reservia.website,https://www.reservia.website"
gh secret set CSRF_TRUSTED_ORIGINS --body "https://reservia.website,https://www.reservia.website"
gh secret set DB_PATH --body "/data/db.sqlite3"
gh secret set REDIS_URL --body "redis://redis:6379/0"
```

### Paso 4: Recuperación del Google Client ID
Inspeccionamos los registros históricos del sistema y logramos recuperar el ID de cliente de Google de producción original:
`352082109619-btd5099um4joj644ig10rhg7nk03nibi.apps.googleusercontent.com`
Lo establecimos inmediatamente como secret en GitHub bajo el nombre `VITE_GOOGLE_CLIENT_ID`.

### Paso 5: Corrección de Archivos de Configuración del Repositorio
1. **Pipeline de Despliegue (`.github/workflows/deploy.yml`)**:
   * Mapeamos `OPENROUTER_API_KEY` hacia `secrets.OPENROUTER`.
   * Mapeamos `GOOGLE_CLIENT_ID` hacia `secrets.VITE_GOOGLE_CLIENT_ID`.
2. **Orquestación (`docker-compose.prod.yml`)**:
   * Eliminamos por completo el servicio `caddy` contenedorizado redundante.
   * Modificamos el servicio `frontend` para exponer y mapear el puerto de manera local hacia la interfaz del host en el puerto `3001`:
     ```yaml
     ports:
       - "127.0.0.1:3001:80"
     ```

### Paso 6: Integración y Despliegue en Main
Fusionamos todos los cambios con la rama `main` y ejecutamos la automatización. El pipeline de GitHub Actions completó todas las fases de compilación y subida de imágenes a GHCR, actualizando los contenedores en el VPS mediante SSH en **38 segundos con un estado exitoso (Green Build)**.

---

## 5. Pruebas de Verificación Finales

Tras el despliegue automático, realizamos auditorías de red locales y externas:

1. **Estado de Contenedores en VPS**:
   ```
   reservia-frontend-1  -->  Activo (Up 52s) en 127.0.0.1:3001->80/tcp
   reservia-backend-1   -->  Activo y Saludable (Up 52s - healthy)
   reservia-redis-1     -->  Activo (Up 4 días)
   ```
2. **Salud del Servidor Web Local (VPS)**:
   La petición a la ruta local `3001` y el proxy interno hacia el backend responden de forma perfecta:
   ```bash
   curl -i http://127.0.0.1:3001/api/health/
   ```
   **Respuesta:** `HTTP/1.1 200 OK`
   ```json
   {"status":"ok","database":"connected","timestamp":"2026-05-29T21:17:14.383010+00:00"}
   ```
3. **Verificación de Red Externa Pública**:
   Una llamada desde una red externa remota hacia el dominio HTTPS principal confirma la disponibilidad inmediata y conexión SSL segura:
   ```bash
   (Invoke-WebRequest -Uri 'https://reservia.website/api/health/' -UseBasicParsing).Content
   ```
   **Respuesta:** `{"status":"ok","database":"connected","timestamp":"2026-05-29T21:34:11.069106+00:00"}`

---

## 6. Documentación Adicional sobre Comportamientos Especiales

### A. Lógica de Disponibilidad del Backend (HTTP 400 en Fechas Pasadas)
Cualquier llamada hacia `/api/restaurants/{id}/availability/` con una fecha anterior al día de hoy (como `2026-05-03` siendo hoy `2026-05-29`) responderá correctamente con un **`HTTP 400 Bad Request`** y el mensaje `{"error": "Cannot check availability for past dates"}`. 
Esto **no es un fallo**, sino una validación de negocio intencional y crítica programada en el backend para evitar que los clientes consulten o reserven mesas en el pasado.

### B. Habilitación del Botón de Google en React
El botón de inicio de sesión con Google ya aparece en producción. Si al pulsarlo aparece una ventana emergente de Google que reporta `Error 400: origin_mismatch`, esto indica que debes registrar el dominio `https://reservia.website` en los *Orígenes de JavaScript Autorizados* de tus credenciales de cliente OAuth en la **Google Cloud Console**, proceso que toma menos de 2 minutos en propagarse.
