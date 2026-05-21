# ESTADO ACTUAL DEL PROYECTO — ReserVia

> Auditoria de completitud — 21 de mayo de 2026
>
> **Completitud estimada: ~90%**
> Esfuerzo restante: ~25 horas (P0-P2) + ~3-4 semanas (P3 nice-to-have)

---

# 1. LO QUE YA ESTA COMPLETO (~90%)

## 1.1 — Backend: modelos, endpoints, infraestructura

### Modelos (10 en `api/models.py`)
`Restaurant`, `MenuItem`, `RestaurantTable`, `AvailabilitySlot`, `Reservation`,
`Review`, `Notification`, `UserProfile`, `StaffCode`, `Favorite` — todos creados,
migrados, con signals, validators, indices, y `unique_together` donde aplica.

### API Endpoints (~30 en `api/urls.py`)

| Categoria | Endpoints | Estado |
|---|---|---|
| Auth | register, login, google, staff login, password reset/confirm/change, token refresh | HECHO |
| Restaurantes | list (pag + search + cuisine filter), detail (con menuItems), cuisines, nearby (Haversine), availability (date+guests slots), tables (posiciones) | HECHO |
| Reservas | create (slot-based, best-fit table), my reservations, cancel (libera slot) | HECHO |
| AI Chat | OpenRouter/Gemma 3, prompt con restaurantes, rate throttling | HECHO |
| Favoritos | list, add, remove (DB, no localStorage) | HECHO |
| Notificaciones | list, mark read, mark all read, unread count | HECHO |
| Reviews | GET (con metadatos can_review/has_reviewed), POST (requiere reserva completada) | HECHO |
| Owner Dashboard | stats (KPIs, hour distribution), reservations (pag + filtros) | HECHO |
| Admin Dashboard | stats (con estimatedRevenue), top restaurants, city distribution | HECHO |
| Health | `GET /api/health/` con DB check | HECHO |

### Infraestructura backend
- JWT SimpleJWT con refresh flow y blacklist
- Rate throttling por IP (register, login, chat, password reset)
- `StandardPagination` unificada con respuestas `{items, total, page, page_size, total_pages}`
- Permission classes `IsStaffOwner`, `IsStaffAdmin`
- `StaffCode` vinculado a usuario real via `get_or_create`
- Signal `post_save`/`post_delete` en Review que recalcula `restaurant.rating` y `reviews_count`
- Signal que crea `Notification` automaticamente al crear/cancelar reserva
- Management command `generate_slots` idempotente
- Docker con Redis, healthcheck
- `SECRET_KEY` sin default en produccion (lanza error si falta)
- `GOOGLE_CLIENT_ID` sin fallback hardcodeado

### Tests backend (11 archivos)
`test_models_unit.py`, `test_serializers_unit.py`, `test_auth_api.py`,
`test_restaurants_api.py`, `test_reservations_api.py`, `test_availability_api.py`,
`test_reviews_api.py`, `test_chat_api.py`, `test_smoke_system.py`,
`test_security_throttling.py`, `factories.py`

---

## 1.2 — Frontend: paginas, componentes, infraestructura

### Paginas (15 rutas en `App.tsx`) — todas con lazy loading
`Home`, `RestaurantDetails`, `FloorPlan3D`, `MapExplorer`, `MyBookings`,
`AccountPage`, `FavoritesPage`, `Confirmation`, `BookingError`, `StaffAccess`,
`OwnerDashboard`, `AdminDashboard`, `ResetPassword`, `HelpPage`, `NotFound`

### Componentes principales
`AuthModal` (editorial split login/register), `ChatBot` (flotante, OpenRouter API),
`ReservationWidget` (3-step stepper con slots reales de API),
`Header`, `Footer`, `Hero`, `SearchModal`, `RestaurantCard`, `CategoryCard`,
`ProfileMenu`, `NotificationsMenu`, `MobileDrawer`, `LanguageMenu`, `Logo`,
`OwnerOnboarding`, `RequireRole`, `ErrorBoundary`

