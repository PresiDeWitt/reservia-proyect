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
> | ANTHROPIC_API_KEY | ✅ | Clave API de Anthropic para el chatbot IA |
>
> **Ejemplo SECRET_KEY:** django-insecure-... (==cambiar en producción==)
> **Ejemplo ANTHROPIC_API_KEY:** sk-ant-api03-...

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

> [!warning] ⚠️ ANTHROPIC_API_KEY
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
> - 🤖 **ANTHROPIC_API_KEY** → tu clave de API
> - 🔗 **CORS_ALLOWED_ORIGINS** → https://tu-dominio.railway.app
>
> Ver [[Railway Deployment]] para más detalles del despliegue.

---

## 🔗 Links Relacionados

- [[Docker Setup]] — Cómo se inyectan las variables en Docker
- [[Railway Deployment]] — Variables en producción
- [[Local Setup]] — Configuración del .env en desarrollo
