---
tags: [reservia, frontend, components, react, ui]
---

# Components

[[Home|← Volver al Home]]

**Directorio**: `frontend/src/components/`

---

## 📋 Inventario de Componentes

### Componentes Globales

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| Header | `Header.tsx` | Navegación principal |
| Hero | `Hero.tsx` | Sección hero del landing |
| AuthModal | `AuthModal.tsx` | Modal login/registro |
| RestaurantCard | `RestaurantCard.tsx` | Tarjeta de restaurante |
| CategoryCard | `CategoryCard.tsx` | Tarjeta de tipo de cocina |
| ChatBot | `ChatBot.tsx` | Widget del chatbot IA |

### Componentes de Floor Plan

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| SeatPicker | `floorplan/SeatPicker.tsx` | Selección visual de asientos |
| FloorPlanCanvas | `floorplan/FloorPlanCanvas.tsx` | Renderer del canvas SVG |
| FloorPlanEditor | `floorplan/FloorPlanEditor.tsx` | Editor de admin |
| Legend | `floorplan/Legend.tsx` | Leyenda de colores |

---

## 🧩 Componentes Detallados

### `<Header />`

Barra de navegación fija en la parte superior de todas las páginas.

**Contenido**:
- Logo "ReserVia"
- Link al Mapa (`/map`)
- Link a Mis Reservas (`/my-bookings`) — solo si autenticado
- Botón Login/Register → abre `<AuthModal />`
- Botón Logout — si autenticado

**Props**: Ninguna (usa `AuthContext` directamente)

---

### `<Hero />`

Sección de bienvenida en la página principal.

**Contenido**:
- Título y subtítulo de la app
- Campo de búsqueda de restaurantes
- Animaciones con Framer Motion

**Props**:
```typescript
interface HeroProps {
  onSearch: (query: string) => void
}
```

---

### `<AuthModal />`

Modal para login y registro.

**Modos**: `login` | `register` (toggle interno)

**Campos Login**:
- Email
- Password

**Campos Registro**:
- Nombre
- Email
- Password

**Comportamiento**:
- Llama a `AuthContext.login()` o `AuthContext.register()`
- Cierra el modal tras éxito
- Muestra errores de validación

---

### `<RestaurantCard />`

Tarjeta de preview de un restaurante en la lista.

**Props**:
```typescript
interface RestaurantCardProps {
  restaurant: {
    id: number
    name: string
    cuisine: string
    rating: number
    price_range: string
    location: string
    image_url: string
    distance: number
  }
}
```

**Contenido**:
- Imagen del restaurante
- Nombre, tipo de cocina, precio
- Rating con estrellas
- Distancia
- Link a `/restaurant/:id`

---

### `<CategoryCard />`

Tarjeta de filtrado por tipo de cocina.

**Props**:
```typescript
interface CategoryCardProps {
  cuisine: string
  image: string
  isSelected: boolean
  onClick: () => void
}
```

**Imágenes de cocinas** (`src/assets/images/`):
- Italian, Japanese, Steakhouse, Fusion, Healthy, French
- Mexican, Burgers, Bakery, Asian, Sushi

---

### `<ChatBot />`

Widget flotante del asistente IA. Aparece en todas las páginas.

**Comportamiento**:
- Botón flotante en esquina inferior derecha
- Click → abre panel de chat
- Solicita permiso de geolocalización
- Mantiene historial de la conversación en estado local
- Anima entrada/salida con Framer Motion

**Estado interno**:
```typescript
const [isOpen, setIsOpen] = useState(false)
const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState('')
const [location, setLocation] = useState<{lat, lng} | null>(null)
```

---

## 🏢 Componentes de Floor Plan

### `<SeatPicker />`

Vista interactiva del plano para que el usuario elija asientos.

**Props**:
```typescript
interface SeatPickerProps {
  floorPlan: FloorPlanData
  seats: SeatAvailability[]
  selectedSeats: number[]
  guestCount: number
  onSeatToggle: (seatId: number) => void
}
```

**Visualización de asientos**:
| Color | Estado |
|-------|--------|
| 🟢 Verde | Disponible |
| 🔴 Rojo | Ocupado |
| 🟡 Amarillo/Naranja | Seleccionado |
| ⚫ Gris | No disponible |

---

### `<FloorPlanCanvas />`

Renderer SVG del plano de piso.

**Responsabilidades**:
- Dibuja el canvas con el color de fondo
- Renderiza mesas por forma (round/square/rectangular)
- Posiciona asientos alrededor de cada mesa
- Aplica rotaciones

**Cálculos de geometría**: Delega a `src/utils/seatGeometry.ts`

---

### `<FloorPlanEditor />`

Panel de edición para admins.

**Funcionalidades**:
- Lista de mesas existentes
- Formulario para añadir/editar mesa
- Controles de posición, tamaño, rotación
- Selector de forma
- Configuración de capacidad
- Botón guardar → llama a `PUT /api/restaurants/:id/floor-plan/edit/`

---

### `<Legend />`

Leyenda visual del floor plan.

**Contenido**: Indicadores de color para disponible, ocupado, seleccionado.

---

## 🔗 Links Relacionados

- [[Pages & Routing]] — Páginas donde se usan estos componentes
- [[State Management]] — AuthContext usado en Header y AuthModal
- [[Floor Plan System]] — Sistema completo de planos
- [[AI Chat Integration]] — ChatBot en detalle
