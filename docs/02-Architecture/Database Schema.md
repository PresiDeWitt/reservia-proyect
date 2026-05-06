---
tags:
  - reservia
  - architecture
  - database
---

# 🗄️ Database Schema

[[Home|← Volver al Home]]

---

## 🔗 Diagrama de Relaciones

> [!tip] Relaciones entre modelos
>
> - [[#🍽️ Restaurant]] ==1 → N== [[#🍕 MenuItem]] — *"has many"*
> - [[#🍽️ Restaurant]] ==1 → 1== [[#🗺️ FloorPlan]] — *"has one"*
> - [[#🗺️ FloorPlan]] ==1 → N== [[#🪑 Table]] — *"contains"*
> - [[#🪑 Table]] ==1 → N== [[#💺 Seat]] — *"has"*
> - **User** ==1 → N== [[#📅 Reservation]] — *"makes"*
> - [[#🍽️ Restaurant]] ==1 → N== [[#📅 Reservation]] — *"receives"*
> - [[#📅 Reservation]] ==1 → N== [[#🔗 SeatReservation]] — *"includes"*
> - [[#💺 Seat]] ==1 → N== [[#🔗 SeatReservation]] — *"reserved in"*

---

## 📋 Modelos Detallados

### 🍽️ Restaurant

> [!abstract] Restaurant
> **Archivo:** `backend/api/models.py`
>
> > [!note] Campos
> > - **name** — *CharField* — Nombre del restaurante
> > - **cuisine** — *CharField* — Tipo de cocina
> > - **location** — *CharField* — Ciudad/zona
> > - **distance** — *FloatField* — Distancia en km
> > - **rating** — *FloatField* — Calificación (==0.0 - 5.0==)
> > - **price_range** — *CharField* — Ej: `$`, `$$`, `$$$`
> > - **address** — *CharField* — Dirección completa
> > - **description** — *TextField* — Descripción larga
> > - **lat** / **lng** — *FloatField* — Coordenadas GPS
> > - **image_url** — *URLField* — URL de imagen
> > - **reviews_count** — *IntegerField* — Número de reseñas
>
> > [!info] Ordenamiento
> > Los restaurantes se ordenan por ==rating descendente== (mayor rating primero).

---

### 🍕 MenuItem

> [!abstract] MenuItem
> **Relación:** pertenece a → [[#🍽️ Restaurant]]
>
> > [!note] Campos
> > - **restaurant** — *FK → Restaurant* — Restaurante al que pertenece
> > - **name** — *CharField* — Nombre del plato
> > - **description** — *TextField* — Descripción del plato
> > - **price** — *FloatField* — Precio

---

### 📅 Reservation

> [!abstract] Reservation
> **Relaciones:** pertenece a → **User** y → [[#🍽️ Restaurant]]
>
> > [!note] Campos
> > - **user** — *FK → User* — Usuario que reserva
> > - **restaurant** — *FK → Restaurant* — Restaurante reservado
> > - **date** — *DateField* — Fecha de la reserva
> > - **time** — *TimeField* — Hora de la reserva
> > - **guests** — *IntegerField* — Nº comensales (==1-20==)
> > - **status** — *CharField* — `confirmed` o `cancelled`
> > - **created_at** — *DateTimeField* — Timestamp de creación
>
> > [!warning] Validación
> > **guests** debe estar entre ==1 y 20==. Se valida en el serializer.
>
> > [!info] Ordenamiento
> > Ordenadas por ==fecha y hora descendente== (más recientes primero).

---

### 🗺️ FloorPlan

> [!abstract] FloorPlan
> **Relación:** uno a uno con → [[#🍽️ Restaurant]]
>
> > [!note] Campos
> > - **restaurant** — *OneToOneField → Restaurant* — Cada restaurante tiene un plano
> > - **width** — *IntegerField* — Ancho del canvas (default: ==1000==)
> > - **height** — *IntegerField* — Alto del canvas (default: ==700==)
> > - **background_color** — *CharField* — Color hex del fondo (default: ==#F8F9FA==)
> > - **updated_at** — *DateTimeField* — Última actualización

---

### 🪑 Table

> [!abstract] Table
> **Relación:** pertenece a → [[#🗺️ FloorPlan]]
>
> > [!note] Campos
> > - **floor_plan** — *FK → FloorPlan* — Plano al que pertenece
> > - **label** — *CharField* — Etiqueta (ej: "T1", "Mesa A")
> > - **shape** — *CharField* — `round`, `square` o `rectangular`
> > - **x** / **y** — *FloatField* — Posición en el canvas
> > - **width** / **height** — *FloatField* — Dimensiones
> > - **rotation** — *FloatField* — Rotación en grados
> > - **capacity** — *IntegerField* — Capacidad máxima
> > - **min_capacity** — *IntegerField* — Capacidad mínima

---

### 💺 Seat

> [!abstract] Seat
> **Relación:** pertenece a → [[#🪑 Table]]
>
> > [!note] Campos
> > - **table** — *FK → Table* — Mesa a la que pertenece
> > - **seat_index** — *IntegerField* — Índice del asiento (0, 1, 2...)
> > - **label** — *CharField* — Etiqueta (ej: "T1-A", "T1-B")
>
> > [!info] Unicidad
> > La combinación ==(table, seat_index)== debe ser única.
>
> > [!tip] Etiquetado automático
> > Los asientos se etiquetan con letras: **A**, **B**, **C**, **D**...
> > Ejemplo para mesa "T1" con 4 asientos: ==T1-A==, ==T1-B==, ==T1-C==, ==T1-D==

---

### 🔗 SeatReservation

> [!abstract] SeatReservation *(Junction Table)*
> **Relaciones:** conecta [[#📅 Reservation]] con [[#💺 Seat]]
>
> > [!note] Campos
> > - **reservation** — *FK → Reservation* — Reserva a la que pertenece
> > - **seat** — *FK → Seat* — Asiento reservado
>
> > [!warning] Unicidad
> > La combinación ==(reservation, seat)== debe ser única — no se puede reservar el mismo asiento dos veces en la misma reserva.

---

## 🗄️ Bases de Datos por Entorno

> [!example] 🛠️ Desarrollo
> **Motor:** SQLite3
> **Ubicación:** `backend/db.sqlite3`

> [!example] 🚀 Producción
> **Motor:** PostgreSQL
> **Configuración:** Variable `DATABASE_URL` de Railway

> [!tip] Cambio automático
> Django detecta si existe `DATABASE_URL` y usa ==PostgreSQL en producción==. De lo contrario, usa ==SQLite3==.

---

## 🔗 Links Relacionados

- [[Models]] — Código detallado de los modelos
- [[API Endpoints]] — Cómo se exponen estos datos
- [[Reservation System]] — Lógica de reservas
- [[Floor Plan System]] — Sistema de planos y asientos
- [[System Architecture]] — Arquitectura general
