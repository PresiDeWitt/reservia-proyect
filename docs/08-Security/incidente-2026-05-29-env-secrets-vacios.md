# Incidente — 502 en producción por `.env` sobrescrito con secrets vacíos

**Fecha:** 2026-05-29
**Severidad:** crítica (producción caída)
**Estado:** causa raíz identificada; fix de prevención en rama `hotfix/deploy-env-secrets-guard`; recuperación del servicio **pendiente** de decisión sobre `FIELD_ENCRYPTION_KEY`.

## Síntoma
`https://reservia.website/` cargaba (200) pero todas las llamadas a `/api/*` devolvían **502 Bad Gateway** (emitido por el nginx del contenedor frontend). El frontend estaba vivo; el backend no.

## Diagnóstico
- `reservia-backend-1` en estado **Restarting (1)** (crash-loop, exit 1). No era OOM (2.6 GB libres) ni disco (34 %).
- Logs del backend:
  ```
  RuntimeError: SECRET_KEY environment variable is required.
  ```
  `settings.py` aborta en arranque porque `SECRET_KEY` (y en prod también `FIELD_ENCRYPTION_KEY`) estaban vacíos.
- `/opt/reservia/.env` (151 bytes, modificado el mismo día 12:32) tenía **todas las claves presentes pero con valor vacío**.

## Causa raíz
Commit **`b46447b`** — *"fix(deploy): write .env on server from GitHub secrets (#16)"* (autor: Alejandro <alexchaconortega@gmail.com>, 2026-05-29 10:14) — modificó `.github/workflows/deploy.yml` para que el paso *Deploy via SSH* **regenere `/opt/reservia/.env`** en cada despliegue a partir de GitHub Secrets:
```bash
cat > .env <<ENVFILE
SECRET_KEY=${SECRET_KEY}
FIELD_ENCRYPTION_KEY=${FIELD_ENCRYPTION_KEY}
...
ENVFILE
```
Pero **los secrets referenciados no estaban definidos** en el repositorio. `gh secret list` solo contenía: `OPENROUTER`, `SSH_HOST`, `SSH_PORT`, `SSH_PRIVATE_KEY`, `SSH_USER`, `VITE_GOOGLE_CLIENT_ID`.

Faltaban (o tenían el nombre equivocado) **los 9** que escribe el workflow:
`SECRET_KEY`, `FIELD_ENCRYPTION_KEY`, `OPENROUTER_API_KEY` (existe como `OPENROUTER`),
`GOOGLE_CLIENT_ID` (existe como `VITE_GOOGLE_CLIENT_ID`), `ALLOWED_HOSTS`,
`CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `REDIS_URL`, `DB_PATH`.

Un secret inexistente en Actions interpola a cadena vacía; `set -u` no lo detecta (la variable *está* definida, solo vacía). Resultado: el deploy escribió un `.env` con todos los valores vacíos y machacó el `.env` que estaba **mantenido a mano en el servidor**.

Despliegues "success" que ejecutaron el borrado (todos en `main`): 11:25, 11:33, 12:14, 12:31.

## Verificación en repositorio/commits
- `.env` **siempre** estuvo en `.gitignore`; nunca se commiteó un `.env` con valores reales (solo placeholders de desarrollo).
- ➡️ Los valores originales **solo existían en el servidor** y no son recuperables desde git ni GitHub.

## Impacto en datos
BD: 9 usuarios, 3 reservas. Campos cifrados poblados: **3 teléfonos + 1 nota** (datos de prueba). No hay backup del `.env` en el servidor (`backups/` solo guarda la BD SQLite). El `FIELD_ENCRYPTION_KEY` original se considera **perdido** salvo que esté en registros personales del propietario.

## Remediación

### Prevención (aplicada en esta rama)
`deploy.yml` endurecido:
- **Aborta** el deploy si `SECRET_KEY` o `FIELD_ENCRYPTION_KEY` van vacíos (`: "${VAR:?}"`), antes de tocar el `.env`.
- **Backup** del `.env` previo (`.env.bak.<fecha>`, rota a 10) antes de regenerarlo.
- Escritura **atómica** (`.env.tmp` → `mv`) con `umask 077`.

### Acciones pendientes (operativas)
1. Definir en GitHub los secrets con los **nombres exactos** que usa el workflow:
   `SECRET_KEY`, `FIELD_ENCRYPTION_KEY`, `OPENROUTER_API_KEY`, `GOOGLE_CLIENT_ID`,
   `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `REDIS_URL`, `DB_PATH`.
2. Restaurar `/opt/reservia/.env` con valores válidos y `docker compose up -d --force-recreate backend`.
3. Decisión sobre `FIELD_ENCRYPTION_KEY`: usar el original (si aparece) o aceptar clave nueva
   (se pierden los 3 teléfonos + 1 nota cifrados; el resto intacto).

### Valores de infraestructura correctos (no secretos)
```
ALLOWED_HOSTS=reservia.website,www.reservia.website,localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=https://reservia.website,https://www.reservia.website
CSRF_TRUSTED_ORIGINS=https://reservia.website,https://www.reservia.website
DB_PATH=/data/db.sqlite3
REDIS_URL=redis://redis:6379/0
```

## Lecciones
- Nunca dejar que el pipeline regenere el `.env` sin **fail-fast** ante secrets ausentes.
- Mantener una copia segura (gestor de contraseñas) de `SECRET_KEY` y, sobre todo, de
  `FIELD_ENCRYPTION_KEY` (su pérdida es irreversible para los datos cifrados).
- Incluir el `.env` en una rutina de backup cifrado, no solo la BD.
