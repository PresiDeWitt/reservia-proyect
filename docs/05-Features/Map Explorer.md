---
tags: [reservia, features, map, leaflet, geolocation]
---

# Map Explorer

[[Home|← Volver al Home]]

## Overview

El Mapa Explorador permite a los usuarios descubrir restaurantes visualmente en un mapa interactivo, con soporte para geolocalización del usuario.

---

## 🗺️ Página

**Ruta**: `/map`
**Componente**: `MapExplorer.tsx`

---

## 📦 Tecnologías

| Librería | Versión | Uso |
|---------|---------|-----|
| Leaflet | 1.9.4 | Motor de mapas |
| React Leaflet | 5.0.0 | Integración con React |
| OpenStreetMap | — | Tiles del mapa (gratuito, no necesita API key) |

> [!tip] Sin API Key de Maps
> Al usar OpenStreetMap, no se necesita ninguna API key de Google Maps u otros servicios de mapas de pago.

---

## ✨ Funcionalidades

### Markers de Restaurantes
- Cada restaurante aparece como un marker en el mapa
- Usa las coordenadas `lat` y `lng` del modelo `Restaurant`
- Click en marker → popup con información del restaurante

### Popup de Restaurante
El popup muestra:
- Nombre del restaurante
- Tipo de cocina
- Rating
- Botón "Ver restaurante" → navega a `/restaurant/:id`

### Geolocalización
```typescript
// MapExplorer.tsx
useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude
        ])
        // Centra el mapa en la ubicación del usuario
        map.setView([lat, lng], 13)
      },
      (error) => {
        // Si se deniega, centra en posición por defecto
        console.warn('Geolocation denied:', error)
      }
    )
  }
}, [])
```

### Marker del Usuario
Si se obtiene geolocalización:
- Se muestra un marker especial para la ubicación del usuario
- Diferente icono o color para distinguirlo de los restaurantes

---

## 📍 Coordenadas de Restaurantes

Los 6 restaurantes pre-cargados tienen coordenadas reales:

| Restaurante | Lat | Lng |
|------------|-----|-----|
| The Golden Fork | ~40.71 | ~-74.00 |
| Sakura Gardens | ~40.72 | ~-73.98 |
| Prime Cuts | ~40.70 | ~-74.01 |
| El Centro Fusion | ~40.73 | ~-73.99 |
| Green Leaf | ~40.71 | ~-73.97 |
| Petit Paris Bistro | ~40.72 | ~-74.02 |

> [!note] Área aproximada
> Los restaurantes están distribuidos en el área de Manhattan, Nueva York.

---

## 🎨 Configuración del Mapa

```typescript
// Configuración base de Leaflet
const mapConfig = {
  center: [40.7128, -74.0060],  // New York por defecto
  zoom: 13,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors'
}
```

---

## 🔗 Integración con Chatbot

Los usuarios pueden combinar el mapa con el chatbot:
1. El chatbot detecta la ubicación GPS del usuario
2. Puede recomendar restaurantes cercanos
3. El usuario puede luego verlos en el mapa

Ver [[AI Chat Integration]] para detalles.

---

## 🔗 Links Relacionados

- [[Restaurant Discovery]] — Alternativa de descubrimiento sin mapa
- [[AI Chat Integration]] — Recomendaciones con geolocalización
- [[Tech Stack]] — Versiones de Leaflet