### Infraestructura frontend
- Lazy loading via `React.lazy` + `Suspense` para todas las paginas
- `AuthContext` con persistencia en localStorage + refresh de token automatico
- `ThemeContext` (dark/light mode)
- i18n EN/ES con i18next (~453 claves por idioma)
- `fetchWithRetry` (2 retries, exponential backoff, token refresh en 401, AbortController timeout)
- `staffApi` en `client.ts` con soporte para token de staff
- `storage.ts` con `STORAGE_KEYS` centralizado
- `ErrorBoundary` envolviendo cada ruta
- Vite proxy `/api` -> `127.0.0.1:8000`

### API clients frontend
`client.ts` (fetch wrapper + staffApi), `restaurants.ts`, `auth.ts`, `favorites.ts`,
`notifications.ts`, `reviews.ts`, `admin.ts`, `owner.ts` — todos refactorizados
usando `staffApi` o `apiRequest` segun corresponda.

### Tests frontend (8 archivos, ~18 tests)
`CategoryCard.test.tsx`, `RestaurantCard.test.tsx`, `AuthContext.test.tsx`,
`Header.flow.test.tsx`, `Home.flow.test.tsx`, `MyBookings.flow.test.tsx`,
`restaurants.api.test.ts`, `services.api.test.ts`

---

# 2. LO QUE FALTA — Inventario completo de gaps

---

## 2.1 — P0: CRITICO (bloquea funcionalidad o causa bugs reales)

### GAP-01: views.py duplicado — urls.py usa la version sin optimizar

**Archivos:**
- `backend/api/views.py` (850 lineas) — version ACTIVA usada por `urls.py`
- `backend/api/views_chat.py` (118 lineas) — CODIGO MUERTO
- `backend/api/views_auth.py` (234 lineas) — CODIGO MUERTO
- `backend/api/views_restaurants.py` (187 lineas) — CODIGO MUERTO (salvo `nearby_restaurants`)
- `backend/api/views_reservations.py` (70 lineas) — CODIGO MUERTO

**`urls.py` importa desde los modulos separados SOLO para:**
- `views_favorites` (usado)
- `views_notifications` (usado)
- `views_restaurants.nearby_restaurants` (usado)

**TODO LO DEMAS se importa de `views.py`**, dejando como codigo muerto las
versiones separadas. Esto causa bugs reales:

| Endpoint | views.py (activo) | modulo separado (muerto) | Diferencia |
|---|---|---|---|
| `chat_view` | `restaurants[:30]` sin filtro GPS | Filtra por bounding box GPS (`lat +/- 0.05`) y limita a 20 | El activo NO filtra por ubicacion |
| `staff_login_view` | Usa solo env vars | Usa modelo `StaffCode` (DB) | El activo no escala |
| `ReservationCreateView` | Tiene validacion `reservation_dt <= datetime.now()` | NO tiene esa validacion | Inconsistencia si se activara |
| `SERVICE_HOURS` | Definido inline en `views.py:22-25` | Importado de `constants.py` | Duplicacion |

**Impacto real:** Cada llamada al chat carga TODOS los restaurantes de la DB en el
prompt, ignorando la ubicacion GPS del usuario. El endpoint activo envia mas tokens
y da respuestas menos relevantes.

**Esfuerzo:** 3-4 horas

---

### GAP-02: NotificationsMenu usa datos hardcodeados, no consume la API

**Archivo:** `frontend/src/components/NotificationsMenu.tsx:13-19`

```typescript
const INITIAL: Notification[] = [
  { id: 1, icon: 'check_circle', title: 'Reserva confirmada', description: 'Kinoko Izakaya...', time: 'HACE 2H', unread: true },
  { id: 2, icon: 'schedule', title: 'Mañana tienes mesa', description: 'Panadería Miga...', time: 'HACE 6H', unread: true },
  { id: 3, icon: 'local_fire_department', title: 'Tu restaurante favorito tiene hueco', ...},
  { id: 4, icon: 'chat_bubble', title: '¿Qué tal Le Petit Atelier?', ...},
  { id: 5, icon: 'star', title: 'Has subido a Habitué', ...},
];
```

El componente nunca llama a `notificationsApi`. `markAllRead` (linea 42) solo
actualiza estado local, no hace `POST /api/notifications/read-all/`.

El backend tiene 4 endpoints 100% funcionales listos para consumir.

**Esfuerzo:** 2 horas

---

## 2.2 — P1: ALTO (features incompletas o bugs de datos)

