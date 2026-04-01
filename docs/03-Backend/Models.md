---
tags:
  - reservia
  - backend
  - models
  - django
---

# 🗃️ Models

[[Home|← Volver al Home]]

**Archivo** → ==backend/api/models.py== (123 líneas)

> Para el diagrama ER completo ver [[Database Schema]].

---

## 📊 Resumen de Modelos

> [!info] 🏗️ Arquitectura de datos
>
> | Modelo | Tabla DB | Descripción |
> |--------|----------|-------------|
> | **Restaurant** | api_restaurant | Restaurantes disponibles |
> | **MenuItem** | api_menuitem | Platos del menú |
> | **Reservation** | api_reservation | Reservas de usuarios |
> | **FloorPlan** | api_floorplan | Configuración del plano |
> | **Table** | api_table | Mesas dentro de un plano |
> | **Seat** | api_seat | Asientos dentro de una mesa |
> | **SeatReservation** | api_seatreservation | Relación asiento ↔ reserva |

---

## 🍽️ Restaurant

> [!abstract] Modelo Restaurant
>
> - **name** → CharField (max 200) — nombre del restaurante
> - **cuisine** → CharField (max 100) — tipo de cocina
> - **location** → CharField (max 200) — zona/ubicación
> - **distance** → FloatField — distancia en km (default: ==0==)
> - **rating** → FloatField — puntuación promedio (default: ==0==)
> - **price_range** → CharField (max 10) — rango de precio
> - **address** → CharField (max 300) — dirección completa
> - **description** → TextField — descripción del restaurante
> - **lat** / **lng** → FloatField — coordenadas GPS
> - **image_url** → URLField (max 500) — imagen del restaurante
> - **reviews_count** → IntegerField — número de reseñas
>
> 📌 **Ordenamiento** → por ==-rating== (mayor puntuación primero)
>
> **Relaciones:**
> - [[Models#🥗 MenuItem|MenuItem]] ← muchos platos pertenecen a un restaurante
> - [[Models#📅 Reservation|Reservation]] ← muchas reservas por restaurante
> - [[Models#🏢 FloorPlan|FloorPlan]] ← un plano por restaurante (OneToOne)

---

## 🥗 MenuItem

> [!abstract] Modelo MenuItem
>
> - **restaurant** → ForeignKey → [[Models#🍽️ Restaurant|Restaurant]] _(CASCADE)_
> - **name** → CharField (max 200) — nombre del plato
> - **description** → TextField — descripción del plato
> - **price** → FloatField — precio
>
> **Relación:** MenuItem → pertenece a → [[Models#🍽️ Restaurant|Restaurant]]

---

## 📅 Reservation

> [!abstract] Modelo Reservation
>
> - **user** → ForeignKey → ==User de Django== _(CASCADE)_
> - **restaurant** → ForeignKey → [[Models#🍽️ Restaurant|Restaurant]] _(CASCADE)_
> - **date** → DateField — fecha de la reserva
> - **time** → TimeField — hora de la reserva
> - **guests** → IntegerField — número de comensales
> - **status** → CharField — opciones: =="confirmed"== | =="cancelled"==  (default: ==confirmed==)
> - **created_at** → DateTimeField — fecha de creación (automático)
>
> 📌 **Ordenamiento** → por ==-date==, ==-time== (más recientes primero)
>
> **Relaciones:**
> - User → un usuario tiene muchas reservas
> - [[Models#🍽️ Restaurant|Restaurant]] → un restaurante tiene muchas reservas
> - [[Models#🔗 SeatReservation|SeatReservation]] ← asientos asignados a esta reserva

> [!warning] ⚠️ Validación de comensales
> La validación de ==1-20 comensales== se hace en el ==ReservationSerializer==, no en el modelo.

---

## 🏢 FloorPlan

> [!abstract] Modelo FloorPlan
>
> - **restaurant** → OneToOneField → [[Models#🍽️ Restaurant|Restaurant]] _(CASCADE)_
> - **width** → IntegerField — ancho del plano (default: ==1000==)
> - **height** → IntegerField — alto del plano (default: ==700==)
> - **background_color** → CharField (max 20) — color de fondo (default: ==#F8F9FA==)
> - **updated_at** → DateTimeField — última modificación (automático)
>
> **Relación:** FloorPlan → pertenece a → [[Models#🍽️ Restaurant|Restaurant]] (1:1)
> **Relación:** FloorPlan ← contiene muchas → [[Models#🪑 Table|Table]]

---

## 🪑 Table

> [!abstract] Modelo Table
>
> - **floor_plan** → ForeignKey → [[Models#🏢 FloorPlan|FloorPlan]] _(CASCADE)_
> - **label** → CharField (max 50) — etiqueta (ej: =="T1"==)
> - **shape** → CharField — opciones: =="round"== | =="square"== | =="rectangular"==
> - **x** / **y** → FloatField — posición en el plano
> - **width** / **height** → FloatField — dimensiones
> - **rotation** → FloatField — ángulo de rotación (default: ==0==)
> - **capacity** → IntegerField — capacidad máxima de la mesa
> - **min_capacity** → IntegerField — capacidad mínima (default: ==1==)
>
> 📌 **Ordenamiento** → por ==label==
>
> **Relación:** Table → pertenece a → [[Models#🏢 FloorPlan|FloorPlan]]
> **Relación:** Table ← contiene muchos → [[Models#💺 Seat|Seat]]

---

## 💺 Seat

> [!abstract] Modelo Seat
>
> - **table** → ForeignKey → [[Models#🪑 Table|Table]] _(CASCADE)_
> - **seat_index** → IntegerField — índice del asiento en la mesa
> - **label** → CharField (max 50) — etiqueta (ej: =="T1-A"==, =="T1-B"==)
>
> 📌 **Restricción única** → combinación de ==table== + ==seat_index==
> 📌 **Ordenamiento** → por ==seat_index==
>
> **Generación de etiquetas:** Las etiquetas se generan automáticamente con el patrón ==T1-A==, ==T1-B==, ==T1-C==... usando letras del alfabeto.
>
> **Relación:** Seat → pertenece a → [[Models#🪑 Table|Table]]

---

## 🔗 SeatReservation

> [!abstract] Modelo SeatReservation (tabla intermedia)
>
> - **reservation** → ForeignKey → [[Models#📅 Reservation|Reservation]] _(CASCADE)_
> - **seat** → ForeignKey → [[Models#💺 Seat|Seat]] _(CASCADE)_
>
> 📌 **Restricción única** → combinación de ==reservation== + ==seat==
>
> **Conecta:** [[Models#📅 Reservation|Reservation]] ↔ [[Models#💺 Seat|Seat]] (relación muchos a muchos)

---

## 📊 Serializers Relacionados

> [!info] 🔄 Serializers disponibles
>
> | Serializer | Modelo | Uso |
> |-----------|--------|-----|
> | **RestaurantListSerializer** | Restaurant | Lista de restaurantes |
> | **RestaurantDetailSerializer** | Restaurant | Detalle con menú |
> | **MenuItemSerializer** | MenuItem | Items del menú |
> | **ReservationSerializer** | Reservation | CRUD de reservas |
> | **FloorPlanSerializer** | FloorPlan | Plano completo |
> | **TableSerializer** | Table | Mesa con asientos |
> | **SeatSerializer** | Seat | Asiento individual |
> | **SeatAvailabilitySerializer** | Seat | Disponibilidad |
>
> **Archivo** → ==backend/api/serializers.py== (176 líneas)

---

## 🔗 Links Relacionados

- [[Database Schema]] — Diagrama ER visual
- [[API Endpoints]] — Cómo se exponen estos modelos
- [[Database Seeding]] — Cómo se pobla la base de datos
