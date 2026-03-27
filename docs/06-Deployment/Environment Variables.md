---
tags: [reservia, deployment, environment, configuration, secrets]
---

# Environment Variables

[[Home|← Volver al Home]]

## Overview

Reservia requiere variables de entorno tanto para el backend (Django) como para el frontend (Vite). El archivo `.env.example` contiene la plantilla completa.

---

## 🔑 Backend Variables

**Archivo de referencia**: `.env.example`
**Archivo real**: `.env` (no incluido en git)

| Variable | Requerida | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `SECRET_KEY` | ✅ | Clave secreta Django | `django-insecure-...` |
| `DEBUG` | ✅ | Modo debug | `False` (producción) |
| `ALLOWED_HOSTS` | ✅ | Hosts permitidos | `localhost,*.railway.app` |
| `DATABASE_URL` | ⚡ | URL PostgreSQL (solo producción) | `postgresql://user:pass@host/db` |
| `CORS_ALLOWED_ORIGINS` | ✅ | Origins CORS permitidos | `http://localhost:5173` |
| `ANTHROPIC_API_KEY` | ✅ | Clave API de Anthropic | `sk-ant-api03-...` |
| `DB_PATH` | ❌ | Ruta SQLite (Docker) | `/data/db.sqlite3` |

### Archivo `.env` completo

```env
# Django
SECRET_KEY=django-insecure-your-secret-key-here-change-in-production
DEBUG=True

# Hosts permitidos (separados por coma)
ALLOWED_HOSTS=localhost,127.0.0.1,backend,*.railway.app,*.onrender.com

# Base de datos (omitir en desarrollo para usar SQLite)
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Docker (opcional)
DB_PATH=/data/db.sqlite3
```

---

## 🖥️ Frontend Variables

**Archivo de referencia**: `frontend/.env.production`
**Para desarrollo**: `frontend/.env.local` (crear manualmente)

| Variable | Descripción | Dev | Producción |
|----------|-------------|-----|-----------|
| `VITE_API_URL` | URL base del backend | `http://localhost:8000` | `https://reservia.up.railway.app` |

> [!info] Prefijo VITE_
> Vite solo expone al cliente las variables que empiezan con `VITE_`. Otras variables son solo de build.

---

## ⚙️ Cómo Django usa las variables

```python
# backend/reservia/settings.py
import os
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-insecure-key')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')

# DB: PostgreSQL si DATABASE_URL existe, si no SQLite
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.config(default=DATABASE_URL)}
else:
    DB_PATH = os.environ.get('DB_PATH', BASE_DIR / 'db.sqlite3')
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': DB_PATH,
        }
    }

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
```

---

## 🔐 Seguridad

> [!danger] Nunca commitear secretos
> El archivo `.env` está en `.gitignore`. Nunca incluyas credenciales reales en el repositorio.

> [!warning] SECRET_KEY en producción
> La `SECRET_KEY` de Django debe ser única, larga y aleatoria en producción. Nunca usar la de desarrollo.

**Para generar una SECRET_KEY segura**:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## 🚀 Variables en Railway

En Railway, las variables se configuran en el dashboard del proyecto:
- `SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS=*.railway.app`
- `DATABASE_URL` (autogenerado por Railway si usas su PostgreSQL)
- `ANTHROPIC_API_KEY`
- `CORS_ALLOWED_ORIGINS=https://tu-dominio.railway.app`

Ver [[Railway Deployment]] para más detalles.

---

## 🔗 Links Relacionados

- [[Docker Setup]] — Cómo se inyectan en Docker
- [[Railway Deployment]] — Variables en producción
- [[Local Setup]] — Setup del `.env` en desarrollo
