---
tags: [reservia, architecture, project-structure, files]
---

# Project Structure

[[Home|← Volver al Home]]

## Árbol de Archivos Completo

```
reservia-proyect/
│
├── 📄 README.md                     # Documentación principal del proyecto
├── 📄 SETUP.md                      # Guía de instalación
├── 📄 docker-compose.yml            # Orquestación Docker local
├── 📄 Dockerfile                    # Build multi-stage (Node + Python)
├── 📄 .env.example                  # Template de variables de entorno
├── 📄 .gitignore
├── 📄 .dockerignore
│
├── 📁 backend/                      # Django REST API
│   ├── 📄 manage.py                 # CLI de Django
│   ├── 📄 requirements.txt          # Dependencias Python
│   ├── 📄 db.sqlite3                # Base de datos de desarrollo
│   │
│   ├── 📁 reservia/                 # Configuración del proyecto Django
│   │   ├── 📄 settings.py           # Configuración principal (126 líneas)
│   │   ├── 📄 urls.py               # Router de URLs principal (25 líneas)
│   │   └── 📄 wsgi.py               # Punto de entrada WSGI
│   │
│   └── 📁 api/                      # App principal de Django
│       ├── 📄 models.py             # Modelos de base de datos (123 líneas)
│       ├── 📄 views.py              # Vistas API (262 líneas)
│       ├── 📄 views_frontend.py     # Sirve el SPA de React
│       ├── 📄 urls.py               # Rutas de la API (26 líneas)
│       ├── 📄 serializers.py        # Serializers DRF (176 líneas)
│       ├── 📄 admin.py              # Registro en Django Admin
│       ├── 📄 apps.py
│       ├── 📄 __init__.py
│       │
│       ├── 📁 management/
│       │   └── 📁 commands/
│       │       └── 📄 seed.py       # Comando de seeding de datos
│       │
│       └── 📁 migrations/
│           ├── 📄 0001_initial.py   # Migración inicial
│           └── 📄 0002_floorplan... # Migraciones de floor plan
│
└── 📁 frontend/                     # React TypeScript App
    ├── 📄 package.json              # Dependencias npm
    ├── 📄 vite.config.ts            # Configuración Vite
    ├── 📄 tsconfig.json             # Configuración TypeScript
    ├── 📄 eslint.config.js          # Reglas ESLint
    ├── 📄 index.html                # Punto de entrada HTML
    ├── 📄 .env.production           # Variables de entorno de producción
    │
    └── 📁 src/
        ├── 📄 main.tsx              # Punto de entrada React
        ├── 📄 App.tsx               # Componente raíz + routing
        ├── 📄 App.css               # Estilos globales
        ├── 📄 index.css             # Tailwind CSS
        │
        ├── 📁 api/                  # Capa de cliente HTTP
        │   ├── 📄 client.ts         # Cliente base (fetch wrapper)
        │   ├── 📄 auth.ts           # Endpoints de autenticación
        │   ├── 📄 restaurants.ts    # Consultas de restaurantes
        │   ├── 📄 reservations.ts   # API de reservas
        │   ├── 📄 floorPlan.ts      # API de planos
        │   └── 📄 chat.ts           # API del chatbot IA
        │
        ├── 📁 context/
        │   └── 📄 AuthContext.tsx   # Estado global de autenticación
        │
        ├── 📁 pages/                # Componentes de página
        │   ├── 📄 Home.tsx          # Lista de restaurantes
        │   ├── 📄 RestaurantDetails.tsx  # Detalle + reserva
        │   ├── 📄 MapExplorer.tsx   # Mapa interactivo
        │   ├── 📄 MyBookings.tsx    # Mis reservas
        │   ├── 📄 FloorPlanEditorPage.tsx  # Editor admin
        │   └── 📄 NotFound.tsx      # Página 404
        │
        ├── 📁 components/           # Componentes reutilizables
        │   ├── 📄 Header.tsx        # Navegación principal
        │   ├── 📄 Hero.tsx          # Sección hero del landing
        │   ├── 📄 AuthModal.tsx     # Modal login/registro
        │   ├── 📄 RestaurantCard.tsx # Tarjeta de restaurante
        │   ├── 📄 CategoryCard.tsx  # Tarjeta de categoría cocina
        │   ├── 📄 ChatBot.tsx       # Widget del chatbot IA
        │   │
        │   └── 📁 floorplan/        # Componentes de plano
        │       ├── 📄 SeatPicker.tsx      # UI de selección de asientos
        │       ├── 📄 FloorPlanCanvas.tsx  # Renderer del canvas
        │       ├── 📄 FloorPlanEditor.tsx  # Editor de admin
        │       └── 📄 Legend.tsx           # Leyenda de colores
        │
        ├── 📁 i18n/                 # Internacionalización
        │   ├── 📄 config.ts         # Configuración i18next
        │   ├── 📄 en.json           # Traducciones inglés
        │   └── 📄 es.json           # Traducciones español
        │
        ├── 📁 utils/
        │   └── 📄 seatGeometry.ts   # Cálculos de geometría para asientos
        │
        └── 📁 assets/
            └── 📁 images/           # Imágenes de categorías de cocina
```

---

## 📌 Archivos Clave

### Backend
| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `api/views.py` | 262 | Todas las 12 vistas API |
| `api/serializers.py` | 176 | 9 serializers + validación |
| `api/models.py` | 123 | 8 modelos de base de datos |
| `reservia/settings.py` | 126 | Configuración Django |
| `api/management/commands/seed.py` | — | Datos de prueba |

### Frontend
| Archivo | Descripción |
|---------|-------------|
| `src/App.tsx` | Raíz de la app y definición de rutas |
| `src/context/AuthContext.tsx` | Estado global de autenticación |
| `src/api/client.ts` | Cliente HTTP base |
| `src/pages/RestaurantDetails.tsx` | Página más compleja (reservas + plano) |
| `src/components/floorplan/SeatPicker.tsx` | Componente visual de asientos |

---

## 🔗 Links Relacionados

- [[System Architecture]] — Cómo interactúan estos archivos
- [[Database Schema]] — Modelos en detalle
- [[API Endpoints]] — Rutas del backend
- [[Pages & Routing]] — Páginas del frontend
