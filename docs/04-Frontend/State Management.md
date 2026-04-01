---
tags:
  - reservia
  - frontend
  - state
---

# 🧠 State Management

[[Home|← Volver al Home]]

---

## 🏛️ Arquitectura de Estado

> [!quote] Filosofía
> Reservia usa un enfoque ==minimalista== de gestión de estado. Solo lo esencial es global; todo lo demás vive en el componente que lo necesita.

> [!info] Estrategia de Estado
> - 🌐 **Estado global** → Solo autenticación vía ==AuthContext==
> - 📦 **Estado local** → useState en cada componente/página
> - ❌ **No hay Redux**, Zustand ni otras librerías de estado

---

## 🔐 AuthContext

> [!important] El único estado global de la aplicación
> **Archivo:** ==frontend/src/context/AuthContext.tsx==
>
> **Estructura del contexto:**
> - **user** → objeto User o null
>   - **id** → número identificador
>   - **name** → nombre del usuario
>   - **email** → email del usuario
> - **login(email, password)** → inicia sesión
> - **register(name, email, password)** → crea cuenta
> - **logout()** → cierra sesión
> - **isLoading** → boolean de carga

> [!info] 🔄 Inicialización
> Al cargar la app, el contexto intenta restaurar la sesión desde ==localStorage==:
>
> 1️⃣ Busca **reservia_user** y **reservia_token** en localStorage
> ⬇️
> 2️⃣ Si ambos existen → restaura el usuario en el estado
> ⬇️
> 3️⃣ Si no → el usuario queda como **null** (no autenticado)

> [!success] Login
> 1️⃣ Llama a la API de autenticación con email y password
> ⬇️
> 2️⃣ Guarda **token** en localStorage como ==reservia_token==
> ⬇️
> 3️⃣ Guarda **usuario** en localStorage como ==reservia_user==
> ⬇️
> 4️⃣ Actualiza el estado → **user** deja de ser null

> [!danger] Logout
> 1️⃣ Elimina ==reservia_token== de localStorage
> ⬇️
> 2️⃣ Elimina ==reservia_user== de localStorage
> ⬇️
> 3️⃣ Establece **user** como null

---

## 📡 API Client Layer

> [!info] Cliente Base
> **Directorio:** ==frontend/src/api/==
>
> El estado del servidor se gestiona directamente con **fetch** sin librerías de cache como React Query.
>
> **Comportamiento del cliente:**
> - Lee el ==token== de localStorage
> - Lo inyecta como **Authorization: Bearer** en cada petición
> - Content-Type siempre **application/json**
> - Si la respuesta no es OK → lanza error

> [!abstract] Módulos de API
> - 🔐 **auth.ts** → login, register
> - 🍽️ **restaurants.ts** → getAll, getById, getCuisines
> - 📅 **reservations.ts** → create, getMyReservations, cancel
> - 🗺️ **floorPlan.ts** → get, getAvailability, update
> - 🤖 **chat.ts** → sendMessage
>
> Ver [[API Endpoints]] para documentación completa de endpoints.

---

## 📦 Estado Local por Página

> [!example] 🏠 Home → [[Pages & Routing#🏠 Home|Home]]
> - **restaurants** → lista de restaurantes
> - **cuisines** → lista de tipos de cocina
> - **searchQuery** → texto de búsqueda
> - **selectedCuisine** → filtro de cocina activo (o null)
> - **isLoading** → estado de carga

> [!example] 🍽️ RestaurantDetails → [[Pages & Routing#🍽️ RestaurantDetails|RestaurantDetails]]
> - **restaurant** → datos del restaurante (o null)
> - **floorPlan** → datos del plano (o null)
> - **availability** → disponibilidad de asientos
> - **selectedSeats** → IDs de asientos seleccionados
> - **date** → fecha seleccionada
> - **time** → hora seleccionada
> - **guests** → número de comensales (default: 2)
> - **bookingSuccess** → si la reserva fue exitosa

> [!example] 📅 MyBookings → [[Pages & Routing#📅 MyBookings|MyBookings]]
> - **reservations** → lista de reservas
> - **isLoading** → estado de carga

---

## 🔄 Flujo de Datos

> [!info] Diagrama de flujo
>
> **localStorage** (token + user)
> ⬇️ init
> **AuthContext** (user state)
> ⬇️ se distribuye a...
>
> → 🧭 [[Components#🧭 Header|Header]] ← recibe **user**
> → 🔐 [[Components#🔐 AuthModal|AuthModal]] ← usa **login/register**
> → 🛡️ [[Pages & Routing|Rutas Protegidas]] ← verifica **user !== null**
> → 📄 Páginas ← usan **useContext** + estado local + API calls

---

## 🔗 Links Relacionados

- [[Authentication]] — Sistema JWT del backend
- [[Pages & Routing]] — Estado local de cada página
- [[Components]] — Componentes que consumen AuthContext
