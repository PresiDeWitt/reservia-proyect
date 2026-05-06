---
tags:
  - reservia
  - frontend
  - routing
  - pages
---

# 🗺️ Pages & Routing

[[Home|← Volver al Home]]

Reservia usa ==React Router v7== configurado en **App.tsx** como SPA (Single Page Application).

---

## 🧭 Mapa de Rutas

> [!info] Rutas Públicas
> - 🏠 **/** → Home.tsx
> - 🍽️ **/restaurant/:id** → RestaurantDetails.tsx
> - 🗺️ **/map** → MapExplorer.tsx
> - ❓ **\*** → NotFound.tsx (404)

> [!warning] 🔒 Rutas Protegidas (requieren autenticación)
> - 📅 **/my-bookings** → MyBookings.tsx
> - ✏️ **/restaurant/:id/floor-plan** → FloorPlanEditorPage.tsx
>
> Si el usuario ==no está autenticado==, se redirige a **/** y se abre el [[Components#🔐 AuthModal|AuthModal]].

---

## 📄 Páginas Detalladas

> [!example] 🏠 Home
> **Ruta:** ==/**==
>
> La página principal de la aplicación.
>
> **Funcionalidades:**
> - Hero section con buscador
> - Filtrado por tipo de cocina → [[Components#🏷️ CategoryCard|CategoryCard]]
> - Grid de restaurantes → [[Components#🍽️ RestaurantCard|RestaurantCard]]
> - Búsqueda por nombre en tiempo real
>
> **Componentes usados:**
> - [[Components#🌟 Hero|Hero]] → Sección de bienvenida con search
> - [[Components#🏷️ CategoryCard|CategoryCard]] → Tarjetas de tipo de cocina
> - [[Components#🍽️ RestaurantCard|RestaurantCard]] → Tarjetas de restaurante
>
> **API:**
> - GET **/api/restaurants/** (con filtros opcionales)
> - GET **/api/restaurants/cuisines/**

---

> [!example] 🍽️ RestaurantDetails
> **Ruta:** ==/restaurant/:id==
>
> La página ==más compleja== de la aplicación. Maneja todo el flujo de reserva.
>
> **Funcionalidades:**
> - Información completa del restaurante
> - Menú del restaurante
> - Formulario de reserva (fecha, hora, comensales)
> - Selector visual de asientos → [[Components#💺 SeatPicker|SeatPicker]]
> - Confirmación de reserva
>
> **Flujo de reserva:**
> 1️⃣ Cargar datos del restaurante
> ⬇️
> 2️⃣ Usuario selecciona fecha / hora / comensales
> ⬇️
> 3️⃣ Cargar disponibilidad de asientos
> ⬇️
> 4️⃣ Usuario selecciona asientos en el plano
> ⬇️
> 5️⃣ Submit → POST /api/reservations/
> ⬇️
> 6️⃣ Confirmación ✅
>
> **API:**
> - GET **/api/restaurants/:id/**
> - GET **/api/restaurants/:id/floor-plan/**
> - GET **/api/restaurants/:id/availability/?date=&time=**
> - POST **/api/reservations/**

---

> [!example] 🗺️ MapExplorer
> **Ruta:** ==/map==
>
> Mapa interactivo con todos los restaurantes.
>
> **Funcionalidades:**
> - Mapa ==Leaflet== con markers de restaurantes
> - Geolocalización del usuario
> - Click en marker → info popup del restaurante
> - Link directo a la página del restaurante
>
> **Dependencias:**
> - **Leaflet** 1.9.4
> - **React Leaflet** 5.0.0
> - **OpenStreetMap** tiles

---

> [!example] 📅 MyBookings
> **Ruta:** ==/my-bookings==
>
> > [!warning] 🔒 Requiere autenticación
>
> Lista y gestión de reservas del usuario.
>
> **Funcionalidades:**
> - Lista de reservas (activas y canceladas)
> - Cancelar reserva
> - Ver detalles de cada reserva
>
> **API:**
> - GET **/api/reservations/my/**
> - DELETE **/api/reservations/:id/**

---

> [!example] ✏️ FloorPlanEditorPage
> **Ruta:** ==/restaurant/:id/floor-plan==
>
> > [!warning] 🔒 Requiere autenticación (admin)
>
> Editor visual para administradores del restaurante.
>
> **Funcionalidades:**
> - Añadir / editar / eliminar mesas
> - Configurar forma → ==round== / ==square== / ==rectangular==
> - Ajustar posición y rotación
> - Definir capacidad
> - Guardar cambios en el backend
>
> **API:**
> - GET **/api/restaurants/:id/floor-plan/**
> - PUT **/api/restaurants/:id/floor-plan/edit/**
>
> Ver [[Floor Plan System]] para más detalles.

---

> [!example] ❓ NotFound
> **Ruta:** ==*== (catch-all)
>
> Página 404 simple con link de vuelta al inicio.

---

## 🔄 Flujo de Navegación

> [!info] Navegación Principal
> La navegación está en [[Components#🧭 Header|Header]] y aparece en ==todas las páginas==:
>
> **Logo** → /
> ⬇️
> 🗺️ **Mapa** → /map
> ⬇️
> 📅 **Mis Reservas** → /my-bookings (solo si autenticado)
> ⬇️
> 🔐 **Login/Registro** → Abre [[Components#🔐 AuthModal|AuthModal]]

---

## 🔗 Links Relacionados

- [[Components]] — Componentes usados en estas páginas
- [[State Management]] — AuthContext para rutas protegidas
- [[API Endpoints]] — Endpoints consumidos
- [[Floor Plan System]] — Sistema de planos en detalle