### GAP-03: OwnerDashboard — plano de mesas hardcodeado

**Archivo:** `frontend/src/pages/OwnerDashboard.tsx:11-23`

```typescript
const FLOOR = [
  { id: 'A1', x: 8, y: 10, w: 14, h: 14, status: 'free', cap: 2 },
  { id: 'A2', x: 8, y: 30, w: 14, h: 14, status: 'taken', cap: 4, who: 'Elena M.' },
  // ... 11 entradas hardcodeadas con estados y nombres inventados
];
```

`GET /api/restaurants/{id}/tables/` devuelve `posX`, `posY`, `rotation`, `capacity`,
`zone`, `available` reales. El dashboard nunca lo consume.

**Esfuerzo:** 2 horas

---

### GAP-04: Rating recalculo redundante en views.py

**Archivo:** `backend/api/views.py:826-829`

```python
agg = Review.objects.filter(restaurant=restaurant).aggregate(avg=Avg('rating'), cnt=Count('id'))
restaurant.rating = round(agg['avg'], 1)
restaurant.reviews_count = agg['cnt']
restaurant.save(update_fields=['rating', 'reviews_count'])
```

`models.py:200-208` ya tiene un signal `@receiver([post_save, post_delete], sender=Review)`
que hace EXACTAMENTE esto. El codigo en la view es redundante y puede causar
doble escritura.

**Esfuerzo:** 10 minutos

---

### GAP-05: 19 referencias a ANTHROPIC/Claude/Leaflet en documentacion

Archivos afectados: `docs/Home.md`, `docs/03-Backend/AI Chat Integration.md`,
`docs/07-Development/Local Setup.md`, `docs/06-Deployment/Railway Deployment.md`,
`docs/06-Deployment/Docker Setup.md`, `docs/08-Security/Security Incidents.md`,
`docs/07-Development/4.2 Registro de Pruebas.md`,
`docs/07-Development/4.2.3 Pruebas de Seguridad.md`,
`docs/07-Development/4.2.5 Copias de Seguridad.md`,
`docs/09-Notify/Telegram Notifications.md`

Todavia mencionan `ANTHROPIC_API_KEY`, "Claude", "Anthropic" en lugar de
`OPENROUTER_API_KEY`, "Gemma 3", "OpenRouter". Algunos tambien dicen "Leaflet.js"
cuando ya se usa MapLibre GL JS. `docker-compose.yml:20` tambien pasa
`ANTHROPIC_API_KEY` como env var innecesaria.

**Esfuerzo:** 1 hora

---

### GAP-06: CLAUDE.md desactualizado

**Archivo:** `CLAUDE.md`

| Linea | Dice | Deberia decir |
|---|---|---|
| 67 | "Axios base client" | "fetch-based API client" |
| 48 | "Three models: Restaurant, MenuItem, Reservation" | 10+ modelos |
| 53 | `DB_PATH` | `DATABASE_URL` para prod |
| 56-63 | ~10 endpoints listados | Faltan ~20 endpoints |
| 69 | 5 paginas listadas | 15 paginas |
| — | Sin mencion de Redis, MapLibre, ErrorBoundary, Docker healthcheck | Agregar |

**Esfuerzo:** 30 minutos

---

## 2.3 — P2: MEDIO (datos mock, tests faltantes, deuda tecnica)

### GAP-07: RestaurantDetails — datos hardcodeados en pestaña Info

**Archivo:** `frontend/src/pages/RestaurantDetails.tsx:532-538`

```typescript
{ k: 'phone', v: '+34 912 345 678', i: 'call' },
{ k: 'hours', v: 'Mar a Dom · 13:00 a 16:00 · 20:00 a 23:30', i: 'schedule' },
{ k: 'payment', v: 'Visa · MC · AmEx · Bizum', i: 'credit_card' },
{ k: 'dress', v: 'Smart casual', i: 'checkroom' },
{ k: 'parking', v: 'SER · parking 200m', i: 'local_parking' },
```

Solo `address` viene de la API. Los demas campos son inventados.

**Esfuerzo:** 30 min (agregar campos al modelo Restaurant) o 5 min (mover a i18n como
texto generico si no se quiere ampliar el modelo)

---

### GAP-08: RestaurantDetails — fallback de menu hardcodeado

