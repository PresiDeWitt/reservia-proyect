---
tags: [reservia, backend, api, endpoints, rest]
---

# API Endpoints

[[Home|← Volver al Home]]

> [!info] Base URL
> - **Desarrollo**: `http://localhost:8000/api/`
> - **Producción**: `https://reservia.up.railway.app/api/`

---

## 🔐 Autenticación

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register/` | ❌ | Registrar nuevo usuario |
| `POST` | `/api/auth/login/` | ❌ | Iniciar sesión |
| `POST` | `/api/auth/token/refresh/` | ❌ | Renovar access token |

### `POST /api/auth/register/`

**Request**:
```json
{
  "first_name": "Ana",
  "email": "ana@ejemplo.com",
  "password": "mipassword123"
}
```

**Response** `201`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Ana",
    "email": "ana@ejemplo.com"
  }
}
```

### `POST /api/auth/login/`

**Request**:
```json
{
  "email": "ana@ejemplo.com",
  "password": "mipassword123"
}
```

**Response** `200`:
```json
{
  "token": "eyJ...",
  "refresh": "eyJ...",
  "user": { "id": 1, "name": "Ana", "email": "ana@ejemplo.com" }
}
```

---

## 🍽️ Restaurantes

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/restaurants/` | ❌ | Listar todos los restaurantes |
| `GET` | `/api/restaurants/{id}/` | ❌ | Detalle de un restaurante |
| `GET` | `/api/restaurants/cuisines/` | ❌ | Listar cocinas únicas |

### `GET /api/restaurants/`

**Query params**:
| Param | Tipo | Descripción |
|-------|------|-------------|
| `search` | string | Buscar por nombre |
| `cuisine` | string | Filtrar por tipo de cocina |

**Response** `200`:
```json
{
  "restaurants": [
    {
      "id": 1,
      "name": "The Golden Fork",
      "cuisine": "Italian",
      "location": "Downtown",
      "rating": 4.8,
      "price_range": "$$",
      "image_url": "https://...",
      "distance": 0.5
    }
  ],
  "total": 6
}
```

### `GET /api/restaurants/{id}/`

**Response** `200`:
```json
{
  "id": 1,
  "name": "The Golden Fork",
  "cuisine": "Italian",
  "description": "...",
  "address": "123 Main St",
  "lat": 40.7128,
  "lng": -74.0060,
  "rating": 4.8,
  "reviews_count": 234,
  "menuItems": [
    { "id": 1, "name": "Pasta Carbonara", "price": 18.5 }
  ]
}
```

### `GET /api/restaurants/cuisines/`

**Response** `200`:
```json
["Italian", "Japanese", "Steakhouse", "Fusion", "Healthy", "French"]
```

---

## 📅 Reservas

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/reservations/` | ✅ | Crear reserva |
| `GET` | `/api/reservations/my/` | ✅ | Mis reservas |
| `DELETE` | `/api/reservations/{id}/` | ✅ | Cancelar reserva |

### `POST /api/reservations/`

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "restaurantId": 1,
  "date": "2025-12-25",
  "time": "20:00",
  "guests": 2,
  "seatIds": [5, 6]
}
```

> [!note] `seatIds` es opcional
> Si se omite `seatIds`, la reserva se crea sin asientos asignados.

**Response** `201`:
```json
{
  "id": 42,
  "restaurant": { "id": 1, "name": "The Golden Fork" },
  "date": "2025-12-25",
  "time": "20:00",
  "guests": 2,
  "status": "confirmed",
  "created_at": "2025-11-01T12:00:00Z"
}
```

**Errores comunes**:
| Código | Descripción |
|--------|-------------|
| `400` | Asientos ya ocupados o cantidad inválida |
| `401` | No autenticado |

### `GET /api/reservations/my/`

**Response** `200`:
```json
[
  {
    "id": 42,
    "restaurant": { "id": 1, "name": "The Golden Fork" },
    "date": "2025-12-25",
    "time": "20:00",
    "guests": 2,
    "status": "confirmed"
  }
]
```

### `DELETE /api/reservations/{id}/`

**Response** `200`:
```json
{ "message": "Reservation cancelled" }
```

> [!warning] Cancelación
> En realidad cambia el `status` a `cancelled`, no borra el registro de la base de datos.

---

## 🏢 Planos de Piso

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/restaurants/{id}/floor-plan/` | ❌ | Obtener plano |
| `GET` | `/api/restaurants/{id}/availability/` | ❌ | Disponibilidad de asientos |
| `PUT` | `/api/restaurants/{id}/floor-plan/edit/` | ✅ | Guardar plano |

### `GET /api/restaurants/{id}/availability/`

**Query params**:
| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `date` | string | ✅ | Formato `YYYY-MM-DD` |
| `time` | string | ✅ | Formato `HH:MM` |

**Response** `200`:
```json
{
  "seats": [
    { "id": 1, "label": "T1-A", "tableLabel": "T1", "isOccupied": false },
    { "id": 2, "label": "T1-B", "tableLabel": "T1", "isOccupied": true }
  ]
}
```

### `PUT /api/restaurants/{id}/floor-plan/edit/`

**Request**:
```json
{
  "width": 1000,
  "height": 700,
  "backgroundColor": "#F8F9FA",
  "tables": [
    {
      "label": "T1",
      "shape": "round",
      "x": 100, "y": 200,
      "width": 80, "height": 80,
      "rotation": 0,
      "capacity": 4,
      "min_capacity": 1
    }
  ]
}
```

---

## 🤖 Chat IA

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/api/chat/` | ❌ | Enviar mensaje al chatbot |

### `POST /api/chat/`

**Request**:
```json
{
  "message": "¿Qué restaurante japonés me recomiendas?",
  "history": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?" }
  ],
  "lat": 40.7128,
  "lng": -74.0060
}
```

> [!note] Campos opcionales
> `history`, `lat` y `lng` son opcionales. El historial se limita a las últimas 10 interacciones.

**Response** `200`:
```json
{
  "reply": "Te recomiendo Sakura Gardens, especializado en cocina japonesa con un ambiente minimalista y auténtico. ¡Tienen un menú de sushi excelente!"
}
```

---

## 🔗 Links Relacionados

- [[Authentication]] — Cómo funciona el sistema JWT
- [[Models]] — Modelos detrás de cada endpoint
- [[AI Chat Integration]] — Detalle de la integración con Claude
- [[Reservation System]] — Flujo completo de reservas
