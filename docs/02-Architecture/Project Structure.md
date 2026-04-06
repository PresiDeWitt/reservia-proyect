---
tags:
  - reservia
  - architecture
  - structure
---

# 📂 Project Structure

[[Home|← Volver al Home]]

---

## 🌳 Árbol de Archivos Completo

> [!abstract] 📁 reservia-proyect/
>
> - 📄 README.md — *Documentación principal del proyecto*
> - 📄 SETUP.md — *Guía de instalación*
> - 📄 docker-compose.yml — *Orquestación Docker local*
> - 📄 Dockerfile — *Build multi-stage (Node + Python)*
> - 📄 .env.example — *Template de variables de entorno*
> - 📄 .gitignore
> - 📄 .dockerignore
>
> > [!abstract] 📁 backend/ — *Django REST API*
> >
> > - 📄 manage.py — *CLI de Django*
> > - 📄 requirements.txt — *Dependencias Python*
> > - 📄 db.sqlite3 — *Base de datos de desarrollo*
> >
> > > [!abstract] 📁 reservia/ — *Configuración del proyecto Django*
> > >
> > > - 📄 settings.py — *Configuración principal (126 líneas)*
> > > - 📄 urls.py — *Router de URLs principal (25 líneas)*
> > > - 📄 wsgi.py — *Punto de entrada WSGI*
> >
> > > [!abstract] 📁 api/ — *App principal de Django*
> > >
> > > - 📄 models.py — *Modelos de base de datos (123 líneas)*
> > > - 📄 views.py — *Vistas API (262 líneas)*
> > > - 📄 views_frontend.py — *Sirve el SPA de React*
> > > - 📄 urls.py — *Rutas de la API (26 líneas)*
> > > - 📄 serializers.py — *Serializers DRF (176 líneas)*
> > > - 📄 admin.py — *Registro en Django Admin*
> > > - 📄 apps.py
> > > - 📄 \_\_init\_\_.py
> > >
> > > > [!abstract] 📁 management/commands/
> > > >
> > > > - 📄 seed.py — *Comando de seeding de datos*
> > >
> > > > [!abstract] 📁 migrations/
> > > >
> > > > - 📄 0001_initial.py — *Migración inicial*
> > > > - 📄 0002_floorplan... — *Migraciones de floor plan*
>
> > [!abstract] 📁 frontend/ — *React TypeScript App*
> >
> > - 📄 package.json — *Dependencias npm*
> > - 📄 vite.config.ts — *Configuración Vite*
> > - 📄 tsconfig.json — *Configuración TypeScript*
> > - 📄 eslint.config.js — *Reglas ESLint*
> > - 📄 index.html — *Punto de entrada HTML*
> > - 📄 .env.production — *Variables de entorno de producción*
> >
> > > [!abstract] 📁 src/
> > >
> > > - 📄 main.tsx — *Punto de entrada React*
> > > - 📄 App.tsx — *Componente raíz + routing*
> > > - 📄 App.css — *Estilos globales*
> > > - 📄 index.css — *Tailwind CSS*
> > >
> > > > [!abstract] 📁 api/ — *Capa de cliente HTTP*
> > > >
> > > > - 📄 client.ts — *Cliente base (fetch wrapper)*
> > > > - 📄 auth.ts — *Endpoints de autenticación*
> > > > - 📄 restaurants.ts — *Consultas de restaurantes*
> > > > - 📄 reservations.ts — *API de reservas*
> > > > - 📄 floorPlan.ts — *API de planos*
> > > > - 📄 chat.ts — *API del chatbot IA*
> > >
> > > > [!abstract] 📁 context/
> > > >
> > > > - 📄 AuthContext.tsx — *Estado global de autenticación*
> > >
> > > > [!abstract] 📁 pages/ — *Componentes de página*
> > > >
> > > > - 📄 Home.tsx — *Lista de restaurantes*
> > > > - 📄 RestaurantDetails.tsx — *Detalle + reserva*
> > > > - 📄 MapExplorer.tsx — *Mapa interactivo*
> > > > - 📄 MyBookings.tsx — *Mis reservas*
> > > > - 📄 FloorPlanEditorPage.tsx — *Editor admin*
> > > > - 📄 NotFound.tsx — *Página 404*
> > >
> > > > [!abstract] 📁 components/ — *Componentes reutilizables*
> > > >
> > > > - 📄 Header.tsx — *Navegación principal*
> > > > - 📄 Hero.tsx — *Sección hero del landing*
> > > > - 📄 AuthModal.tsx — *Modal login/registro*
> > > > - 📄 RestaurantCard.tsx — *Tarjeta de restaurante*
> > > > - 📄 CategoryCard.tsx — *Tarjeta de categoría cocina*
> > > > - 📄 ChatBot.tsx — *Widget del chatbot IA*
> > > >
> > > > > [!abstract] 📁 floorplan/ — *Componentes de plano*
> > > > >
> > > > > - 📄 SeatPicker.tsx — *UI de selección de asientos*
> > > > > - 📄 FloorPlanCanvas.tsx — *Renderer del canvas*
> > > > > - 📄 FloorPlanEditor.tsx — *Editor de admin*
> > > > > - 📄 Legend.tsx — *Leyenda de colores*
> > >
> > > > [!abstract] 📁 i18n/ — *Internacionalización*
> > > >
> > > > - 📄 config.ts — *Configuración i18next*
> > > > - 📄 en.json — *Traducciones inglés*
> > > > - 📄 es.json — *Traducciones español*
> > >
> > > > [!abstract] 📁 utils/
> > > >
> > > > - 📄 seatGeometry.ts — *Cálculos de geometría para asientos*
> > >
> > > > [!abstract] 📁 assets/images/
> > > >
> > > > - 🖼️ *Imágenes de categorías de cocina*

---

## 📌 Archivos Clave

### ⚙️ Backend

> [!important] 🔥 api/views.py — *262 líneas*
> Contiene las ==12 vistas API== del proyecto. Es el corazón del backend.

> [!important] 🔄 api/serializers.py — *176 líneas*
> ==9 serializers== con validación de datos. Transforma modelos a JSON y viceversa.

> [!important] 🗄️ api/models.py — *123 líneas*
> ==8 modelos== de base de datos. Define toda la estructura de datos (ver [[Database Schema]]).

> [!important] ⚙️ reservia/settings.py — *126 líneas*
> Configuración principal de Django: CORS, JWT, base de datos, WhiteNoise.

> [!important] 🌱 api/management/commands/seed.py
> Comando para poblar la base de datos con datos de prueba.

---

### 📱 Frontend

> [!important] 🧭 src/App.tsx
> Raíz de la app y ==definición de todas las rutas==.

> [!important] 🔐 src/context/AuthContext.tsx
> ==Estado global de autenticación==. Maneja login, logout y persistencia de sesión.

> [!important] 📡 src/api/client.ts
> Cliente HTTP base. Wrapper de fetch con ==manejo automático de tokens JWT==.

> [!important] 🏠 src/pages/RestaurantDetails.tsx
> La ==página más compleja== del proyecto: detalle del restaurante, reservas y plano de asientos.

> [!important] 🪑 src/components/floorplan/SeatPicker.tsx
> Componente visual interactivo para ==selección de asientos== en el plano del restaurante.

---

## 🔗 Links Relacionados

- [[System Architecture]] — Cómo interactúan estos archivos
- [[Database Schema]] — Modelos en detalle
- [[API Endpoints]] — Rutas del backend
- [[Pages & Routing]] — Páginas del frontend