**Archivo:** `frontend/src/pages/RestaurantDetails.tsx:317-321`

Cuando `restaurant.menuItems` esta vacio, muestra:
```typescript
{ name: 'Plato de temporada', description: 'Producto local de mercado', price: 18 },
{ name: 'Especialidad de la casa', description: 'Receta de siempre', price: 24 },
```

**Esfuerzo:** 5 minutos (mostrar mensaje "sin platos" o empty state en vez de datos falsos)

---

### GAP-09: AdminDashboard — sin grafico de revenue

**Archivo:** `frontend/src/pages/AdminDashboard.tsx`

El endpoint `GET /api/admin/stats/` devuelve `estimatedRevenue` pero solo se muestra
como numero. La tarea T2.5 del roadmap pedia un grafico.

**Esfuerzo:** 2-3 horas

---

### GAP-10: Review sin sub-ratings (food, service, ambiance)

**Archivo:** `backend/api/models.py` — modelo `Review`

El plan T3.2 pedia `food_rating`, `service_rating`, `ambiance_rating`. Solo existe
`rating` generico (1-5).

**Esfuerzo:** 1-2 horas (agregar campos, migrar, actualizar serializer y frontend)

---

### GAP-11: views_chat.py — excepciones silenciosas sin logging

**Archivo:** `backend/api/views_chat.py:44-45, 62-63`

```python
except (TypeError, ValueError):
    pass
```

Cuando se active este modulo (tras GAP-01), los errores de parseo de coordenadas
GPS no dejaran ningun rastro. Deberia usar `logger.warning()`.

**Esfuerzo:** 5 minutos

---

### GAP-12: Tests faltantes en frontend — 11 componentes sin cobertura

| Componente | Tipo |
|---|---|
| `ReservationWidget` | Widget 3 pasos |
| `ChatBot` | Chat IA flotante |
| `AuthModal` | Login/registro |
| `SearchModal` | Busqueda |
| `FloorPlan3D` | Three.js 3D |
| `OwnerDashboard` | KPIs + reservas |
| `AdminDashboard` | Stats globales |
| `FavoritesPage` | Favoritos |
| `NotificationsMenu` | Notificaciones |
| `RestaurantDetails` | Detalle restaurante |
| `MapExplorer` | Mapa MapLibre |

**Esfuerzo:** 4-6 horas para cubrir los 5 mas criticos

---

### GAP-13: Tests faltantes en backend — favorites y notifications API

No existen `test_favorites_api.py` ni `test_notifications_api.py`.

**Esfuerzo:** 2-3 horas

---

### GAP-14: docker-compose.yml — DB_PATH no usado por Django

**Archivo:** `docker-compose.yml:18`

`DB_PATH: "/data/db.sqlite3"` se pasa como env var pero `settings.py` nunca la lee.
Usa `DATABASE_URL` o cae a `BASE_DIR / "db.sqlite3"`. La variable es inerte.

**Esfuerzo:** 5 minutos (eliminar la linea o documentar que es solo para referencia)

---

### GAP-15: Dockerfile — `python manage.py seed` en cada arranque

**Archivo:** `Dockerfile:52`

El CMD ejecuta `seed` en cada inicio de contenedor. Si no es idempotente puede
duplicar datos.

**Esfuerzo:** Verificar idempotencia del comando `seed` (probablemente ya lo es
porque usa `get_or_create`). Si no, condicionar.

---

### GAP-16: Hero — contador de mesas ficticio

**Archivo:** `frontend/src/components/Hero.tsx:81`

```typescript
const [tonight, setTonight] = useState(284);
```

El numero "XX mesas disponibles" arranca en 284 y cambia aleatoriamente con un timer.

**Esfuerzo:** 30 minutos (conectar a endpoint de stats si existe, o mostrar texto estatico)

---

### GAP-17: Hero — busqueda no usa dia/hora/personas

**Archivo:** `frontend/src/components/Hero.tsx:131-137`

El formulario de busqueda del Hero tiene selectores de dia, hora y personas, pero
el submit solo envia el parametro `search`. Los demas campos son decorativos.

**Esfuerzo:** 1 hora (pasar parametros a la URL o al SearchModal)

---

### GAP-18: Logo — props `color` y `variant` definidos pero no usados

