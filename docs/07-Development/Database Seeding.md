---
tags:
  - reservia
  - development
  - seeding
  - data
---

# 🌱 Database Seeding

[[Home|← Volver al Home]]

---

## 🌊 Visión General

El comando seed popula la base de datos con datos de prueba: ==6 restaurantes completos== con menús, planos de piso, mesas y asientos.

📂 **Archivo fuente:** backend/api/management/commands/seed.py

---

## 🚀 Ejecutar el Seed

> [!info] ▶️ Cómo ejecutar
> Desde el directorio ==backend/== con el entorno virtual activado, ejecutar el comando seed de manage.py.

> [!info] 🔄 Idempotente
> El seed es ==idempotente== — si ya existen datos, no los duplica. Usa get_or_create internamente para verificar existencia antes de crear.

> [!info] 🐳 Auto-ejecutado en Docker
> En producción y Docker, el seed se ejecuta ==automáticamente al iniciar== el contenedor, después de las migraciones y antes de Gunicorn.

---

## 🍽️ Restaurantes Creados

> [!example] 🍝 1. The Golden Fork
> **Cocina:** Italian | **Rating:** ⭐ 4.8 | **Precio:** ==$$==
>
> 🪑 **10 mesas** (mix de redondas, cuadradas, rectangulares) → ~40 asientos
>
> 📜 **Menú:**
> - 🍝 Pasta Carbonara
> - 🍚 Risotto
> - 🍰 Tiramisu
> - 🥖 Bruschetta
> - 🍕 Pizza Margherita

> [!example] 🌸 2. Sakura Gardens
> **Cocina:** Japanese | **Rating:** ⭐ 4.7 | **Precio:** ==$$$==
>
> 🪑 **8 mesas** (estilo minimalista)
>
> 📜 **Menú:**
> - 🐟 Sashimi
> - 🍜 Ramen
> - 🍤 Tempura
> - 🍡 Mochi
> - 🫛 Edamame

> [!example] 🥩 3. Prime Cuts
> **Cocina:** Steakhouse | **Rating:** ⭐ 4.6 | **Precio:** ==$$$==
>
> 🪑 **7 mesas** (espaciosas)
>
> 📜 **Menú:**
> - 🥩 Ribeye
> - 🥩 Filet Mignon
> - 🦞 Lobster Tail
> - 🥗 Caesar Salad
> - 🍰 Cheesecake

> [!example] 🌮 4. El Centro Fusion
> **Cocina:** Fusion | **Rating:** ⭐ 4.5 | **Precio:** ==$$==
>
> 🪑 **Mesas variadas** (configuración amplia)
>
> 📜 **Menú:**
> - 🌮 Tacos de atún
> - 🥟 Gyoza
> - 🐟 Ceviche
> - 🍜 Pad Thai
> - 🍫 Brownie

> [!example] 🥗 5. Green Leaf
> **Cocina:** Healthy | **Rating:** ⭐ 4.4 | **Precio:** ==$==
>
> 🪑 **Configuración orgánica** (mesas redondas)
>
> 📜 **Menú:**
> - 🥗 Buddha Bowl
> - 🫐 Smoothie Bowl
> - 🥬 Quinoa Salad
> - 🥑 Avocado Toast
> - 🫐 Açaí Bowl

> [!example] 🥐 6. Petit Paris Bistro
> **Cocina:** French | **Rating:** ⭐ ==4.9== (¡el más alto!) | **Precio:** ==$$$==
>
> 🪑 **Estilo bistró clásico** (mesas pequeñas redondas y cuadradas)
>
> 📜 **Menú:**
> - 🥐 Croissant
> - 🫓 Crêpes
> - 🍗 Coq au Vin
> - 🐟 Bouillabaisse
> - 🍮 Crème Brûlée

---

## 🏗️ Proceso de Seeding

▶️ **Ejecutar seed**
⬇️
🍽️ **Crear Restaurant** (get_or_create)
⬇️ ↘️
📜 **Crear MenuItems** (4-5 por restaurante) | 📐 **Crear FloorPlan** (1 por restaurante)
                                                ⬇️
                                          🪑 **Crear Tables** (configuración específica)
                                                ⬇️
                                          💺 **Crear Seats** (según capacidad de cada mesa)
                                                ⬇️
                                          ✅ ==Seed completado==

---

## 💺 Generación de Asientos

> [!info] 🔤 Sistema de Etiquetado
> Para cada mesa, se generan automáticamente los asientos según su capacidad. Cada asiento recibe una etiqueta combinando el ==label de la mesa + una letra== del abecedario.
>
> **Ejemplo:** Mesa "T1" con capacidad 4:
> - 💺 T1-A (asiento 0)
> - 💺 T1-B (asiento 1)
> - 💺 T1-C (asiento 2)
> - 💺 T1-D (asiento 3)

---

## 📐 Estilos de Floor Plan por Restaurante

> [!info] 🗺️ Diseños Únicos
>
> | Restaurante | Estilo | Formas de Mesas |
> |------------|--------|-----------------|
> | 🍝 The Golden Fork | Clásico europeo | ⭕ Redondas, ⬜ Cuadradas, ▬ Rectangulares |
> | 🌸 Sakura Gardens | Minimalista | ▬ Rectangulares, ⬜ Cuadradas |
> | 🥩 Prime Cuts | Espacioso | ▬ Grandes rectangulares |
> | 🌮 El Centro Fusion | Dinámico | 🔀 Formas mixtas |
> | 🥗 Green Leaf | Orgánico | ⭕ Redondas |
> | 🥐 Petit Paris Bistro | Bistró parisino | ⭕ Redondas pequeñas, ⬜ Cuadradas pequeñas |

---

## 📍 Coordenadas GPS

> [!info] 🗺️ Ubicaciones Reales
> Los restaurantes tienen coordenadas reales en el ==área de Manhattan, NY== para funcionar con el [[Map Explorer]]. Esto permite visualizarlos en un mapa interactivo con sus ubicaciones geográficas.

---

## 🔄 Resetear y Re-seedar

> [!warning] 🗑️ Opciones de Reset
>
> **Opción A — Solo limpiar datos:**
> Ejecutar flush con --noinput, luego ejecutar seed nuevamente
>
> **Opción B — Reset completo:**
> Eliminar el archivo db.sqlite3, luego ejecutar migrate y seed
>
> **Opción C — Desde Docker:**
> Detener y eliminar volúmenes con docker-compose down -v, luego reconstruir con docker-compose up --build

---

## 🔗 Links Relacionados

- [[Local Setup]] — Cómo ejecutar el seed en desarrollo
- [[Database Schema]] — Modelos que se crean
- [[Floor Plan System]] — Planos que se generan
- [[Docker Setup]] — Seed automático en Docker
