# Despliegue de producción en Hetzner — reservia.website

**Fecha:** 2026-05-24

## Problema

El proyecto no tenía pipeline de despliegue automatizado. Había tres bloqueantes para producción real:
1. `backend/Dockerfile` ejecutaba `seed --reset` en cada arranque, borrando toda la BD.
2. La imagen frontend solo generaba certificados self-signed para `localhost`; no servía para un dominio real.
3. No existía ningún workflow que llevara el código al servidor.

## Solución

Pipeline CI/CD de extremo a extremo usando GitHub Actions + GHCR + Caddy en servidor Hetzner:

```
push a main → CI (lint/tests/SAST) → build imágenes → GHCR → SSH al server → pull + restart
                                                                      ↓
                                                          Caddy (TLS Let's Encrypt)
                                                          reservia.website:443
```

## Qué se hizo

### Cambios en el repositorio (rama `feat/deploy-prod`)

| Archivo | Cambio |
|---|---|
| `backend/Dockerfile` | Eliminado `seed --reset` del CMD. Seed es ahora un comando manual inicial. |
| `frontend/Dockerfile` | Eliminados openssl y generación de certs self-signed. Solo expone puerto 80. |
| `frontend/nginx.conf` | Eliminado bloque SSL 443. Añadido `X-Forwarded-Proto` al proxy `/api`. |
| `Caddyfile` (nuevo) | Reverse proxy de Caddy para reservia.website + www con HTTPS automático. |
| `docker-compose.prod.yml` (nuevo) | Compose de producción que usa imágenes de GHCR en lugar de `build:`. Incluye servicio Caddy. |
| `.github/workflows/deploy.yml` (nuevo) | Pipeline: triggered por `workflow_run` tras CI exitoso en main + `workflow_dispatch` para deploys manuales. |
| `docs/infra/` (nuevo) | Esta documentación. |

### Configuración del servidor (manual, una sola vez)

Ver Fase 2 del plan. Resumen de lo que se aplicó al servidor 77.42.21.177:
- Usuario `deploy` con acceso SSH por clave (sin password).
- Docker + Compose plugin (repo oficial).
- Hardening sshd: `PasswordAuthentication no`, `PermitRootLogin prohibit-password`.
- UFW: solo puertos 22, 80, 443.
- fail2ban en sshd.
- `/opt/reservia/` con `docker-compose.prod.yml`, `Caddyfile`, `.env` (chmod 600).
- Primer arranque manual + seed inicial.
- Cron de backup SQLite diario.

### Secrets de GitHub (Settings → Secrets → Actions)

| Secret | Descripción |
|---|---|
| `SSH_HOST` | IP del servidor (77.42.21.177) |
| `SSH_USER` | Usuario deploy |
| `SSH_PORT` | Puerto SSH (por defecto 22) |
| `SSH_PRIVATE_KEY` | Clave privada de la deploy key (nunca compartir) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID para el build del frontend |

## Cómo funciona el pipeline

1. Push a `main` (mergeando un PR).
2. El workflow `CI - Lint, Unit Tests and SAST` corre automáticamente.
3. Si CI pasa, `Deploy to Production` se dispara vía `workflow_run`.
4. `build-push` job: construye y sube imágenes backend y frontend a GHCR (tagged `:latest` + `:sha`).
5. `deploy` job: SSH al servidor → `docker compose pull` + `up -d` + `image prune`.
6. Caddy continúa sirviendo tráfico durante el pull; los contenedores se reinician con zero-downtime (socket reuse de nginx/gunicorn).

**Rollback**: `workflow_dispatch` con el short-SHA deseado, o en el servidor:
```bash
docker compose -f docker-compose.prod.yml pull ghcr.io/presidewitt/reservia-backend:<sha>
# editar el .env o el compose para fijar el tag, luego up -d
```

## Riesgos y puntos a vigilar

- **SQLite en producción**: suficiente para tráfico bajo/medio. Si el tráfico crece, migrar a PostgreSQL (settings.py ya soporta `DATABASE_URL`). Los backups cron mitigan el riesgo de pérdida.
- **Caddy y Let's Encrypt**: Caddy necesita que el DNS esté propagado (`A reservia.website → 77.42.21.177`) antes del primer arranque para emitir el certificado. Verificar con `dig reservia.website` antes de `docker compose up -d`.
- **GHCR packages privados**: si el repositorio GitHub es privado, las imágenes GHCR serán privadas. El servidor necesita hacer `docker login ghcr.io` con un Personal Access Token read-only para poder hacer `pull`. Si el repo es público, las imágenes también lo serán por defecto tras el primer push.
- **Secrets en .env del servidor**: el `.env` en `/opt/reservia/.env` tiene permisos 600 y es propiedad del usuario deploy. Nunca se sube a git (está en .gitignore).
- **SSH key rotation**: si la deploy SSH key se ve comprometida, invalidarla en el servidor (`~deploy/.ssh/authorized_keys`) y actualizar el secret `SSH_PRIVATE_KEY` en GitHub.
