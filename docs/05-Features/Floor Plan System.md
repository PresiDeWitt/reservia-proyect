---
tags:
  - reservia
  - features
  - floor-plan
  - editor
---

# 🏗️ Floor Plan System

[[Home|← Volver al Home]]

> [!abstract] Vista General
> El sistema de planos de piso permite a los restaurantes ==configurar visualmente== la distribución de sus mesas, y a los usuarios ==seleccionar asientos específicos== al reservar.

---

## 🎨 Esquema de Colores de Asientos

> [!example] Leyenda Visual
> | Color | Significado |
> |-------|-------------|
> | 🟢 **Verde** | ==Disponible== — el asiento puede ser seleccionado |
> | 🔴 **Rojo** | ==Ocupado== — otro comensal ya lo reservó |
> | 🟠 **Naranja** | ==Seleccionado== — el usuario actual lo eligió |
> | ⚪ **Vacío** | ==Sin asiento== — espacio libre en la mesa |

---

## 📐 Componentes del Sistema

> [!tip] 🖼️ FloorPlanCanvas — Renderizador Visual
> El canvas es un ==renderer SVG puro== del plano. Dibuja mesas y asientos de forma visual, sin interacción del usuario.
>
> **Formas de mesa soportadas:**
>
> | Emoji | Forma | Descripción |
> |-------|-------|-------------|
> | 🔵 | **Redonda** | Mesa circular, asientos distribuidos alrededor |
> | 🟦 | **Cuadrada** | Mesa cuadrada, asientos en los lados |
> | 🟩 | **Rectangular** | Mesa alargada, asientos en el perímetro |
>
> Los asientos se posicionan automáticamente: en mesas redondas se distribuyen en ==círculo==, y en cuadradas/rectangulares se distribuyen en el ==perímetro==.

---

> [!tip] 💺 SeatPicker — Selección Interactiva
> Vista interactiva del plano para usuarios que están haciendo una reserva.
>
> **Comportamiento:**
> - 👆 Click en asiento disponible → ==selecciona o deselecciona==
> - 🚫 Los asientos ocupados ==no se pueden clickear==
> - 🔢 El límite de selección es igual al ==número de comensales==
>
> Los colores cambian dinámicamente según el estado de cada asiento.

---

> [!tip] ✏️ FloorPlanEditor — Editor para Administradores
> Editor ==drag-and-drop== para que los administradores configuren el plano del restaurante.
>
> **Operaciones disponibles:**
> - ➕ **Añadir mesa** — Formulario completo con forma, capacidad y posición
> - ✏️ **Editar mesa** — Click en una mesa para abrir el panel de edición
> - 🗑️ **Eliminar mesa** — Botón de eliminar en el panel lateral
> - 📍 **Posicionar** — Ingreso manual de coordenadas X/Y
> - 💾 **Guardar** — Envía toda la configuración al backend

---

> [!tip] 🏷️ Legend — Leyenda de Colores
> Componente visual que acompaña al SeatPicker, mostrando el significado de cada color:
> - 🟢 Verde = Disponible
> - 🔴 Rojo = Ocupado
> - 🟠 Naranja = Seleccionado

---

## 🗄️ Modelo de Datos

> [!info] Estructura de un FloorPlan
> Un plano completo contiene:
>
> | Elemento | Descripción |
> |----------|-------------|
> | 📐 **FloorPlan** | Contenedor principal con ==ancho==, ==alto== y ==color de fondo== |
> | 🪑 **Tables** | Cada mesa tiene etiqueta, forma, posición (X/Y), rotación y capacidad |
> | 💺 **Seats** | Cada asiento pertenece a una mesa y tiene un índice y etiqueta (ej: T1-A, T1-B) |
>
> **Ejemplo visual de una mesa:**
> - Mesa ==T1== — Redonda, capacidad 4
>   - 💺 T1-A, 💺 T1-B, 💺 T1-C, 💺 T1-D

---

## 📏 Dimensiones del Canvas

| Dimensión | Valor por defecto | Descripción |
|-----------|-------------------|-------------|
| Ancho | ==1000px== | Ancho del área de diseño |
| Alto | ==700px== | Alto del área de diseño |
| Fondo | ==Gris claro== | Color de fondo del canvas |

---

## 🔄 Proceso de Guardado

> [!warning] Reemplazo Completo
> Al guardar, el backend ==elimina todas las mesas y asientos anteriores== y los recrea desde cero. No se hacen actualizaciones individuales (upserts).

> [!note] Pasos del Guardado
> 1. 👨‍💼 El administrador configura mesas y asientos en el editor
> 2. 💾 Click en "Guardar"
> 3. 📤 Se envía toda la configuración al backend
> 4. 🗑️ El backend elimina las tablas antiguas del FloorPlan
> 5. 🆕 Crea nuevas mesas (Tables)
> 6. 💺 Para cada mesa, crea los asientos con letras (A, B, C...)
> 7. ✅ Devuelve el FloorPlan actualizado

---

## 🏗️ Generación de Asientos

> [!info] Etiquetado Automático
> Los asientos se generan automáticamente usando letras del abecedario:
>
> - Mesa ==T1== con capacidad 4 → **T1-A**, **T1-B**, **T1-C**, **T1-D**
> - Mesa ==T2== con capacidad 6 → **T2-A**, **T2-B**, **T2-C**, **T2-D**, **T2-E**, **T2-F**
>
> Se soportan hasta ==26 asientos== por mesa (letras A-Z).

---

## 🏛️ Arquitectura

> [!abstract] Flujo del Sistema
> **Lado Admin:**
> - La página del editor carga el componente ==FloorPlanEditor==
> - Al guardar, se envía un PUT al backend con toda la configuración
> - El backend persiste FloorPlan → Tables → Seats
>
> **Lado Usuario:**
> - El ==SeatPicker== usa el ==FloorPlanCanvas== para renderizar
> - Se consulta la disponibilidad de asientos por fecha y hora
> - Los asientos ocupados vienen marcados desde la API

---

## 🔗 Links Relacionados

- [[Reservation System]] — Cómo se usa el floor plan en reservas
- [[Database Schema]] — Modelos FloorPlan, Table, Seat
- [[API Endpoints]] — Endpoints de floor plan y disponibilidad
- [[Database Seeding]] — Cómo se generan los planos iniciales
