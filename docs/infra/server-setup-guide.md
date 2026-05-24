# Guía de setup del servidor Hetzner — reservia.website

> Ejecuta estos comandos conectado como root via SSH.
> Sugerencia: escribe `! ssh -i ~/.ssh/hetzner_key root@77.42.21.177` en el prompt de Claude Code para abrir una sesión que aparezca en el chat, o abre una terminal separada.
>
> **NUNCA cierres la sesión SSH hasta confirmar que la nueva key funciona.**

---

## Paso 1 — Actualizar el sistema

```bash
apt update && apt upgrade -y && apt install -y curl gnupg ufw fail2ban unattended-upgrades
```

---

## Paso 2 — Instalar Docker (repo oficial)

```bash
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sh /tmp/get-docker.sh
```

Verificar:
```bash
docker --version
docker compose version
```

---

## Paso 3 — Crear usuario `deploy`

```bash
# Crear usuario sin password interactivo
useradd -m -s /bin/bash deploy

# Añadirlo al grupo docker (puede ejecutar docker sin sudo)
usermod -aG docker deploy

# Crear directorio SSH
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
```

Añadir la clave pública de GitHub Actions (deploy key):
```bash
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK7uspHiLABChQx/feom87iO3HK1KRRdEXRZ3ZZ9kbED github-actions-reservia-deploy" >> /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

---

## Paso 4 — Preparar /opt/reservia

```bash
mkdir -p /opt/reservia/backups
chown -R deploy:deploy /opt/reservia
```

Copiar los archivos del repo (docker-compose.prod.yml y Caddyfile). Tienes dos opciones:

**Opción A — scp desde tu máquina Windows** (en PowerShell/CMD local, no en el server):
```powershell
scp -i C:\Users\alexc\.ssh\hetzner_key `
  C:\Users\alexc\Downloads\vscode\reservia-proyect\reservia-proyect\docker-compose.prod.yml `
  C:\Users\alexc\Downloads\vscode\reservia-proyect\reservia-proyect\Caddyfile `
  root@77.42.21.177:/opt/reservia/
```

**Opción B — git clone** (si el repo es público o tienes deploy key de lectura):
```bash
cd /opt
git clone https://github.com/PresiDeWitt/reservia-proyect.git reservia-repo
cp reservia-repo/docker-compose.prod.yml /opt/reservia/
cp reservia-repo/Caddyfile /opt/reservia/
```

---

## Paso 5 — Crear el archivo .env de producción

```bash
cat > /opt/reservia/.env << 'ENVEOF'
# REEMPLAZA todos los valores entre < >
SECRET_KEY=<genera-una-con: python3 -c "import secrets; print(secrets.token_urlsafe(50))">
DEBUG=False
ALLOWED_HOSTS=reservia.website,www.reservia.website
CORS_ALLOWED_ORIGINS=https://reservia.website,https://www.reservia.website
CSRF_TRUSTED_ORIGINS=https://reservia.website,https://www.reservia.website
SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=0
DB_PATH=/data/db.sqlite3
REDIS_URL=redis://redis:6379/0
OPENROUTER_API_KEY=<tu-openrouter-key>
GOOGLE_CLIENT_ID=<tu-google-client-id>
STAFF_OWNER_CODE=<tu-owner-code>
STAFF_ADMIN_CODE=<tu-admin-code>
ENVEOF

chmod 600 /opt/reservia/.env
chown deploy:deploy /opt/reservia/.env
```

> **Importante**: genera una clave con `python3 -c "import secrets; print(secrets.token_urlsafe(50))"` en el server y úsala. Nunca uses la misma key de dev ni la compartas.

---

## Paso 6 — Configurar login GHCR en el servidor

Si el repositorio GitHub es **privado**, las imágenes GHCR también lo son. El servidor necesita autenticarse para hacer `docker pull`.

