---
tags:
  - reservia
  - features
  - map
  - leaflet
---

# 🗺️ Map Explorer

[[Home|← Volver al Home]]

> [!abstract] Vista General
> El Mapa Explorador permite a los usuarios ==descubrir restaurantes visualmente== en un mapa interactivo, con soporte para ==geolocalización== del usuario.

---

## 📍 Página

> [!info] Ruta de Acceso
> - **Ruta:** ==/map==
> - **Componente:** MapExplorer

---

## 📦 Tecnologías del Mapa

> [!success] Stack de Mapas
> | Tecnología | Uso |
> |------------|-----|
> | 🗺️ **Leaflet** (v1.9.4) | Motor principal de mapas |
> | ⚛️ **React Leaflet** (v5.0.0) | Integración con React |
> | 🌍 **OpenStreetMap** | Tiles del mapa gratuitos |

> [!tip] Sin API Key de Maps
> Al usar OpenStreetMap, ==no se necesita ninguna API key== de Google Maps u otros servicios de mapas de pago. Totalmente gratuito.

---

## ✨ Funcionalidades

> [!note] 📌 Markers de Restaurantes
> - Cada restaurante aparece como un ==marker en el mapa==
> - Usa las coordenadas de latitud y longitud del modelo Restaurant
> - 👆 Click en marker → se abre un ==popup con información==

> [!note] 💬 Popup de Restaurante
> Al hacer click en un marker se muestra:
> - 🏷️ **Nombre** del restaurante
> - 🍽️ **Tipo de cocina**
> - ⭐ **Rating**
> - 🔗 Botón **"Ver restaurante"** → navega a la página de detalle

> [!note] 👤 Marker del Usuario
> Si se obtiene geolocalización:
> - Se muestra un ==marker especial== para la ubicación del usuario
> - Con un ==icono diferente== para distinguirlo de los restaurantes

---

## 📍 Geolocalización

> [!info] Cómo Funciona la Geolocalización
> 1. 🔍 Al cargar la página, se solicita ==permiso de ubicación== al navegador
> 2. ✅ Si el usuario acepta → el mapa se ==centra en su ubicación== con zoom 13
> 3. ❌ Si el usuario deniega → el mapa se centra en la ==posición por defecto== (Nueva York)
> 4. 📌 Se coloca un marker especial en la posición del usuario

---

## 🍽️ Restaurantes en el Mapa

> [!example] Ubicaciones Pre-cargadas
> Todos los restaurantes están distribuidos en el área de ==Manhattan, Nueva York==:
>
> | Emoji | Restaurante | Zona |
> |-------|-------------|------|
> | 🍴 | **The Golden Fork** | Downtown Manhattan |
> | 🌸 | **Sakura Gardens** | Midtown Este |
> | 🥩 | **Prime Cuts** | Financial District |
> | 🌮 | **El Centro Fusion** | Upper Manhattan |
> | 🥗 | **Green Leaf** | East Village |
> | 🥐 | **Petit Paris Bistro** | West Side |

> [!note] Área Aproximada
> Los restaurantes están distribuidos en coordenadas reales alrededor de ==40.71° N, 74.00° W== (Manhattan).

---

## ⚙️ Configuración del Mapa

> [!info] Valores por Defecto
> | Parámetro | Valor |
> |-----------|-------|
> | 📍 Centro | ==Nueva York== (40.7128, -74.0060) |
> | 🔍 Zoom | ==13== |
> | 🗺️ Tiles | OpenStreetMap |
> | ©️ Atribución | OpenStreetMap contributors |

---

## 🤖 Integración con Chatbot

> [!abstract] Combinación Mapa + IA
> Los usuarios pueden combinar el mapa con el chatbot:
>
> 1. 🤖 El chatbot ==detecta la ubicación GPS== del usuario
> 2. 💡 Puede ==recomendar restaurantes cercanos==
> 3. 🗺️ El usuario puede luego verlos en el mapa
>
> Ver [[AI Chat Integration]] para detalles.

---

## 🔗 Links Relacionados

- [[Restaurant Discovery]] — Alternativa de descubrimiento sin mapa
- [[AI Chat Integration]] — Recomendaciones con geolocalización
- [[Tech Stack]] — Versiones de Leaflet
