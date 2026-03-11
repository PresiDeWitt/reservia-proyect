# ⚡ Railway: Quick Start (5 minutos)

## 1️⃣ Push a GitHub
```bash
git add .
git commit -m "Setup Railway deployment"
git push origin main
```

## 2️⃣ En railway.app
1. **New Project** → Import from GitHub
2. Selecciona `reservia-proyect`
3. Railway configura todo automáticamente ✨

## 3️⃣ Agregar Base de Datos
- **+ Create** → **PostgreSQL**
- Railway crea `DATABASE_URL` automáticamente

## 4️⃣ Configurar Variables de Entorno
Ve a tu servicio web → **Variables** → Agrega:

```
SECRET_KEY = [genera con: python -c "import secrets; print(secrets.token_urlsafe(50))"]
DEBUG = False
ALLOWED_HOSTS = *.railway.app,tu-dominio.com
ANTHROPIC_API_KEY = sk-ant-tu-clave
CORS_ALLOWED_ORIGINS = https://tu-app.railway.app
VITE_API_URL = https://tu-app.railway.app
```

## 5️⃣ Desplegar
- Railway despliega automáticamente cuando haces push
- Ve a **Logs** para ver el progreso

## 6️⃣ ✅ Listo
- Frontend: `https://tu-app.railway.app`
- Backend API: `https://tu-app.railway.app/api/`
- Admin: `https://tu-app.railway.app/admin/`

---

**¿Problemas?** Lee `RAILWAY_SETUP.md` para troubleshooting completo.
