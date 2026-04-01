---
tags:
  - reservia
  - deployment
  - docker
---

# 🐳 Docker Setup

[[Home|← Volver al Home]]

---

## 🌊 Visión General

Reservia utiliza un ==Dockerfile multi-stage== que compila el frontend React y lo integra con el backend Django en un ==único contenedor optimizado==.

---

## 🏗️ Etapas del Build Multi-Stage

> [!abstract] 🔷 STAGE 1 — Build del Frontend
> **Imagen base:** Node.js 22 Alpine (ultra ligera)
>
> 1. Se copian los archivos de dependencias del frontend
> 2. Se instalan las dependencias de Node con instalación limpia
> 3. Se copia todo el código fuente del frontend
> 4. Se ejecuta el build de producción con Vite
> 5. ==Resultado:== carpeta de archivos estáticos listos para servir
>
> 📦 **Output** → directorio con los assets compilados (HTML, CSS, JS minificados)

⬇️ ⬇️ ⬇️

> [!abstract] 🔷 STAGE 2 — Backend Python + Frontend Integrado
> **Imagen base:** Python 3.11 Slim
>
> 1. Se instalan dependencias del sistema (compilador, cliente PostgreSQL)
> 2. Se copian e instalan las dependencias Python desde requirements.txt
> 3. Se copia todo el código del backend Django
> 4. ==Se copian los archivos compilados del Stage 1== al directorio de estáticos
> 5. Se ejecuta la recolección de archivos estáticos con WhiteNoise
> 6. **Al arrancar:** migraciones → seed → servidor Gunicorn
>
> 🚀 **Resultado final** → imagen Docker lista para producción

---

## 🔄 Flujo Visual del Build

📂 **frontend/src/** → 🔨 Build con Vite → 📦 Archivos estáticos compilados
↘️
==📂 **backend/** → 🐍 Copiar código Python== → ⬇️
↘️
🔗 **Integración** → Se unen frontend compilado + backend
↘️
📋 **collectstatic** → WhiteNoise prepara los estáticos
↘️
🐳 **Imagen Docker Final** (Python + archivos estáticos servidos)

---

## 🔑 Puntos Clave

> [!info] 📊 Configuración de la Imagen
>
> | Aspecto | Detalle |
> |---------|---------|
> | 🖥️ Base frontend | Node.js 22 Alpine (ligera) |
> | 🐍 Base backend | Python 3.11 Slim |
> | ⚙️ Workers Gunicorn | ==3 workers== para concurrencia |
> | 🌐 Puerto | Variable dinámica (Railway la inyecta) |
> | 🔄 Migraciones | ==Automáticas== al arrancar el contenedor |
> | 🌱 Seed | ==Automático== al arrancar el contenedor |
> | 📁 Estáticos | WhiteNoise los sirve desde /staticfiles |

---

## 🐙 Docker Compose para Desarrollo Local

> [!info] 🧩 Servicios definidos
>
> **Servicio backend:**
> - Construye desde el Dockerfile en la raíz del proyecto
> - Expone el puerto ==8000==
> - Recibe las variables de entorno: PORT, DEBUG, ANTHROPIC_API_KEY, DB_PATH
> - Usa un ==volumen persistente== para la base de datos SQLite
> - Lee variables adicionales desde el archivo .env
>
> **Servicio frontend:**
> - Construye desde el directorio frontend
> - Expone el puerto ==80==
>
> **Volumen db_data:**
> - Persiste la base de datos SQLite entre reinicios del contenedor
> - ==Sin este volumen, los datos se perderían== al detener el contenedor

---

## 🚀 Comandos Esenciales

> [!abstract] 🔨 Construir y Levantar
> - **Construir imágenes** → ejecutar docker-compose build
> - **Levantar servicios** → ejecutar docker-compose up
> - **Levantar en segundo plano** → añadir la bandera -d al comando up

> [!abstract] 🛠️ Administración
> - **Ver logs en tiempo real** → docker-compose logs con bandera -f
> - **Entrar al contenedor** → docker-compose exec backend bash
> - **Ejecutar shell de Django** → docker-compose exec backend python manage.py shell
> - **Detener servicios** → docker-compose down
> - **Detener y eliminar volúmenes** → docker-compose down con bandera -v ⚠️ ==esto borra la base de datos==

---

## 🔗 Links Relacionados

- [[Environment Variables]] — Variables necesarias para Docker
- [[Railway Deployment]] — Despliegue en producción
- [[Local Setup]] — Setup de desarrollo sin Docker
