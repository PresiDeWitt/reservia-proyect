---
tags:
  - reservia
  - architecture
  - system
---

# 🏛️ System Architecture

[[Home|← Volver al Home]]

---

## 🌐 Visión General

> [!quote] Filosofía de Despliegue
> Reservia es una arquitectura **monolítica desplegada en un solo contenedor**, donde ==Django sirve tanto la API REST como el bundle estático del frontend React==.

---

## 🏗️ Diagrama de Arquitectura

> [!abstract] 🌐 Capa Cliente — **Browser**
> El usuario accede a la aplicación desde cualquier navegador moderno.
>
> > [!tip] 📱 Frontend — **React App (SPA)**
> > Servida como archivos estáticos dentro del mismo contenedor Docker.
> >
> > - **React Router** → Navegación del lado del cliente
> > - **Pages** → Vistas de la aplicación
> > - **Components** → Piezas reutilizables de UI
> > - **API Client Layer** → Comunicación con el backend
> >
> > > [!info] ⚙️ Backend — **Django + DRF**
> > > Procesa todas las peticiones REST y sirve el SPA.
> > >
> > > - **URL Router** → Enrutamiento de URLs
> > > - **API Views** → Lógica de los endpoints
> > > - **Serializers** → Validación y transformación de datos
> > > - **Django Models** → Lógica de negocio
> > > - **JWT Auth** → Autenticación con tokens
> > > - **Chat View** → Integración con IA
> > >
> > > > [!example] 🗄️ Almacenamiento
> > > > - **SQLite3** → Base de datos de desarrollo
> > > > - **PostgreSQL** → Base de datos de producción

---

> [!note] 🔌 Servicios Externos
> - 🤖 **Anthropic API** (Claude Haiku) → Chatbot inteligente con IA
> - 🗺️ **OpenStreetMap** (Leaflet tiles) → Mapas interactivos

---

## 🔄 Flujo de Peticiones

### 📋 Request Típico — Listar Restaurantes

> [!example] Flujo paso a paso
>
> > [!info] 1️⃣ Navegación
> > 🌐 **Browser** → Navega a `/`
>
> > [!info] 2️⃣ Llamada al API Client
> > 📱 **React App** → llama a `restaurants.getAll()`
>
> > [!info] 3️⃣ Petición HTTP
> > 📡 **API Client** → `GET /api/restaurants/`
>
> > [!info] 4️⃣ Consulta a la Base de Datos
> > ⚙️ **Django View** → `Restaurant.objects.all()` → 🗄️ **Database**
>
> > [!success] 5️⃣ Respuesta
> > 🗄️ **Database** → ==QuerySet== → ⚙️ **Django** → ==JSON Response== → 📡 **API Client** → ==Restaurant[]== → 📱 **React** → ==Render Home==

---

### 🪑 Flujo de Reserva con Asientos

> [!example] Flujo completo de reserva
>
> > [!info] 1️⃣ Selección
> > 👤 **Usuario** → Selecciona ==fecha==, ==hora==, ==comensales==
>
> > [!info] 2️⃣ Consulta de Disponibilidad
> > 📱 **Frontend** → `GET /api/restaurants/:id/availability/?date=&time=`
> > ⚙️ **Backend** → consulta ==SeatReservation== en la DB
> > 🗄️ **Database** → devuelve asientos ocupados
>
> > [!info] 3️⃣ Visualización
> > ⚙️ **Backend** → responde `{seats: [{id, isOccupied}]}`
> > 📱 **Frontend** → ==Muestra plano con asientos disponibles==
>
> > [!info] 4️⃣ Selección de Asientos
> > 👤 **Usuario** → Selecciona asientos en el plano interactivo
>
> > [!success] 5️⃣ Confirmación
> > 📱 **Frontend** → `POST /api/reservations/` (con seatIds)
> > ⚙️ **Backend** → crea ==Reservation== + ==SeatReservation==
> > 📱 **Frontend** → muestra ✅ **Confirmación de reserva**

---

## 📁 Separación de Capas

> [!abstract] 🎨 Presentación
> **Ubicación:** `frontend/src/pages/`
> **Responsabilidad:** UI, routing

> [!abstract] 🧩 Lógica UI
> **Ubicación:** `frontend/src/components/`
> **Responsabilidad:** Componentes reutilizables

> [!abstract] 📡 API Client
> **Ubicación:** `frontend/src/api/`
> **Responsabilidad:** Comunicación con backend

> [!abstract] 🔐 Estado Global
> **Ubicación:** `frontend/src/context/`
> **Responsabilidad:** Auth state (ver [[Authentication]])

> [!abstract] ⚙️ API REST
> **Ubicación:** `backend/api/views.py`
> **Responsabilidad:** Endpoints HTTP (ver [[API Endpoints]])

> [!abstract] 🔄 Serialización
> **Ubicación:** `backend/api/serializers.py`
> **Responsabilidad:** Validación y transformación

> [!abstract] 🗄️ Modelos
> **Ubicación:** `backend/api/models.py`
> **Responsabilidad:** Lógica de negocio y DB (ver [[Database Schema]])

> [!abstract] ⚙️ Configuración
> **Ubicación:** `backend/reservia/settings.py`
> **Responsabilidad:** Config Django

---

## 🌐 Estrategia de Despliegue

Django actúa como **servidor único** que:

1. Sirve la ==API== en `/api/*`
2. Sirve los ==archivos estáticos== del frontend en `/static/`
3. Para cualquier otra ruta, devuelve el `index.html` del SPA

> [!info] Sin servidor separado para el frontend
> No hay Nginx ni servidor de archivos separado. ==WhiteNoise== maneja los estáticos y Django sirve el SPA a través de `views_frontend.py`.

---

## 🔐 Seguridad

> [!warning] 🛡️ CORS
> Configurado con `django-cors-headers`, permitiendo ==solo orígenes conocidos==.

> [!warning] 🔑 JWT Tokens
> - **Access Token** → expiración de ==7 días==
> - **Refresh Token** → expiración de ==30 días==

> [!warning] 🔒 HTTPS
> Gestionado por ==Railway== en producción. Todo el tráfico es cifrado.

> [!warning] 🗝️ SECRET_KEY
> Inyectado vía ==variable de entorno==. Nunca hardcodeado en el código.

---

## 🔗 Links Relacionados

- [[Project Structure]] — Árbol de archivos detallado
- [[API Endpoints]] — Todas las rutas REST
- [[Docker Setup]] — Cómo se empaqueta todo
- [[Authentication]] — Sistema de autenticación
- [[Database Schema]] — Esquema de la base de datos