Crea un [Personal Access Token](https://github.com/settings/tokens) con scope `read:packages` y guárdalo:

```bash
# Como usuario root (una sola vez)
echo "<TU_PAT_GHCR>" | docker login ghcr.io -u PresiDeWitt --password-stdin
```

Si el repo es **público**: las imágenes serán públicas automáticamente tras el primer push del pipeline. No necesitas login.

---

## Paso 7 — Primer arranque (ANTES de endurecer SSH)

Probar que todo funciona mientras aún tienes acceso root por password:

```bash
# Como root, en /opt/reservia
cd /opt/reservia
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f --tail=50
```

Esperar ~30s para que Caddy emita el certificado Let's Encrypt (necesita DNS propagado).

Verificar en tu navegador: `https://reservia.website` debe cargar con candado verde.

Seed inicial (solo una vez):
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py seed
```

---

## Paso 8 — ⚠️ HARDENING SSH (PELIGROSO — confirmar antes de ejecutar)

> **CRÍTICO**: Abre una SEGUNDA sesión SSH antes de ejecutar este bloque.
> Si algo falla, la segunda sesión te salva de quedarte fuera.

```bash
# Editar config SSH
cat >> /etc/ssh/sshd_config << 'SSHEOF'

# ReserVia hardening — 2026-05-24
PasswordAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
SSHEOF

# Validar sintaxis antes de aplicar
sshd -t && echo "Config SSH válida"
```

Si dice "Config SSH válida", aplicar:
```bash
systemctl reload sshd
```

Desde la SEGUNDA sesión (nueva terminal), verificar que todavía puedes conectar:
```bash
ssh -i ~/.ssh/hetzner_key root@77.42.21.177 "echo OK"
```

Si funciona, ya puedes cerrar la primera sesión.

> Después puedes cambiar la password de root con `passwd` (o dejarla solo como fallback en consola Hetzner).

---

## Paso 9 — ⚠️ Firewall UFW (confirmar antes de enable)

```bash
# Añadir reglas ANTES de activar
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp

# Verificar las reglas antes de activar
ufw status numbered

# Activar (confirmar con 'y')
ufw enable

# Verificar estado final
ufw status
```

---

## Paso 10 — fail2ban

```bash
# Verificar que está corriendo
systemctl status fail2ban

# Si no está activo
systemctl enable --now fail2ban
```

La config por defecto protege sshd. Suficiente para empezar.

---

## Paso 11 — Backup automático de SQLite

```bash
cat > /opt/reservia/backup-db.sh << 'BKEOF'
#!/bin/bash
set -euo pipefail
DATE=$(date +%Y-%m-%d)
docker run --rm \
  -v reservia_db_data:/data:ro \
  -v /opt/reservia/backups:/backups \
  alpine \
  sh -c "cp /data/db.sqlite3 /backups/db-${DATE}.sqlite3"
# Borrar backups de más de 7 días
find /opt/reservia/backups -name "db-*.sqlite3" -mtime +7 -delete
BKEOF

chmod +x /opt/reservia/backup-db.sh
chown deploy:deploy /opt/reservia/backup-db.sh

# Cron: backup diario a las 3am
echo "0 3 * * * deploy /opt/reservia/backup-db.sh >> /var/log/reservia-backup.log 2>&1" > /etc/cron.d/reservia-backup
```

---

## Paso 12 — Secrets en GitHub

Ve a: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Valor |
|---|---|
| `SSH_HOST` | `77.42.21.177` |
| `SSH_USER` | `deploy` |
| `SSH_PORT` | `22` |
| `SSH_PRIVATE_KEY` | Contenido de `C:\Users\alexc\.ssh\reservia_deploy_key` (la clave privada generada) |
| `VITE_GOOGLE_CLIENT_ID` | Tu Google OAuth Client ID |

La clave privada está en: `C:\Users\alexc\.ssh\reservia_deploy_key`

Para verla en PowerShell:
```powershell
Get-Content C:\Users\alexc\.ssh\reservia_deploy_key
```

---

## Verificación final

```bash
# DNS
dig reservia.website A +short     # debe devolver 77.42.21.177

# Estado contenedores
docker compose -f /opt/reservia/docker-compose.prod.yml ps

# Cert TLS
curl -I https://reservia.website/api/health/   # HTTP/2 200, cert válido

# Puertos abiertos
ufw status
ss -tlnp | grep -E ':80|:443|:22'
```