**Archivo:** `frontend/src/components/Logo.tsx:4,10`

`LogoProps` define `color` y `variant` pero el componente solo usa `size` y `className`.

**Esfuerzo:** 5 minutos (eliminar props no usados o implementarlos)

---

### GAP-19: backend/.env.example incompleto

**Archivo:** `backend/.env.example`

Faltan variables que la app realmente usa: `DEBUG`, `GOOGLE_CLIENT_ID`, `ALLOWED_HOSTS`,
`CORS_ALLOWED_ORIGINS`, `EMAIL_BACKEND`, `EMAIL_HOST`, `FRONTEND_URL`,
`STAFF_OWNER_EMAIL`, `REDIS_URL`. Contiene `PORT=3001` que Django no usa.

**Esfuerzo:** 10 minutos

---

## 2.4 — P3: BAJO / NICE TO HAVE

| Gap | Descripcion | Esfuerzo |
|---|---|---|
| PWA | `vite-plugin-pwa`, service worker, manifest, instalable | 4 horas |
| WebSockets | Django Channels + Daphne + Redis para disponibilidad en tiempo real | 1-2 semanas |
| SEO | `react-helmet-async`, meta tags, OG tags, JSON-LD | 2-3 horas |
| E2E tests | Playwright o Cypress, 3 flujos criticos | 1 semana |
| CONTRIBUTING.md | Guia para nuevos contribuidores | 30 minutos |
| Telegram notifications | Sistema de alertas documentado en `docs/09-Notify/` pero no implementado | 3-4 horas |
| `docs/Home.md` | Actualizar Claude->Gemma, Leaflet->MapLibre | 15 minutos |
| AdminDashboard "Sistemas OK" | Badge hardcodeado, no conectado a health check real | 30 minutos |

---

# 3. RESUMEN DE ESFUERZO

| Prioridad | Gaps | Esfuerzo total |
|---|---|---|
| **P0** — Critico | GAP-01 (views.py), GAP-02 (NotificationsMenu) | **5-6 horas** |
| **P1** — Alto | GAP-03 a GAP-06 | **~4 horas** |
| **P2** — Medio | GAP-07 a GAP-19 | **~15 horas** |
| **P3** — Bajo | PWA, WebSockets, SEO, E2E, Telegram, etc. | **~3-4 semanas** |
| | **TOTAL P0-P2 (llevar a ~98%)** | **~24-25 horas** |

---

# 4. ORDEN DE EJECUCION RECOMENDADO

```
Dia 1 (5-6h):
  P0 — GAP-01: Refactorizar urls.py para usar modulos separados, eliminar duplicacion de views.py
  P0 — GAP-02: Conectar NotificationsMenu a API real

Dia 2 (4h):
  P1 — GAP-03: Conectar OwnerDashboard floor plan a API
  P1 — GAP-04: Eliminar recalculo de rating redundante
  P1 — GAP-05: Reemplazo masivo ANTHROPIC -> OPENROUTER en 10 archivos de docs + docker-compose
  P1 — GAP-06: Actualizar CLAUDE.md

Dia 3 (5h):
  P2 — GAP-07: Datos hardcodeados en RestaurantDetails Info
  P2 — GAP-08: Fallback de menu hardcodeado
  P2 — GAP-09: Grafico de revenue en AdminDashboard
  P2 — GAP-10: Sub-ratings en Review
  P2 — GAP-11: Logging en views_chat.py

Dia 4-5 (8h):
  P2 — GAP-12: Tests frontend para componentes criticos
  P2 — GAP-13: Tests backend favorites + notifications API

Dia 6 (3h):
  P2 — GAP-14 a GAP-19: Limpieza final (Dockerfile, Hero, Logo, .env.example, docs/Home.md)

Semanas siguientes:
  P3 a ritmo segun necesidades del negocio
```

---

# 5. VERIFICACION FINAL

```bash
# Backend
cd backend
python manage.py test tests --verbosity 2
# Esperado: 50+ tests, todos pasan

# Frontend
cd frontend
npm run test:run
# Esperado: todos pasan (18+ tests)

npm run build
# Esperado: compila sin errores, chunks lazy visibles

npm run lint
# Esperado: sin errores

# Docker
docker compose up --build
# Esperado: servicio saludable, GET /api/health/ -> 200
```
