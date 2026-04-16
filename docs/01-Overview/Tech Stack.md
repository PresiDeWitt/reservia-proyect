---
tags:
  - reservia
  - tech-stack
---

# 🧰 Tech Stack

[[Home|← Volver al Home]]

---

## 🎨 Frontend

> [!abstract] 🖥️ Frontend Technologies
>
> > [!tip] ⚛️ React 19.2.0
> > Framework UI principal — Componentes modernos con hooks
>
> > [!tip] 📘 TypeScript
> > Tipado estático para mayor seguridad y autocompletado
>
> > [!tip] ⚡ Vite 7.2.4
> > Build tool ultrarrápido y dev server con HMR
>
> > [!tip] 🎨 Tailwind CSS 4.1.18
> > Estilos utilitarios — diseño responsive sin CSS custom
>
> > [!tip] 🎬 Framer Motion 12.29.0
> > Animaciones fluidas y transiciones de página
>
> > [!tip] 🧭 React Router 7.12.0
> > Navegación SPA con rutas protegidas
>
> > [!tip] 🗺️ Leaflet 1.9.4 + React Leaflet 5.0.0
> > Mapas interactivos con marcadores y geolocalización
>
> > [!tip] 🌐 i18next 25.8.0 + react-i18next 16.5.3
> > Internacionalización completa EN/ES

---

### 🎨 Paleta de Colores

> [!example] 🟠 Primary — Naranja Principal
> ==**#f97415**== · Color de acento, botones principales, enlaces activos

> [!example] 🔵 Navy — Azul Oscuro
> ==**#0F172A**== · Fondos oscuros, texto principal, navbar

> [!example] 🟢 Emerald — Verde
> ==**#10B981**== · Estados de éxito, disponibilidad, confirmaciones

> [!example] 🟤 Background Light — Crema
> ==**#f8f7f5**== · Fondo principal en modo claro

> [!example] ⚫ Background Dark — Marrón Oscuro
> ==**#23170f**== · Fondo principal en modo oscuro

> [!quote] ✏️ Tipografía
> La fuente principal es **Inter** *(sans-serif)* — limpia, moderna y altamente legible.

---

## ⚙️ Backend

> [!info] 🐍 Backend Technologies
>
> > [!note] 🐍 Python 3.11
> > Lenguaje del backend — robusto y expresivo
>
> > [!note] 🎸 Django 4.2
> > Framework web con ORM, admin y sistema de migraciones
>
> > [!note] 🌐 Django REST Framework 3.15
> > API REST con serializers, viewsets y permisos
>
> > [!note] 🔐 SimpleJWT 5.3
> > Autenticación mediante JSON Web Tokens
>
> > [!note] 🔗 django-cors-headers 4.3
> > Gestión de CORS para comunicación frontend-backend
>
> > [!note] 🚀 Gunicorn 21.2
> > WSGI server de producción — multi-worker
>
> > [!note] 📁 WhiteNoise 6.6
> > Servir archivos estáticos eficientemente en producción
>
> > [!note] 🔑 python-dotenv 1.0
> > Carga de variables de entorno desde archivos .env
>
> > [!note] 🤖 Anthropic SDK
> > Integración directa con la API de Claude
>
> > [!note] 🐘 psycopg2-binary 2.9
> > Driver PostgreSQL para producción
>
> > [!note] 🔗 dj-database-url 2.1
> > Parsing de URLs de base de datos para despliegue

---

## 🗄️ Base de Datos

> [!success] 💾 Motores de Base de Datos
>
> > [!note] 🧪 Desarrollo
> > **SQLite3** — Archivo local *db.sqlite3*, sin configuración necesaria
>
> > [!note] 🚀 Producción
> > **PostgreSQL** — Servicio gestionado en Railway, escalable y robusto

---

## 🤖 Inteligencia Artificial

> [!warning] 🧠 Chatbot IA
> **Servicio:** Anthropic Claude · **Modelo:** ==claude-haiku-4-5-20251001==
>
> > [!info] ⚙️ Configuración
> > - **Max tokens:** 400 por respuesta
> > - **Historial:** últimas 10 interacciones
> > - **Idioma:** Auto-detectado *(EN/ES)*
> > - **Contexto:** Lista de restaurantes + ubicación GPS opcional

---

## 🚀 Despliegue e Infraestructura

> [!quote] ☁️ Infraestructura de Producción
>
> > [!note] 🐳 Docker
> > Containerización con **multi-stage build** para optimizar tamaño
>
> > [!note] 🐙 Docker Compose
> > Orquestación local — Backend + Frontend en un solo comando
>
> > [!note] 🚂 Railway.app
> > Hosting con **auto-deploy desde Git** — CI/CD integrado
>
> > [!note] 📦 Node 22-alpine
> > Stage 1 del Dockerfile — Build del frontend
>
> > [!note] 🐍 Python 3.11-slim
> > Stage 2 del Dockerfile — Runtime del backend

---

## 📦 Gestión de Paquetes

> [!abstract] 🛠️ Herramientas
> - **Frontend:** ==npm== — gestión de dependencias JavaScript
> - **Backend:** ==pip + requirements.txt== — gestión de dependencias Python

---

## 🔗 Links Relacionados

> [!quote] 📚 Sigue Explorando
> - 🏛️ [[System Architecture]] — Cómo se comunican estos componentes
> - 🐳 [[Docker Setup]] — Configuración Docker detallada
> - 🤖 [[AI Chat Integration]] — Integración con Anthropic
> - 🔐 [[Authentication]] — Sistema JWT con SimpleJWT
