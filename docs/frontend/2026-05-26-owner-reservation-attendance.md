# Owner Reservation Attendance

## Problema

El propietario necesitaba ver datos sensibles para sala, como alergias o notas del cliente, y marcar si una reserva terminó con llegada o no presentación.

## Solución

Se amplió el flujo propietario para exponer `note` y `occasion`, y se añadió control de asistencia con estados separados: `arrived`, `no_show` y retorno a `confirmed`.

## Qué Se Hizo

- Backend: nuevos estados de reserva `arrived` y `no_show`.
- Backend: `GET /api/owner/reservations/` devuelve `note` y `occasion`.
- Backend: `PATCH /api/owner/reservations/<id>/status/` actualiza asistencia de reservas del restaurante autenticado.
- Frontend: el dashboard de propietario muestra ocasión, nota y acciones de llegada/no-show.
- Frontend: i18n ES/EN y tipos de API actualizados.
- Tests: cobertura backend para datos visibles y permisos del endpoint de estado.

## Cómo

El endpoint propietario restringe la reserva por restaurante antes de actualizarla. Las métricas tratan `confirmed` y `arrived` como reservas activas, y excluyen `no_show` de los cálculos de comensales atendidos.

## Riesgos

- `arrived` y `no_show` son estados nuevos; cualquier reporte externo que filtre solo `confirmed` puede necesitar revisión.
- El panel muestra la nota completa del cliente al propietario, así que debe mantenerse dentro del acceso staff autorizado.

## Notas Adicionales

Verificación realizada:

- Backend tests: `python backend/manage.py test tests --verbosity 2`.
- Frontend build: `npm run build`.
- Frontend tests: `npm run test:run`.
- Migraciones: `python backend/manage.py makemigrations --check --dry-run`.
