---
tags:
  - reservia
  - features
  - search
  - discovery
---

# 🔍 Restaurant Discovery

[[Home|← Volver al Home]]

> [!abstract] Vista General
> La funcionalidad de descubrimiento permite a los usuarios ==explorar, buscar y filtrar== los restaurantes disponibles en Reservia a través de múltiples métodos.

---

## 🖥️ Interfaz Principal

> [!info] Página de Inicio
> La página principal (==/==) contiene tres secciones clave:
>
> 1. 🔍 **Hero con buscador** — Campo de búsqueda ==prominente y central==
> 2. 🏷️ **Categorías de cocina** — Filtros visuales por tipo de comida
> 3. 🃏 **Grid de restaurantes** — Tarjetas con todos los restaurantes disponibles

---

## 🔍 Búsqueda de Restaurantes

> [!tip] Búsqueda en Tiempo Real
> El sistema busca de forma ==instantánea== mientras el usuario escribe.
>
> **Se puede buscar por:**
> - 🏷️ **Nombre** del restaurante
> - 🍽️ **Tipo de cocina** (Italiana, Japonesa, etc.)
> - 📍 **Ubicación** del restaurante
>
> Todas las búsquedas son ==case-insensitive== (no importan mayúsculas/minúsculas).

---

## 🏷️ Filtrado por Cocina

> [!tip] Categorías Dinámicas
> Las categorías de cocina se ==calculan dinámicamente== desde los restaurantes disponibles.
>
> **Flujo:**
> 1. 📥 Se obtienen las cocinas únicas disponibles
> 2. 🃏 Se muestran como tarjetas de categoría visuales
> 3. 👆 Click en una categoría → ==filtra la lista== de restaurantes
> 4. 🔄 Click de nuevo → ==quita el filtro==

---

## 🃏 Tarjeta de Restaurante

> [!example] Información Mostrada en Cada Tarjeta
> | Emoji | Campo | Descripción |
> |-------|-------|-------------|
> | 🖼️ | **Imagen** | Foto del restaurante |
> | 🏷️ | **Nombre** | Nombre del restaurante |
> | 🍽️ | **Cocina** | Tipo de cocina (traducida con i18n) |
> | ⭐ | **Rating** | Puntuación con estrellas |
> | 💰 | **Precio** | Rango de precios ($, $$, $$$) |
> | 📍 | **Ubicación** | Dirección o zona |
> | 📏 | **Distancia** | Distancia en km desde el usuario |
>
> 👆 Click en la tarjeta → navega a la ==página de detalle== del restaurante.

---

## 📊 Ordenamiento

> [!info] Orden por Defecto
> Los restaurantes se muestran ordenados por ==rating descendente== (mejores primero). Este orden viene definido directamente en el modelo de datos.

---

## 🤖 Búsqueda con Inteligencia Artificial

> [!abstract] Descubrimiento con IA
> Además de la búsqueda directa, los usuarios pueden usar el ==chatbot== para encontrar restaurantes en ==lenguaje natural==:
>
> - 💬 *"Quiero algo romántico y no muy caro"*
> - 🍣 *"¿Qué hay de sushi por aquí cerca?"*
> - 💼 *"Recomiéndame el mejor para una cena de negocios"*
>
> El chatbot entiende contexto, preferencias y ubicación para dar ==recomendaciones personalizadas==.
>
> Ver [[AI Chat Integration]] para más detalles.

---

## 🗺️ Exploración por Mapa

> [!tip] Alternativa Visual
> Como alternativa a la lista, el ==Map Explorer== muestra todos los restaurantes en un mapa interactivo con coordenadas GPS reales.
>
> - 📍 Markers en posiciones reales de Manhattan
> - 👤 Marker especial para la ubicación del usuario
> - 💬 Popups con información del restaurante
>
> Ver [[Map Explorer]] para más detalles.

---

## 🔗 Links Relacionados

- [[API Endpoints]] — Endpoints de restaurantes
- [[Map Explorer]] — Descubrimiento por mapa
- [[AI Chat Integration]] — Búsqueda con IA
- [[Reservation System]] — Siguiente paso tras descubrir un restaurante
