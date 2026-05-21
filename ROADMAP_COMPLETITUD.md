# ROADMAP DE COMPLETITUD — ReserVia
## Del ~81% actual al 100% produccion

**Fecha objetivo sugerida:** 6-8 semanas
**Stack:** Django 4.2 + DRF 3.15 + SimpleJWT / React 19 + TypeScript + Tailwind v4 + Vite

---

# BLOQUE 0 — PRE-FLIGHT (1 dia, arreglar lo roto antes de anadir)

### T0.1 — Arreglar los 12 tests frontend rotos

Raiz del problema: El setup de vitest no mockea `IntersectionObserver`, y el mock de `react-i18next` retorna claves en lugar de traducciones reales.

**Tareas:**

1. Anadir mock de IntersectionObserver en tests/setup.ts:

```typescript
// tests/setup.ts - ANTES de los mocks existentes
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true, configurable: true, value: MockIntersectionObserver,
});
```

2. Crear helper de i18n real para tests (`tests/helpers/i18n.ts`):

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../src/i18n/en.json';
import es from '../../src/i18n/es.json';

const i18nInstance = i18n.createInstance();
i18nInstance.use(initReactI18next).init({
  lng: 'en', fallbackLng: 'en',
  resources: { en: { translation: en }, es: { translation: es } },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
export default i18nInstance;
```

Luego en cada test de UI: `render(<I18nextProvider i18n={i18nInstance}><Component /></I18nextProvider>)`

3. Test de Header: el test busca `header.searchPlaceholder` pero el Header NO tiene input inline (usa icono de lupa que abre SearchModal). Actualizar test para buscar el boton de busqueda en su lugar.

4. Tests de CategoryCard: actualizar selectores para que busquen por nombre de boton accesible correcto y clases CSS reales que renderiza el componente.

**Verificacion:** `npm run test:run` → 28/28 pasados.

**Tiempo estimado:** 4-6 horas

---

### T0.2 — Limpiar codigo muerto

1. Eliminar `frontend/src/pages/Search.tsx` (238 lineas, no routeada)
2. Eliminar `frontend/src/pages/Chat.tsx` (262 lineas, no routeada)
3. Eliminar `anthropic>=0.18,<0.19` de `backend/requirements.txt`
4. Unificar ANTHROPIC_API_KEY a OPENROUTER_API_KEY en TODOS los archivos:
   - backend/.env.example
   - SETUP.md, README.md, AGENTS.md
   - docs/06-Deployment/Environment Variables.md
   - docker-compose.yml
5. Corregir CLAUDE.md: "React native" → "React"
6. Limpiar imports huerfanos de Search/Chat/Favorites en otros archivos

**Verificacion:**
- `rg "anthropic" backend/requirements.txt` → sin resultados
- `rg "ANTHROPIC" docs/ README.md SETUP.md AGENTS.md docker-compose.yml` → sin resultados
- `npm run build` compila sin errores
- `python manage.py test tests --verbosity 0` → 40/40 pasados

**Tiempo estimado:** 2-3 horas

---

### T0.3 — Anadir healthcheck endpoint

Backend: `GET /api/health/` → `{"status": "ok", "database": "connected", "timestamp": "..."}`

docker-compose.yml - anadir healthcheck al servicio backend:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Test: anadir a `test_smoke_system.py` que verifique 200 OK.

**Tiempo estimado:** 30 minutos

---

### T0.4 — Error boundaries en React

Crear `frontend/src/components/ErrorBoundary.tsx` con clase que capture errores de renderizado y muestre fallback. Envolver cada `<Route>` en `App.tsx` con `<ErrorBoundary>`.

**Tiempo estimado:** 1 hora

---

# BLOQUE 1 — DISPONIBILIDAD Y RESERVAS REALES (CRITICO, 1-2 semanas)

### T1.1 — Modelo de disponibilidad

Anadir a `backend/api/models.py`:

```python
class RestaurantTable(models.Model):
    restaurant = models.ForeignKey(Restaurant, related_name='tables', on_delete=CASCADE)
    label = models.CharField(max_length=50)
    zone = models.CharField(max_length=50, default='main')   # main | terrace | private
    capacity = models.IntegerField(default=2)
    supplement = models.IntegerField(default=0)               # EUR
    pos_x = models.FloatField(default=0)
    pos_y = models.FloatField(default=0)
    rotation = models.FloatField(default=0)
    is_active = models.BooleanField(default=True)
    class Meta:
        ordering = ['zone', 'label']

class AvailabilitySlot(models.Model):
    table = models.ForeignKey(RestaurantTable, related_name='slots', on_delete=CASCADE)
    date = models.DateField()
    time = models.TimeField()
    is_available = models.BooleanField(default=True)
    class Meta:
        unique_together = ['table', 'date', 'time']
        ordering = ['date', 'time']
        indexes = [models.Index(fields=['table', 'date', 'is_available'])]
```

Anadir FK `Reservation.assigned_table` (nullable) y `Restaurant.owner` (nullable FK a User).

Migrar: `python manage.py makemigrations` → `python manage.py migrate`

---

### T1.2 — Endpoint: GET /api/restaurants/{id}/availability/

Query params: `?date=2026-05-20&guests=4`

Logica:
1. Buscar mesas activas del restaurante con `capacity >= guests`
2. Para cada hora de servicio (13:00-15:00 lunch, 20:00-22:30 dinner), verificar si al menos 1 mesa tiene `AvailabilitySlot.is_available=True`
3. Devolver `{"date": "...", "guests": N, "slots": [{"time": "13:00", "available": true, "service": "lunch"}, ...]}`

Validacion: rechazar fechas pasadas, requerir `date` como query param obligatorio.

---

### T1.3 — Endpoint: GET /api/restaurants/{id}/tables/

Query params: `?date=2026-05-20&time=20:00`

Devuelve todas las mesas del restaurante con posiciones 3D, zonas, capacidad, suplemento, y flag `available` (si se pasan date+time). Usado por FloorPlan3D.

Response:
```json
{
  "tables": [
    {"id": 1, "label": "Mesa 1", "zone": "main", "capacity": 4,
     "supplement": 0, "posX": -4, "posY": -2, "rotation": 0, "available": true},
    ...
  ]
}
```

---

### T1.4 — Generacion de slots (management command)

`python manage.py generate_slots --days=30`

Genera `AvailabilitySlot` para todas las mesas activas de todos los restaurantes, para los proximos N dias, en todos los horarios de servicio. Idempotente (usar `get_or_create`). Ejecutar en el seed y en cron diario.

---

### T1.5 — Modificar crear/cancelar reserva

**create:** En `ReservationCreateView.perform_create()`:
1. Buscar `AvailabilitySlot` disponible para fecha+hora+capacidad
2. Si no existe → 400 "No hay mesas disponibles"
3. Si existe → marcarlo `is_available=False`, asignar `reservation.assigned_table`

**cancel:** En `cancel_reservation`:
1. Liberar el slot: `AvailabilitySlot.objects.filter(table__restaurant=..., date=..., time=...).update(is_available=True)`

---

### T1.6 — Frontend: ReservationWidget con slots reales

Anadir metodo `restaurantsApi.availability(id, date, guests)` en `frontend/src/api/restaurants.ts`.

Modificar `ReservationWidget.tsx`:
- Eliminar arrays hardcodeados `lunchSlots`/`dinnerSlots`
- En el paso de fecha+hora, llamar a `restaurantsApi.availability()` con `date` y `guests` seleccionados
- Mostrar slots disponibles con estilo normal, no disponibles tachados con tooltip "No disponible"
- Mostrar skeleton/loader mientras carga

---

### T1.7 — Frontend: FloorPlan3D con mesas reales

Modificar `FloorPlan3D.tsx`:
1. Cargar mesas desde `GET /api/restaurants/{id}/tables/`
2. Usar `posX`, `posY`, `rotation` del backend para posicionar en Three.js
3. Marcar mesas no disponibles en rojo oscuro/opacidad reducida
4. Al seleccionar mesa disponible → pre-llenar ReservationWidget con zona y suplemento

---

### T1.8 — Tests de disponibilidad

Crear `backend/tests/test_availability_api.py` con 5-6 tests:
- `test_availability_returns_slots` → 200 con array de slots
- `test_availability_rejects_past_date` → 400
- `test_reservation_consumes_slot` → crear reserva → slot marcado `is_available=False`
- `test_reservation_rejected_when_full` → todas las mesas ocupadas → 400
- `test_cancel_reservation_releases_slot` → cancelar → slot vuelve a `is_available=True`
- `test_tables_endpoint_returns_positions_and_availability` → 200 con array de mesas

---

# BLOQUE 2 — DASHBOARDS CON DATOS REALES (CRITICO, 1 semana)

### T2.1 — Permission classes para staff

Crear `backend/api/permissions.py` con:
- `IsStaffOwner`: verifica que el claim `staff_role` del token JWT == 'owner'
- `IsStaffAdmin`: verifica que `staff_role` == 'admin'

Estas clases se usaran en los endpoints del dashboard.

---

### T2.2 — Endpoints del Owner Dashboard

`GET /api/owner/stats/` (requiere `IsStaffOwner`):
Busca el restaurante cuyo owner coincide con el email del token staff. Devuelve:
- totalReservations, confirmedReservations, totalGuests, cancelledReservations, cancellationRate, avgGuests
- hourDistribution: array de `{hour, count}` para el heatmap de ocupacion

`GET /api/owner/reservations/` (requiere `IsStaffOwner`):
Query params: `?status=confirmed&date_from=2026-05-01&date_to=2026-05-31&page=1&search=juan`
Devuelve lista paginada de reservas del restaurante con datos del cliente.

---

### T2.3 — Endpoints del Admin Dashboard

`GET /api/admin/stats/` (requiere `IsStaffAdmin`):
- totalRestaurants, totalUsers, totalReservations, confirmedReservations, cancelledReservations
- cancellationRate, totalGuests, estimatedRevenue (guests * 35 EUR avg ticket)

`GET /api/admin/top-restaurants/`:
- Ranking top 20 restaurantes por numero de reservas, con rating y confirmadas

`GET /api/admin/city-distribution/`:
- Agrupacion por `location` con conteo y rating promedio

---

### T2.4 — Modificar staff_login_view

Para que el token incluya el `email` del owner ademas de `staff_role`:

```python
refresh = RefreshToken()
refresh['staff_role'] = role
refresh['email'] = owner_email   # asociado al codigo STAFF_OWNER_CODE
```

A largo plazo, crear modelo `StaffCode(code, role, email)` para mapear codigos a restaurantes reales.

---

### T2.5 — Frontend: conectar dashboards a API

Crear `frontend/src/api/owner.ts` y `frontend/src/api/admin.ts` con metodos correspondientes.

Modificar `OwnerDashboard.tsx`:
- KPI cards → cargar desde `ownerApi.stats()`
- Tabla de reservas → cargar desde `ownerApi.reservations()` con filtros y paginacion
- Heatmap → usar `hourDistribution` real
- Floor plan → mantener SVG estatico (MVP aceptable)

Modificar `AdminDashboard.tsx`:
- KPIs → `adminApi.stats()`
- Top restaurants → `adminApi.topRestaurants()`
- City distribution → `adminApi.cityDistribution()`
- Revenue chart → datos sinteticos basados en estimatedRevenue
- Eliminar "Pending approvals" (no hay modelo aun)

---

# BLOQUE 3 — FEATURES SOCIALES (ALTA, 1 semana)

### T3.1 — Favoritos en backend

Modelo `Favorite(user FK, restaurant FK, created_at)` con `unique_together=['user', 'restaurant']`.

Endpoints (todos requieren `IsAuthenticated`):
- `POST /api/favorites/` — body: `{restaurantId}` → 201 | 400 si ya existe
- `DELETE /api/favorites/{restaurantId}/` → 200
- `GET /api/favorites/` → lista de favoritos con datos del restaurante anidados

Frontend: modificar `RestaurantCard.tsx` y `FavoritesPage.tsx` para usar estos endpoints. Mantener localStorage como cache optimista con reconciliacion al hacer login.

---

### T3.2 — Resenas (Reviews)

Modelo `Review`:
- `user FK, restaurant FK, rating (1-5), food_rating, service_rating, ambiance_rating, comment, created_at`
- `unique_together=['user', 'restaurant']` (una resena por usuario por restaurante)
- Signal `post_save`/`post_delete` que recalcula `restaurant.rating` y `restaurant.reviews_count`

Endpoints:
- `POST /api/reviews/` — crear resena (requiere auth + haber tenido reserva completada)
- `GET /api/restaurants/{id}/reviews/` — listado paginado publico
- `PATCH /api/reviews/{id}/` — editar (solo autor)
- `DELETE /api/reviews/{id}/` — eliminar (autor o admin)

Frontend: pestaña "Reviews" en `RestaurantDetails.tsx` usa datos reales + formulario de nueva resena.

---

### T3.3 — Notificaciones

Modelo `Notification`:
- `user FK, type (booking_confirmed|booking_reminder|booking_cancelled|review_request|system)`
- `title, message, reservation FK (nullable), is_read, created_at`

Endpoints:
- `GET /api/notifications/` — lista de notificaciones del usuario
- `POST /api/notifications/{id}/read/` — marcar leida
- `POST /api/notifications/read-all/`
- `GET /api/notifications/unread-count/`

Crear notificaciones automaticamente al crear/cancelar reservas (en `perform_create` y `cancel_reservation`).

Frontend: `NotificationsMenu.tsx` consume endpoints reales en lugar de datos mock.

---

# BLOQUE 4 — MEJORAS DE UX Y PLATAFORMA (MEDIA, 1-2 semanas)

### T4.1 — Busqueda geoespacial

Endpoint `GET /api/restaurants/nearby/?lat=37.1773&lng=-3.5986&radius=5`:
- Calcula distancia con formula Haversine en SQL (funciona en SQLite y PostgreSQL)
- Filtra restaurantes dentro del radio
- Devuelve lista ordenada por distancia con `distanceKm` en cada item

Frontend: boton "Cerca de mi" en SearchModal y Home que usa `navigator.geolocation`.

---

### T4.2 — Password reset

Endpoints:
- `POST /api/auth/password-reset/` — envia email con link/token
- `POST /api/auth/password-reset/confirm/` — cambia contrasena con token

Configurar `EMAIL_BACKEND` en settings (console en dev, SMTP en prod con SendGrid/Mailgun).

---

### T4.3 — Lazy loading de rutas

Usar `React.lazy()` + `Suspense` en `App.tsx` para TODAS las paginas.
Candidatos de mayor impacto: `MapExplorer` (MapLibre), `FloorPlan3D` (Three.js), `OwnerDashboard`, `AdminDashboard`.

Crear componente `PageLoader` con spinner animado como fallback de Suspense.

Verificar con `npm run build` que se generan chunks separados y el bundle inicial baja significativamente.

---

### T4.4 — Unificar paginacion en backend

Crear `CustomPagination(PageNumberPagination)` que devuelva:
```json
{"items": [...], "total": N, "page": N, "page_size": N, "total_pages": N}
```

Aplicar a todos los endpoints que devuelven listas (owner reservations, admin restaurants, reviews, etc).

---

### T4.5 — Refactorizar codigo duplicado

- Extraer `useRestaurantSearch` hook de `Search.tsx` y `SearchModal.tsx`
- Extraer `KPICard`, `DashboardTabs`, `DashboardLayout` de los dashboards
- Migrar paginacion manual de `RestaurantListView` a `CustomPagination`

---

# BLOQUE 5 — WEB EN TIEMPO REAL Y PWA (BAJA, 1-2 semanas)

### T5.1 — WebSockets para disponibilidad

Usar Django Channels + Daphne + Redis:
- `AvailabilityConsumer`: cuando un slot cambia (reserva/cancelacion), envia actualizacion a clientes suscritos
- `ws://host/ws/restaurant/{id}/availability/` → recibe `{"time": "20:00", "available": false}`
- Frontend: hook `useWebSocket` reemplaza polling en ReservationWidget

---

### T5.2 — PWA

Instalar `vite-plugin-pwa`, configurar manifest, service worker con Workbox:
- Cache de API de restaurantes (NetworkFirst, 5 min)
- Cache de assets estaticos (CacheFirst, 1 dia)
- Icono, theme_color (#f97415), background_color (#f8f7f5)
- Instalable como app en movil/desktop

---

# BLOQUE 6 — DOCUMENTACION FINAL (BAJA, 3-4 dias)

### T6.1 — Sincronizar documentacion con la realidad

- Actualizar todas las referencias ANTHROPIC → OPENROUTER (busqueda masiva)
- Crear `tasks/todo.md` y `tasks/lessons.md`
- Documentar `STAFF_OWNER_CODE` y `STAFF_ADMIN_CODE`
- Anadir todas las entradas faltantes al `docs/Home.md`
- Consolidar documentos de pruebas redundantes (4.2 Registro y sus 5 sub-docs)
- Corregir `distance` field type inconsistency en Database Schema.md
- Anadir CONTRIBUTING.md

---

# RESUMEN DE ESFUERZO POR BLOQUE

| Bloque | Prioridad | Esfuerzo | Features | Tests |
|--------|-----------|----------|----------|-------|
| B0 - Pre-flight | CRITICO | 1 dia | Healthcheck, ErrorBoundary, limpieza | Arreglar 12 tests |
| B1 - Disponibilidad | CRITICO | 1-2 sem | 2 modelos, 3 endpoints, ReservationWidget real, FloorPlan3D real | 6 tests |
| B2 - Dashboards | CRITICO | 1 sem | 5 endpoints, 3 permission classes, conectar dashboards a API | 8 tests |
| B3 - Features sociales | ALTA | 1 sem | Favoritos, Reviews, Notificaciones (~6 endpoints) | 10 tests |
| B4 - Mejoras UX | MEDIA | 1-2 sem | Geo-busqueda, password reset, lazy loading, paginacion | 5 tests |
| B5 - Tiempo real | BAJA | 1-2 sem | WebSockets, PWA, Channels | 4 tests |
| B6 - Docs | BAJA | 3-4 dias | Sincronizar documentacion | N/A |
| **TOTAL** | — | **6-8 sem** | **~20 endpoints, ~6 modelos, 10+ componentes** | **~33 tests** |

---

# ORDEN DE EJECUCION RECOMENDADO

1. T0.1 → T0.2 → T0.3 → T0.4 (Pre-flight, 1 dia)
2. T1.1 → T1.2 → T1.3 → T1.4 → T1.5 → T1.8 (Backend disponibilidad, 4-5 dias)
3. T1.6 → T1.7 (Frontend disponibilidad, 3-4 dias)
4. T2.1 → T2.2 → T2.3 → T2.4 (Backend dashboards, 3 dias)
5. T2.5 (Frontend dashboards, 2-3 dias)
6. T3.1 → T3.2 → T3.3 (Features sociales, 5-6 dias)
7. T4.1 → T4.2 → T4.3 → T4.4 → T4.5 (Mejoras UX, 7-10 dias)
8. T5.1 → T5.2 (Tiempo real/PWA, 7-10 dias)
9. T6.1 → T6.2 (Docs finales, 3-4 dias)
