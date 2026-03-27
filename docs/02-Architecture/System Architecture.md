---
tags: [reservia, architecture, system-design]
---

# System Architecture

[[Home|← Volver al Home]]

## Visión General

Reservia es una arquitectura **monolítica desplegada en un solo contenedor**, donde Django sirve tanto la API REST como el bundle estático del frontend React.

---

## 🏗️ Diagrama de Arquitectura

```mermaid
graph TB
    subgraph Cliente
        Browser["🌐 Browser"]
    end

    subgraph Docker Container / Railway
        subgraph Frontend["React App (SPA)"]
            Router["React Router"]
            Pages["Pages"]
            Components["Components"]
            APIClient["API Client Layer"]
        end

        subgraph Backend["Django + DRF"]
            URLs["URL Router"]
            Views["API Views"]
            Serializers["Serializers"]
            Models["Django Models"]
            Auth["JWT Auth"]
            AIView["Chat View"]
        end

        subgraph Storage
            SQLite["SQLite3 (dev)"]
            PG["PostgreSQL (prod)"]
        end
    end

    subgraph External
        Anthropic["🤖 Anthropic API\n(Claude Haiku)"]
        Leaflet["🗺️ OpenStreetMap\n(Leaflet tiles)"]
    end

    Browser -->|HTTP/HTTPS| Frontend
    APIClient -->|REST API /api/*| Views
    Views --> Serializers
    Serializers --> Models
    Models --> SQLite
    Models --> PG
    Auth --> Views
    AIView -->|HTTPS| Anthropic
    Browser --> Leaflet
```

---

## 🔄 Flujo de Peticiones

### Request Típico (ej: listar restaurantes)

```mermaid
sequenceDiagram
    participant B as Browser
    participant R as React App
    participant A as API Client
    participant D as Django View
    participant DB as Database

    B->>R: Navega a /
    R->>A: restaurants.getAll()
    A->>D: GET /api/restaurants/
    D->>DB: Restaurant.objects.all()
    DB-->>D: QuerySet
    D-->>A: JSON Response
    A-->>R: Restaurant[]
    R-->>B: Render Home.tsx
```

### Flujo de Reserva con Asientos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database

    U->>FE: Selecciona fecha, hora, comensales
    FE->>BE: GET /api/restaurants/:id/availability/?date=&time=
    BE->>DB: SeatReservation query
    DB-->>BE: asientos ocupados
    BE-->>FE: {seats: [{id, isOccupied}]}
    FE->>U: Muestra plano con asientos disponibles
    U->>FE: Selecciona asientos
    FE->>BE: POST /api/reservations/ (con seatIds)
    BE->>DB: CREATE Reservation + SeatReservation
    DB-->>BE: OK
    BE-->>FE: Reservation object
    FE->>U: Confirmación de reserva
```

---

## 📁 Separación de Capas

| Capa | Ubicación | Responsabilidad |
|------|-----------|----------------|
| Presentación | `frontend/src/pages/` | UI, routing |
| Lógica UI | `frontend/src/components/` | Componentes reutilizables |
| API Client | `frontend/src/api/` | Comunicación con backend |
| Estado global | `frontend/src/context/` | Auth state |
| API REST | `backend/api/views.py` | Endpoints HTTP |
| Serialización | `backend/api/serializers.py` | Validación y transformación |
| Modelos | `backend/api/models.py` | Lógica de negocio y DB |
| Configuración | `backend/reservia/settings.py` | Config Django |

---

## 🌐 Estrategia de Despliegue

Django actúa como **servidor único** que:
1. Sirve la API en `/api/*`
2. Sirve los archivos estáticos del frontend en `/static/`
3. Para cualquier ruta que no sea `/api/*`, devuelve el `index.html` del SPA (`views_frontend.py`)

> [!info] Sin servidor separado para el frontend
> No hay Nginx ni servidor de archivos separado. WhiteNoise maneja los estáticos y Django sirve el SPA.

---

## 🔐 Seguridad

- **CORS**: Configurado con `django-cors-headers`, permitiendo solo orígenes conocidos
- **JWT**: Tokens con expiración de 7 días (access) / 30 días (refresh)
- **HTTPS**: Gestionado por Railway en producción
- **SECRET_KEY**: Inyectado vía variable de entorno

---

## 🔗 Links Relacionados

- [[Project Structure]] — Árbol de archivos detallado
- [[API Endpoints]] — Todas las rutas REST
- [[Docker Setup]] — Cómo se empaqueta todo
- [[Authentication]] — Sistema de autenticación
