# T2 — Dashboards con Datos Reales

**Fecha:** 2026-05-21

## Problema

Ambos dashboards (owner y admin) mostraban KPIs, tablas y gráficos completamente hardcodeados. Ningún número venía de la base de datos.

## Solución

5 endpoints nuevos protegidos por permission classes que leen el token staff JWT, más conexión de los dashboards frontend a esos endpoints.

## Qué se hizo

### Backend

- `api/permissions.py` — nuevo archivo con `IsStaffOwner`, `IsStaffAdmin` y helpers `get_staff_role`/`get_staff_email` que decodifican el claim del token JWT sin requerir un usuario asociado.
- `api/views.py`:
  - `owner_stats` — KPIs del restaurante (total reservas, confirmadas, canceladas, comensales, media, tasa cancelación, distribución horaria).
  - `owner_reservations` — lista paginada con filtros por estado, fecha y búsqueda de cliente.
  - `admin_stats` — KPIs globales de plataforma (restaurantes, usuarios, reservas, revenue estimado).
  - `admin_top_restaurants` — top 20 por número de reservas.
  - `admin_city_distribution` — agrupación por localización con conteos y rating medio.
  - `staff_login_view` — añade claim `email` al token cuando el rol es owner, leyendo `STAFF_OWNER_EMAIL` env var.
- `api/urls.py` — 5 rutas nuevas bajo `/api/owner/` y `/api/admin/`.
- `seed.py` — crea usuario demo `owner@reservia.demo` y lo asigna al primer restaurante.

### Frontend

- `api/owner.ts` — `ownerApi.stats()` y `ownerApi.reservations()` con tipos TypeScript.
- `api/admin.ts` — `adminApi.stats()`, `adminApi.topRestaurants()`, `adminApi.cityDistribution()` con tipos.
- `OwnerDashboard.tsx` — elimina constantes hardcodeadas, carga stats y reservas reales, skeletons de carga, heatmap con `hourDistribution` real.
- `AdminDashboard.tsx` — elimina constantes hardcodeadas y el tab "Pending approvals" (sin modelo), carga KPIs + top restaurants + city distribution reales.

## Riesgos

- Los staff tokens no tienen `user_id`, por lo que no son compatibles con el `JWTAuthentication` estándar de DRF. Los endpoints staff usan `AllowAny` + permission class custom que decodifica el token manualmente. Si alguien configura `DEFAULT_AUTHENTICATION_CLASSES` que rechace tokens sin user, los endpoints seguirán funcionando.
- El owner fallback (primer restaurante si no hay match por email) es conveniente para el demo pero no es correcto en un sistema multi-tenant real.
- `estimatedRevenue = guests * 35€` es una estimación fija. No hay modelo de precio real.
