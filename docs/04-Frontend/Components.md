---
tags:
  - reservia
  - frontend
  - components
  - react
---

# 🧩 Components

[[Home|← Volver al Home]]

==Directorio==: **frontend/src/components/**

---

## 📋 Inventario de Componentes

> [!abstract] Componentes Globales
> - 🧭 **Header** → Navegación principal
> - 🌟 **Hero** → Sección hero del landing
> - 🔐 **AuthModal** → Modal login/registro
> - 🍽️ **RestaurantCard** → Tarjeta de restaurante
> - 🏷️ **CategoryCard** → Tarjeta de tipo de cocina
> - 🤖 **ChatBot** → Widget del chatbot IA

> [!abstract] Componentes de Floor Plan
> - 💺 **SeatPicker** → Selección visual de asientos
> - 🎨 **FloorPlanCanvas** → Renderer del canvas SVG
> - ✏️ **FloorPlanEditor** → Editor de admin
> - 🏷️ **Legend** → Leyenda de colores

---

## 🧩 Componentes Detallados

> [!example] 🧭 Header
> Barra de navegación fija en la parte superior de todas las páginas.
>
> **Contenido:**
> - Logo ==ReserVia==
> - Link al Mapa → **/map**
> - Link a Mis Reservas → **/my-bookings** (solo si autenticado)
> - Botón Login/Register → abre [[Components#🔐 AuthModal|AuthModal]]
> - Botón Logout (si autenticado)
>
> **Props:** Ninguna — usa [[State Management|AuthContext]] directamente

---

> [!example] 🌟 Hero
> Sección de bienvenida en la página principal.
>
> **Contenido:**
> - Título y subtítulo de la app
> - Campo de búsqueda de restaurantes
> - Animaciones con ==Framer Motion==
>
> **Props:**
> - **onSearch** → función que recibe el texto de búsqueda (string)

---

> [!example] 🔐 AuthModal
> Modal para login y registro con toggle interno entre modos.
>
> **Modos:** ==login== | ==register==
>
> **Campos Login:**
> - **Email**
> - **Password**
>
> **Campos Registro:**
> - **Nombre**
> - **Email**
> - **Password**
>
> **Comportamiento:**
> - Llama a [[State Management|AuthContext]].login() o .register()
> - Cierra el modal tras éxito
> - Muestra errores de validación

---

> [!example] 🍽️ RestaurantCard
> Tarjeta de preview de un restaurante en la lista.
>
> **Props:**
> - **restaurant.id** → número identificador
> - **restaurant.name** → nombre del restaurante
> - **restaurant.cuisine** → tipo de cocina
> - **restaurant.rating** → puntuación numérica
> - **restaurant.price_range** → rango de precio
> - **restaurant.location** → ubicación
> - **restaurant.image_url** → URL de la imagen
> - **restaurant.distance** → distancia al usuario
>
> **Muestra:**
> - Imagen del restaurante
> - Nombre, tipo de cocina, precio
> - Rating con ⭐ estrellas
> - Distancia
> - Link a → [[Pages & Routing|/restaurant/:id]]

---

> [!example] 🏷️ CategoryCard
> Tarjeta de filtrado por tipo de cocina.
>
> **Props:**
> - **cuisine** → nombre del tipo de cocina (string)
> - **image** → URL de la imagen (string)
> - **isSelected** → si está seleccionada (boolean)
> - **onClick** → función al hacer click
>
> **Cocinas disponibles:**
> 🇮🇹 Italian · 🇯🇵 Japanese · 🥩 Steakhouse · 🔀 Fusion · 🥗 Healthy · 🇫🇷 French · 🇲🇽 Mexican · 🍔 Burgers · 🥐 Bakery · 🍜 Asian · 🍣 Sushi

---

> [!example] 🤖 ChatBot
> Widget flotante del asistente IA. Aparece en ==todas las páginas==.
>
> **Comportamiento:**
> - Botón flotante en esquina inferior derecha
> - Click → abre panel de chat
> - Solicita permiso de geolocalización
> - Mantiene historial de conversación en estado local
> - Anima entrada/salida con ==Framer Motion==
>
> **Estado interno:**
> - **isOpen** → si el chat está abierto (boolean)
> - **messages** → lista de mensajes del chat
> - **input** → texto actual del input
> - **location** → coordenadas lat/lng del usuario (o null)
>
> Ver [[AI Chat Integration]] para más detalles.

---

## 🏢 Componentes de Floor Plan

> [!tip] 💺 SeatPicker
> Vista interactiva del plano para que el usuario elija asientos.
>
> **Props:**
> - **floorPlan** → datos del plano (FloorPlanData)
> - **seats** → disponibilidad de asientos
> - **selectedSeats** → IDs de asientos seleccionados
> - **guestCount** → número de comensales
> - **onSeatToggle** → función al seleccionar/deseleccionar un asiento
>
> **Esquema de Colores:**
>
> | Color | Estado |
> |-------|--------|
> | 🟢 Verde | Disponible |
> | 🔴 Rojo | Ocupado |
> | 🟡 Amarillo/Naranja | Seleccionado |
> | ⚫ Gris | No disponible |

---

> [!tip] 🎨 FloorPlanCanvas
> Renderer SVG del plano de piso.
>
> **Responsabilidades:**
> - Dibuja el canvas con el color de fondo
> - Renderiza mesas por forma → ==round== / ==square== / ==rectangular==
> - Posiciona asientos alrededor de cada mesa
> - Aplica rotaciones
>
> **Geometría:** delega cálculos a **src/utils/seatGeometry.ts**

---

> [!tip] ✏️ FloorPlanEditor
> Panel de edición para admins.
>
> **Funcionalidades:**
> - Lista de mesas existentes
> - Formulario para añadir/editar mesa
> - Controles de posición, tamaño, rotación
> - Selector de forma
> - Configuración de capacidad
> - Botón guardar → llama a **PUT /api/restaurants/:id/floor-plan/edit/**
>
> Ver [[Floor Plan System]] para el sistema completo.

---

> [!tip] 🏷️ Legend
> Leyenda visual del floor plan.
>
> **Contenido:** Indicadores de color para ==disponible==, ==ocupado== y ==seleccionado==.

---

## 🔗 Links Relacionados

- [[Pages & Routing]] — Páginas donde se usan estos componentes
- [[State Management]] — AuthContext usado en Header y AuthModal
- [[Floor Plan System]] — Sistema completo de planos
- [[AI Chat Integration]] — ChatBot en detalle
