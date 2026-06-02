---
tags:
  - reservia
  - deployment
  - env
  - config
---

# 🔑 Environment Variables

[[Home|← Volver al Home]]

---

## 🌊 Visión General

Reservia requiere variables de entorno tanto para el ==backend (Django)== como para el ==frontend (Vite)==. El archivo .env.example contiene la plantilla completa.

---

## 🐍 Variables del Backend

> [!info] 🔐 Seguridad y Autenticación
>
> | Variable | Requerida | Descripción |
> |----------|:---------:|-------------|
> | SECRET_KEY | ✅ | Clave secreta de Django para firmas criptográficas |
> | OPENROUTER_API_KEY | ✅ | Clave API de OpenRouter para el chatbot IA |
>
> **Ejemplo SECRET_KEY:** django-insecure-... (==cambiar en producción==)
> **Ejemplo OPENROUTER_API_KEY:** sk-or-...

> [!info] 🌐 Red y Hosts
>
> | Variable | Requerida | Descripción |
> |----------|:---------:|-------------|
> | DEBUG | ✅ | Modo debug — ==False en producción== |
> | ALLOWED_HOSTS | ✅ | Hosts permitidos separados por coma |
> | CORS_ALLOWED_ORIGINS | ✅ | Origins CORS permitidos |
>
> **Ejemplo ALLOWED_HOSTS:** localhost,127.0.0.1,*.railway.app
> **Ejemplo CORS:** http://localhost:5173,http://localhost:3000

> [!info] 🗄️ Base de Datos
>
> | Variable | Requerida | Descripción |
> |----------|:---------:|-------------|
> | DATABASE_URL | ⚡ Solo prod | URL de conexión PostgreSQL |
> | DB_PATH | ❌ Opcional | Ruta personalizada para SQLite (Docker) |
>
> **Lógica:** Si ==DATABASE_URL== existe → usa PostgreSQL. Si no → usa SQLite local.
> **Ejemplo DATABASE_URL:** postgresql://user:pass@host:5432/dbname

---

## 🖥️ Variables del Frontend

> [!info] ⚡ Vite Environment
>
> | Variable | Dev | Producción |
> |----------|-----|-----------|
> | VITE_API_URL | http://localhost:8000 | https://reservia.up.railway.app |
>
> ==Solo las variables con prefijo VITE_ son accesibles en el cliente.== Las demás solo están disponibles durante el build.
>
> **Archivo dev:** frontend/.env.local (crear manualmente)
> **Archivo prod:** frontend/.env.production

---

## ⚙️ Cómo Django Procesa las Variables

> [!info] 🔄 Flujo de Carga
>
> 1. Django carga el archivo .env usando ==dotenv==
> 2. Lee cada variable del entorno del sistema operativo
> 3. Si no encuentra un valor, usa un fallback por defecto
> 4. Para la base de datos:
>    - Busca ==DATABASE_URL== → si existe, configura PostgreSQL con dj_database_url
>    - Si no existe → busca ==DB_PATH== para SQLite personalizado
>    - Si ninguno existe → usa SQLite en el directorio base del proyecto

---

## 🔐 Seguridad

> [!danger] 🚫 Nunca commitear secretos
> El archivo .env está incluido en .gitignore. ==Nunca incluyas credenciales reales en el repositorio.== Los archivos .env.example solo contienen plantillas con valores de ejemplo.

> [!warning] ⚠️ SECRET_KEY en producción
> La SECRET_KEY de Django ==debe ser única, larga y completamente aleatoria== en producción. Nunca reutilices la clave de desarrollo.
>
> **Para generar una clave segura:** ejecutar el utilitario get_random_secret_key de Django desde la consola de Python.

> [!warning] ⚠️ OPENROUTER_API_KEY
> Esta clave tiene ==costo asociado por uso==. No compartirla públicamente ni incluirla en commits. Rotarla si se expone accidentalmente.

---

## 🚀 Variables en Railway

> [!info] ☁️ Configuración en la Nube
>
> En el panel de Railway → Service → Variables, configurar:
>
> - 🔐 **SECRET_KEY** → generar una clave aleatoria segura
> - 🐛 **DEBUG** → ==False== (siempre en producción)
> - 🌐 **ALLOWED_HOSTS** → *.railway.app,reservia.up.railway.app
> - 🗄️ **DATABASE_URL** → ==autogenerado por Railway== si usas su plugin PostgreSQL
> - 🤖 **OPENROUTER_API_KEY** → tu clave de API
> - 🔗 **CORS_ALLOWED_ORIGINS** → https://tu-dominio.railway.app
>
> Ver [[Railway Deployment]] para más detalles del despliegue.

---

## 🛡️ Códigos de Staff (Owner / Admin)

> [!danger] 🔐 Secretos críticos
> Los códigos staff dan acceso al panel de dashboard con rol `owner` o `admin`. ==No commitear nunca en el repo==. Configurar como ==GitHub Secrets== o variables equivalentes en el proveedor cloud.
>
> | Variable | GitHub Secret | Descripción |
> |----------|:-------------:|-------------|
> | `STAFF_OWNER_CODE` | `STAFF_OWNER_CODE` | Código que introduce un dueño de restaurante en `POST /api/auth/staff-login` para obtener un JWT con `role: owner` |
> | `STAFF_OWNER_EMAIL` | `STAFF_OWNER_EMAIL` | Email asociado al owner (se incluye como claim `email` en el JWT y se guarda en `StaffCode.email` al seedear) |
> | `STAFF_ADMIN_CODE` | `STAFF_ADMIN_CODE` | Código para el panel administrativo de plataforma (`role: admin`) |
> | `STAFF_ADMIN_EMAIL` | `STAFF_ADMIN_EMAIL` | Email asociado al admin de plataforma |
>
> > [!tip] 🔑 Generar valores seguros
> > Usar `python -c "import secrets; print(secrets.token_urlsafe(24))"` para cada código. Mínimo 32 caracteres.
>
> > [!info] 📦 Flujo en el deploy
> > 1. CI (`deploy.yml`) lee los 4 GitHub Secrets y los inyecta en el `env:` del job
> > 2. La acción SSH escribe el `.env` del server (`chmod 600`)
> > 3. `docker-compose.prod.yml` los propaga al backend con `env_file: .env`
> > 4. Django los lee en `seed` (hashea el código en `StaffCode`) y en `staff_login_view` (fallback de validación)

---

## 🔗 Links Relacionados

- [[Docker Setup]] — Cómo se inyectan las variables en Docker
- [[Railway Deployment]] — Variables en producción
- [[Local Setup]] — Configuración del .env en desarrollo
