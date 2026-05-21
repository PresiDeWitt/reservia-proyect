# T1 — Disponibilidad y Reservas Reales

**Fecha:** 2026-05-21

## Problema

El sistema de reservas usaba slots de tiempo hardcodeados en el frontend y no validaba disponibilidad real en el backend. Cualquier hora era reservable sin comprobar si había mesas libres.

## Solución

Modelo de mesas (`RestaurantTable`) + slots de disponibilidad (`AvailabilitySlot`) en backend, con endpoints de consulta y lógica que consume/libera slots al crear/cancelar reservas. Frontend actualizado para mostrar disponibilidad real.

## Qué se hizo

### Backend

- `api/models.py`: Nuevos modelos `RestaurantTable` (mesa con posición 3D, zona, capacidad, suplemento) y `AvailabilitySlot` (mesa × fecha × hora, flag `is_available`). FK nullable `Restaurant.owner` y `Reservation.assigned_table`.
- Migración `0003_restaurant_owner_restauranttable_and_more.py`.
- `api/views.py`: 
  - `restaurant_availability` (`GET /api/restaurants/{id}/availability/?date&guests`) — devuelve 11 slots de almuerzo/cena con flag `available`.
  - `restaurant_tables` (`GET /api/restaurants/{id}/tables/?date&time`) — devuelve mesas con posiciones y disponibilidad.
  - `ReservationCreateView.perform_create` — busca y consume un slot con `select_for_update`, lanza 400 si no hay disponibilidad.
  - `cancel_reservation` — libera el slot al cancelar.
- `api/management/commands/generate_slots.py` — `python manage.py generate_slots --days=N`, idempotente.
- `api/management/commands/seed.py` — crea 10 mesas por restaurante y llama a `generate_slots` tras el seed.
- `api/urls.py` — registradas las dos rutas nuevas.

### Frontend

- `api/restaurants.ts` — tipos `AvailabilitySlot`, `AvailabilityResponse`, `TableData`, `TablesResponse`; métodos `restaurantsApi.availability()` y `restaurantsApi.tables()`.
- `components/ReservationWidget.tsx` — elimina arrays hardcodeados, llama a `/availability/` al cambiar fecha/comensales, muestra skeleton mientras carga, marca slots no disponibles tachados con tooltip.
- `pages/FloorPlan3D.tsx` — carga mesas desde `/tables/`, usa `posX`/`posY`/`rotation` del backend para posicionarlas en Three.js, muestra spinner mientras carga, selección por ID numérico.

### Tests

- `tests/factories.py` — `create_table()` y `create_slot()`.
- `tests/test_availability_api.py` — 8 tests: disponibilidad, fechas pasadas, consumo de slot, rechazo sin slot, liberación al cancelar, capacidad insuficiente, endpoint de mesas.
- `tests/test_reservations_api.py` y `test_smoke_system.py` — actualizados para crear slots antes de llamar a la API.

**Resultado:** 51/51 tests OK, `npm run build` sin errores de TS.

## Riesgos

- `select_for_update` no es atómico en SQLite con múltiples workers concurrentes (SQLite no soporta row-level locking real). En producción con PostgreSQL funciona correctamente.
- Si se crea una reserva sin slots generados para esa fecha/hora, devuelve 400. Requiere ejecutar `generate_slots` periódicamente (cron diario recomendado).
- FloorPlan3D ahora depende de que existan tablas en BD. Sin seed, el plano queda vacío pero sin errores.
