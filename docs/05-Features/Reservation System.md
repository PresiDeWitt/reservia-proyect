---
tags:
  - reservia
  - features
  - reservations
  - booking
---

# 🎫 Reservation System

[[Home|← Volver al Home]]

> [!abstract] Vista General
> El sistema de reservas permite a los usuarios registrados ==reservar mesas== en restaurantes, opcionalmente ==seleccionando asientos específicos== en el plano de piso.

---

## 🔄 Flujo Completo de Reserva

> [!note] Paso 1 — Autenticación
> 🔐 El usuario debe estar ==autenticado== para reservar.
> Si no lo está, se abre el ==AuthModal== para iniciar sesión o registrarse.

> [!note] Paso 2 — Formulario de Reserva
> 📋 El usuario completa el formulario en la página del restaurante:
>
> | Campo | Descripción |
> |-------|-------------|
> | 📅 **Fecha** | Debe ser una ==fecha futura== |
> | 🕐 **Hora** | Hora de la reserva |
> | 👥 **Comensales** | Entre ==1 y 20== personas |

> [!note] Paso 3 — Selección de Asientos (Opcional)
> 💺 Si el restaurante tiene un ==plano configurado==:
>
> - Se carga la disponibilidad para la fecha y hora elegidas
> - Se muestra el ==SeatPicker== con el plano visual
> - 🟢 Asientos disponibles → click para seleccionar
> - 🔴 Asientos ocupados → no clickeables
> - 🟠 Asientos seleccionados → click para deseleccionar
> - El usuario debe seleccionar ==exactamente== tantos asientos como comensales

> [!note] Paso 4 — Confirmación
> 📤 Se envía la reserva al backend:
> - ✅ **Éxito** → Reserva confirmada y visible en "Mis Reservas"
> - ❌ **Error** → Asientos ya ocupados u otro problema de validación

---

## ⚠️ Validaciones

> [!warning] Reglas de Validación — Frontend
> - 📅 Fecha y hora son ==obligatorias==
> - 👥 Comensales debe ser entre ==1 y 20==
> - 💺 Si hay plano: asientos seleccionados ==debe ser igual== al número de comensales

> [!warning] Reglas de Validación — Backend
> - 🔐 Se requiere ==autenticación JWT== válida
> - 👥 Comensales entre ==1 y 20== (validación duplicada por seguridad)
> - 💺 Si se envían asientos, se verifica que ==no estén ocupados== para esa fecha y hora
> - 🔒 Si algún asiento ya fue reservado por otro usuario, se rechaza la solicitud

---

## 📊 Estados de una Reserva

> [!example] Ciclo de Vida
> | Emoji | Estado | Descripción |
> |-------|--------|-------------|
> | ✅ | **Confirmed** | Reserva ==activa y vigente== |
> | ❌ | **Cancelled** | Reserva ==cancelada== por el usuario |
>
> Al cancelar, el registro ==no se borra==, solo cambia de estado.

---

## 📡 Operaciones de la API

> [!info] Crear Reserva
> Se envía al backend: restaurante, fecha, hora, comensales, y opcionalmente los IDs de asientos seleccionados.
>
> **Proceso interno:**
> 1. ✅ Valida autenticación (JWT)
> 2. ✅ Valida datos del formulario
> 3. 📝 Crea la reserva con estado ==confirmed==
> 4. 💺 Si hay asientos, crea registros de SeatReservation
> 5. 📤 Devuelve la reserva creada

> [!info] Ver Mis Reservas
> Devuelve todas las reservas del usuario, ordenadas por ==fecha descendente== (más recientes primero).

> [!info] Cancelar Reserva
> Cambia el estado a ==cancelled==. El registro se mantiene en la base de datos para historial.

---

## 🗄️ Modelos Involucrados

> [!abstract] Estructura de Datos
> | Modelo | Rol |
> |--------|-----|
> | 🎫 **Reservation** | Reserva principal (fecha, hora, comensales, estado) |
> | 💺 **SeatReservation** | Tabla intermedia que conecta asientos con reservas |
> | 🪑 **Seat** | Asiento individual dentro de una mesa |
>
> Ver [[Database Schema]] para el diagrama ER completo.

---

## 🔗 Links Relacionados

- [[Floor Plan System]] — Sistema de planos y asientos
- [[API Endpoints]] — Endpoints de reservas
- [[Authentication]] — Requiere JWT para crear reservas
- [[Database Schema]] — Modelos Reservation y SeatReservation
