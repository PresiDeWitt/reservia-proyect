---
tags: [reservia, frontend, pages, routing, react-router]
---

# Pages & Routing

[[Home|← Volver al Home]]

## Sistema de Routing

Reservia usa **React Router v7** configurado en `App.tsx` como SPA (Single Page Application).

---

## 🗺️ Rutas

| Ruta | Componente | Auth | Descripción |
|------|-----------|------|-------------|
| `/` | `Home.tsx` | ❌ | Página principal con lista de restaurantes |
| `/restaurant/:id` | `RestaurantDetails.tsx` | ❌ | Detalle del restaurante + reserva |
| `/restaurant/:id/floor-plan` | `FloorPlanEditorPage.tsx` | ✅ | Editor del plano (admin) |
| `/map` | `MapExplorer.tsx` | ❌ | Mapa interactivo |
| `/my-bookings` | `MyBookings.tsx` | ✅ | Mis reservas |
| `*` | `NotFound.tsx` | ❌ | Página 404 |

---

## 📄 Páginas Detalladas

### `Home.tsx`
**Ruta**: `/`

La página principal de la aplicación.

**Funcionalidades**:
- Hero section con buscador
- Filtrado por tipo de cocina (CategoryCards)
- Grid de restaurantes (RestaurantCards)
- Búsqueda por nombre en tiempo real

**Componentes usados**:
- `<Hero />` — Sección de bienvenida con search
- `<CategoryCard />` — Tarjetas de tipo de cocina
- `<RestaurantCard />` — Tarjetas de restaurante

**API llamadas**:
- `GET /api/restaurants/` (con filtros opcionales)
- `GET /api/restaurants/cuisines/`

---

### `RestaurantDetails.tsx`
**Ruta**: `/restaurant/:id`

La página más compleja de la aplicación. Maneja todo el flujo de reserva.

**Funcionalidades**:
- Información completa del restaurante
- Menú del restaurante
- Formulario de reserva (fecha, hora, comensales)
- Selector visual de asientos (floor plan)
- Confirmación de reserva

**Flujo interno**:
```
1. Cargar datos del restaurante
2. Usuario selecciona fecha/hora/comensales
3. Cargar disponibilidad de asientos
4. Usuario selecciona asientos en el plano
5. Submit → POST /api/reservations/
6. Confirmación
```

**API llamadas**:
- `GET /api/restaurants/:id/`
- `GET /api/restaurants/:id/floor-plan/`
- `GET /api/restaurants/:id/availability/?date=&time=`
- `POST /api/reservations/`

---

### `MapExplorer.tsx`
**Ruta**: `/map`

Mapa interactivo con todos los restaurantes.

**Funcionalidades**:
- Mapa Leaflet con markers de restaurantes
- Geolocalización del usuario
- Click en marker → info popup del restaurante
- Link directo a la página del restaurante

**Dependencias**:
- Leaflet 1.9.4
- React Leaflet 5.0.0
- OpenStreetMap tiles

---

### `MyBookings.tsx`
**Ruta**: `/my-bookings`
**Requiere**: Autenticación ✅

Lista y gestión de reservas del usuario.

**Funcionalidades**:
- Lista de reservas (activas y canceladas)
- Cancelar reserva
- Ver detalles de cada reserva

**API llamadas**:
- `GET /api/reservations/my/`
- `DELETE /api/reservations/:id/`

---

### `FloorPlanEditorPage.tsx`
**Ruta**: `/restaurant/:id/floor-plan`
**Requiere**: Autenticación ✅

Editor visual para administradores del restaurante.

**Funcionalidades**:
- Añadir/editar/eliminar mesas
- Configurar forma (round/square/rectangular)
- Ajustar posición y rotación
- Definir capacidad
- Guardar cambios en el backend

**API llamadas**:
- `GET /api/restaurants/:id/floor-plan/`
- `PUT /api/restaurants/:id/floor-plan/edit/`

---

### `NotFound.tsx`
**Ruta**: `*` (catch-all)

Página 404 simple con link de vuelta al inicio.

---

## 🛡️ Rutas Protegidas

Las rutas que requieren autenticación redirigen al modal de login si el usuario no está autenticado:

```typescript
// App.tsx
<Route
  path="/my-bookings"
  element={
    user ? <MyBookings /> : <Navigate to="/" />
  }
/>
```

---

## 🔄 Navegación

La navegación principal está en `<Header />` y aparece en todas las páginas:
- Logo → `/`
- Mapa → `/map`
- Mis Reservas → `/my-bookings` (solo si autenticado)
- Login/Registro → Abre `<AuthModal />`

---

## 🔗 Links Relacionados

- [[Components]] — Componentes usados en estas páginas
- [[State Management]] — AuthContext para rutas protegidas
- [[API Endpoints]] — Endpoints consumidos
- [[Floor Plan System]] — Sistema de planos en detalle
