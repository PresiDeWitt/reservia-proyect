# 🚀 Despliegue Completo en Railway

Tu proyecto está listo para desplegar **TODO en Railway**: Frontend + Backend + Base de datos.

---

## 📋 Requisitos previos

1. Cuenta en [railway.app](https://railway.app)
2. Repositorio en GitHub
3. Proyecto pusheado a GitHub

---

## 🎯 Paso 1: Preparar tu repositorio

### Antes de anything, haz push a GitHub:

```bash
git add .
git commit -m "Setup for Railway deployment"
git push origin main
```

---

## 📱 Paso 2: Crear el proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz login / Sign up
3. Click en **New Project**
4. Selecciona **Deploy from GitHub**
5. Conecta tu repositorio GitHub
6. Busca tu repositorio `reservia-proyect` y selecciona
7. Railway detectará Django automáticamente ✨

---

## ⚙️ Paso 3: Agregar Base de Datos PostgreSQL

En el dashboard de Railway:

1. Click en **+ Create**
2. Selecciona **PostgreSQL**
3. Railway creará automáticamente una BD y la variable `DATABASE_URL`

---

## 🔐 Paso 4: Configurar Variables de Entorno

En el dashboard de Railway, ve a tu servicio web (el proyecto) y ve a **Variables**

Agrega estas variables:

```
SECRET_KEY = tu-clave-super-secreta-cambiar-esto
DEBUG = False
ALLOWED_HOSTS = *.railway.app,tu-dominio-personalizado.com
ANTHROPIC_API_KEY = sk-ant-tu-clave
CORS_ALLOWED_ORIGINS = https://tu-app.railway.app
VITE_API_URL = https://tu-app.railway.app
```

### Cómo generar una buena SECRET_KEY:

En tu terminal (cualquier lugar):
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

O simplemente:
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## 🌐 Paso 5: Configurar el dominio personalizado (Opcional)

Si quieres un dominio personalizado en lugar de `*.railway.app`:

1. En el dashboard, ve a tu servicio
2. Click en **Settings**
3. **Domain** → Agrega tu dominio
4. Sigue las instrucciones para configurar DNS en tu registrador

---

## ✅ Paso 6: Desplegar

Railway desplegará automáticamente cuando hagas push a GitHub.

Puedes ver el progreso en:
- Dashboard de Railway → Tu proyecto → **Logs**

El despliegue ejecutará:
1. `pip install -r requirements.txt`
2. `python manage.py migrate` (en la fase "release")
3. Inicia Gunicorn en el puerto que asigna Railway

---

## 🧪 Paso 7: Verificar que funciona

1. Ve a tu URL de Railway: `https://tu-app.railway.app`
2. Deberías ver tu aplicación React
3. Las llamadas a `/api/*` deben funcionar

Prueba en la consola del navegador:
```javascript
fetch('/api/endpoint-aqui')
  .then(r => r.json())
  .then(console.log)
```

---

## 🔄 Paso 8: Actualizar el frontend para producción

Si el dominio de tu app es diferente en desarrollo y producción, edita:

`frontend/.env.production`

Y actualiza:
```
VITE_API_URL = https://tu-app-exacta-url.railway.app
```

---

## 📊 Estructura del proyecto en Railway

```
tu-app.railway.app/
├── / (Frontend React desde 'frontend/dist')
├── /admin (Django admin)
└── /api/ (Backend API)
```

---

## 💡 Variables de Entorno Explicadas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SECRET_KEY` | Clave secreta de Django (IMPORTANTE) | `abc123...` |
| `DEBUG` | Modo debug (siempre False en prod) | `False` |
| `ALLOWED_HOSTS` | Dominios permitidos | `*.railway.app` |
| `DATABASE_URL` | URL de PostgreSQL (Railway la crea) | Auto |
| `ANTHROPIC_API_KEY` | Tu clave de Anthropic | `sk-ant-...` |
| `CORS_ALLOWED_ORIGINS` | URLs permitidas para CORS | Igual a tu dominio |
| `VITE_API_URL` | URL del API para el frontend | `https://tu-app.railway.app` |

---

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'psycopg2'"
- Ya está en `requirements.txt` como `psycopg2-binary`
- Reconstruye: En Railway → Tu servicio → **Deploy** → **Redeploy**

### Error: "ALLOWED_HOSTS doesn't match"
- Verifica que `ALLOWED_HOSTS` incluya tu dominio exacto
- Por ejemplo: si es `my-app.railway.app`, agrega `my-app.railway.app` a `ALLOWED_HOSTS`

### Error: "CORS error - request blocked"
- Asegúrate que `CORS_ALLOWED_ORIGINS` incluya `https://tu-app.railway.app`
- Recarga después de cambiar

### Error: "502 Bad Gateway"
- Ve a Logs en Railway
- Probablemente hay un error en Django (database, imports, etc.)
- Lee los logs para más detalles

### Error: "No such table: api_..."
- Significa que `python manage.py migrate` no corrió correctamente
- Ve a tu servicio en Railway → **Deploy** → Mira los logs de la fase "release"
- Posible solución: ejecuta manualmente en Railway (si es posible) o redeploy

### La página principal (/) no carga
- El frontend no se está sirviendo
- Verifica que existe `frontend/dist/` después del build
- Asegúrate que `Procfile` está correcto
- Posiblemente falte configuración de WhiteNoise

---

## 📈 Monitoreo

En el dashboard de Railway puedes ver:
- **Logs**: Lo que está pasando en tiempo real
- **Metrics**: CPU, memoria, requests
- **Monitoring**: Uptime y performance

---

## 🔄 Redeploys

Si haces cambios:

1. **Cambios en código**:
   ```bash
   git add .
   git commit -m "Tu mensaje"
   git push origin main
   ```
   Railway desplegará automáticamente.

2. **Solo cambios en variables de entorno**:
   - Ve a Railway → Tu servicio
   - **Deploy** → **Redeploy** (sin cambios de código)

3. **Cambios en requirements.txt**:
   - Push normalmente
   - Railway reinstalará automáticamente

---

## 📞 ¿Problemas?

Si algo no funciona:

1. Revisa los **Logs** en Railway (muy importante)
2. Verifica las **Variables de Entorno**
3. Verifica que `requirements.txt` tiene lo necesario
4. Asegúrate que `Procfile` es correcto
5. Revisa que `settings.py` carga variables de entorno correctamente

Railway es increíblemente fácil una vez que todo está configurado. ¡Buena suerte! 🚀

