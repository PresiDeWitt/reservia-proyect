---
tags:
  - reservia
  - deployment
  - railway
  - cloud
---

# 🚂 Railway Deployment

[[Home|← Volver al Home]]

---

## 🌊 Visión General

Reservia está desplegado en ==Railway.app==, una plataforma de cloud hosting con soporte nativo para Docker y auto-deploy desde GitHub.

🌐 **URL de producción:** https://reservia.up.railway.app

---

## 💡 ¿Por qué Railway?

> [!success] ✅ Ventajas de Railway
>
> - 🐳 **Docker nativo** → usa el Dockerfile del repo directamente, sin configuración extra
> - 🔄 **Auto-deploy** → cada push a ==main== lanza un deploy automático
> - 🗄️ **PostgreSQL incluido** → servicio de base de datos integrado como plugin
> - ⚙️ **Variables de entorno** → panel de configuración visual e intuitivo
> - 🔒 **SSL automático** → HTTPS sin ninguna configuración manual
> - 💰 **Sin costo fijo** → modelo pay-as-you-go

---

## 🏗️ Estructura del Proyecto en Railway

> [!info] 📂 Arquitectura del Servicio
>
> 🚂 **Railway Project: reservia**
> ├── 🌐 **Service: backend** (Web)
> │   ├── 📦 Source → repositorio GitHub conectado
> │   ├── 🐳 Build → usa el Dockerfile multi-stage
> │   └── ⚙️ Variables → todas las env vars configuradas
> └── 🗄️ **Service: database** (opcional)
>     └── 🐘 Plugin PostgreSQL integrado

---

## ⚙️ Variables de Entorno

> [!info] 🔧 Configurar en Railway → Service → Variables
>
> - 🔐 **SECRET_KEY** → clave aleatoria generada de forma segura
> - 🐛 **DEBUG** → ==False==
> - 🌐 **ALLOWED_HOSTS** → *.railway.app,reservia.up.railway.app
> - 🗄️ **DATABASE_URL** → referencia al plugin PostgreSQL (Railway lo resuelve automáticamente)
> - 🔗 **CORS_ALLOWED_ORIGINS** → https://reservia.up.railway.app
> - 🤖 **ANTHROPIC_API_KEY** → tu clave de API de Anthropic
> - 🌐 **PORT** → 8000
>
> ==Railway permite referenciar variables de otros servicios== con su sintaxis especial, insertando automáticamente la URL de PostgreSQL.

---

## 🚀 Proceso de Deploy

> [!success] 1️⃣ Push al Repositorio
> El desarrollador hace push a la rama ==main== en GitHub

⬇️

> [!success] 2️⃣ Railway Detecta el Cambio
> Railway está conectado al repositorio y detecta automáticamente el nuevo commit

⬇️

> [!success] 3️⃣ Build Multi-Stage
> Se ejecuta el Dockerfile:
> - 📦 Se compila el frontend con Vite (Node.js)
> - 🐍 Se instalan dependencias Python (pip install)
> - 🔗 Se integran los archivos estáticos

⬇️

> [!success] 4️⃣ Arranque del Servidor
> - 🔄 Se ejecutan las migraciones de base de datos
> - 🌱 Se ejecuta el seed de datos
> - 🚀 Se inicia Gunicorn con ==3 workers==

⬇️

> [!success] 5️⃣ ¡App en Vivo!
> La aplicación está disponible en https://reservia.up.railway.app con ==SSL automático==

---

## 📋 Checklist de Despliegue

- [ ] Conectar repositorio GitHub a Railway
- [ ] Configurar todas las [[Environment Variables|variables de entorno]]
- [ ] Añadir plugin PostgreSQL (o confirmar uso de SQLite)
- [ ] Verificar que ==ALLOWED_HOSTS== incluye el dominio Railway
- [ ] Verificar que ==CORS_ALLOWED_ORIGINS== incluye el dominio Railway
- [ ] Hacer push del código a la rama main
- [ ] Revisar los logs del build en el panel de Railway
- [ ] Probar la URL de producción en el navegador
- [ ] Verificar que el chatbot funciona (requiere ANTHROPIC_API_KEY)
- [ ] Confirmar que los 6 restaurantes aparecen correctamente

---

## 🔍 Monitoreo y Logs

> [!info] 📊 Ver Logs en Tiempo Real
>
> **Desde el panel web:**
> Railway → Service → Deployments → seleccionar deployment → ==Ver logs==
>
> **Desde la CLI de Railway:**
> Ejecutar el comando de logs desde la terminal tras autenticarse
>
> **Logs de inicio esperados:**
> 1. ✅ Running migrations...
> 2. 🌱 Seeding database...
> 3. 🚀 Starting Gunicorn con 3 workers
> 4. 👂 Listening en el puerto asignado

> [!info] 🛠️ Railway CLI
>
> Herramientas disponibles desde la terminal:
> - **Instalar** → via npm de forma global
> - **Autenticarse** → comando login
> - **Conectar al proyecto** → comando link
> - **Ver variables** → comando variables
> - **Deploy manual** → comando up
> - **Ver logs** → comando logs

---

## ⚡ Configuración de Puerto

> [!warning] 🌐 Puerto Dinámico
> Railway ==asigna el puerto dinámicamente== a través de la variable PORT. El Dockerfile está configurado para usar esta variable al iniciar Gunicorn. ==Nunca hardcodear el número de puerto== ya que Railway lo cambia según disponibilidad.

---

## 🔗 Links Relacionados

- [[Docker Setup]] — Dockerfile que Railway ejecuta
- [[Environment Variables]] — Variables de entorno detalladas
- [[Local Setup]] — Setup de desarrollo local
