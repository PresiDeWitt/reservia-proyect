# Spec: Completar ReserVia — Panel Admin, Owner UI y Robustez

**Fecha:** 2026-06-09
**Rama:** `fix/critical-gaps`
**Estado actual:** ~70% funcional. Flujo customer sólido. Owner dashboard funcional pero sin UI de menú/mesas. Admin esquelético (solo overview + top restaurantes + impersonación).

## Objetivo

Llevar el proyecto a estado "terminado": panel admin completo con auditoría, owner dashboard con gestión de menú y mesas, validaciones backend, manejo de errores visible y tests de los paneles.

## Fase 0 — Cerrar trabajo pendiente

Commitear los 21 archivos modificados en `fix/critical-gaps`:
- CRUD owner API (`views_owner.py`, `urls.py`, `frontend/src/api/owner.ts`)
- Migración de perfiles owner de localStorage a backend (`ownerProfile.ts`, `OwnerDashboard.tsx`, `OwnerOnboarding.tsx`)
- Rol obligatorio desde backend (`serializers.py`, `auth.ts`, `roles.ts`, `AuthModal.tsx`)
- Mejoras i18n (`ChatBot`, `NotificationsMenu`, `ProfileMenu`, `MyBookings`, `en.json`, `es.json`)

Verificar suite de tests backend y frontend antes de commitear.

## Fase 1 — Owner UI

- **Tab Menú** en `OwnerDashboard.tsx`: listar, crear, editar y borrar platos. Usa API existente (`getMenuItems`, `createMenuItem`, `updateMenuItem`, `deleteMenuItem`).
- **Tab Mesas**: CRUD con formulario (label, zona, capacidad, suplemento, activa). Sin drag-drop; el floor plan sigue siendo solo visualización.
- **Campo `capacity`** en modelo `Restaurant` (migración), serializer, endpoint `PATCH /owner/profile/` y formulario de onboarding.

## Fase 2 — Admin completo

### Backend (`views_admin.py`, permiso `IsStaffAdmin`)

| Endpoint | Método | Función |
|---|---|---|
| `/admin/users/` | GET | Lista paginada con búsqueda (email/nombre) |
| `/admin/users/<id>/` | PATCH | Activar/desactivar (`is_active`) |
| `/admin/restaurants/` | GET, POST | Lista paginada + crear |
| `/admin/restaurants/<id>/` | PATCH, DELETE | Editar (incl. asignar owner) y borrar |
| `/admin/reviews/` | GET | Lista paginada con búsqueda |
| `/admin/reviews/<id>/` | DELETE | Borrar reseña (recalcula rating vía signal) |
| `/admin/staff-codes/` | GET, POST | Listar y crear códigos |
| `/admin/staff-codes/<id>/` | PATCH | Revocar (`is_active=false`) |
| `/admin/audit-log/` | GET | Lista paginada del log |

### Auditoría

- Modelo `AdminAuditLog`: `admin_email`, `action`, `target_type`, `target_id`, `detail`, `created_at`.
- Helper `log_admin_action(request, action, target, detail)` llamado en todas las acciones de escritura admin, incluida la impersonación existente (`/admin/impersonate/`).

### Frontend (`AdminDashboard.tsx`)

Pasa de 2 tabs a 7: Overview, Top restaurantes, **Usuarios, Restaurantes, Reseñas, Staff, Auditoría**. Cada tab nuevo: tabla paginada con búsqueda, acciones según endpoint, estados de carga y error visibles, i18n ES/EN.

## Fase 3 — Robustez

- **Validaciones backend:** `price > 0` (MenuItem), `capacity > 0` y `supplement >= 0` (RestaurantTable), nombres no vacíos en updates de owner/admin, `guests > 0`.
- **Error handling frontend:** eliminar `.catch(() => {})` en AdminDashboard/OwnerDashboard; estado de error con mensaje i18n y opción de reintentar.
- **Notificaciones:** refetch al recuperar foco de ventana + intervalo de polling corto. Sin WebSocket.

## Fase 4 — Tests

- **Backend:** tests para todos los endpoints admin nuevos (permisos incluidos), validaciones de Fase 3, CRUD owner de menú/mesas.
- **Frontend:** tests de AdminDashboard (tabs, acciones, errores), OwnerDashboard (tabs menú/mesas) y componentes nuevos. Vitest + mocks existentes.

## Fuera de alcance

Horarios de disponibilidad configurables, promociones/descuentos, drag-drop del floor plan, WebSocket/Channels, reportes avanzados con export CSV, E2E con Playwright.

## Riesgos

- `DELETE /admin/restaurants/<id>/` borra en cascada reservas/reseñas/mesas — confirmación explícita en UI.
- Migración de `capacity` con default para restaurantes existentes.
- Impersonación crea owners dinámicos `owner_{id}@reservia.demo`; ahora quedará auditada pero el mecanismo no cambia.

## Criterio de éxito

Admin gestiona usuarios, restaurantes, reseñas y códigos staff con todo auditado; owner gestiona menú y mesas desde su panel; sin catches silenciosos; suites backend y frontend en verde.
