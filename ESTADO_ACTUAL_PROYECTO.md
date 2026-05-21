# ESTADO ACTUAL DEL PROYECTO — ReserVia

> Auditoria de completitud — 21 de mayo de 2026
> Nivel de completitud estimado: **~90%**

---

## Resumen ejecutivo

De las 42 tareas del PLAN_REMEDIACION_AUDITORIA y las ~40 tareas del ROADMAP_COMPLETITUD,
la mayoria ya fueron implementadas. Este documento registra que esta **hecho**, que
**falta**, y que **errores de documentacion** persisten.

---

# 1. COMPLETADO (verificado)

## 1.1 — Bloque 0: Pre-flight

| Tarea | Descripcion | Estado |
|---|---|---|
| T0.1 | Arreglar tests frontend rotos | HECHO |
| T0.2 | Limpiar codigo muerto (Search.tsx, Chat.tsx, anthropic de requirements.txt) | HECHO |
| T0.3 | Healthcheck endpoint `GET /api/health/` | HECHO |
| T0.4 | ErrorBoundary en React | HECHO |

## 1.2 — Bloque 1: Disponibilidad y reservas reales

| Tarea | Descripcion | Estado |
|---|---|---|
| T1.1 | Modelo `RestaurantTable` + `AvailabilitySlot` | HECHO |
| T1.2 | Endpoint `GET /api/restaurants/{id}/availability/` | HECHO |
| T1.3 | Endpoint `GET /api/restaurants/{id}/tables/` | HECHO |
| T1.4 | Management command `generate_slots` | HECHO |
| T1.5 | Crear/cancelar reserva consume/libera slot | HECHO |
| T1.6 | ReservationWidget con slots reales (API) | HECHO |
| T1.7 | FloorPlan3D con mesas reales (API) | HECHO |
| T1.8 | Tests de disponibilidad (`test_availability_api.py`) | HECHO |

## 1.3 — Bloque 2: Dashboards con datos reales

| Tarea | Descripcion | Estado |
|---|---|---|
| T2.1 | Permission classes IsStaffOwner, IsStaffAdmin | HECHO |
| T2.2 | Endpoints Owner Dashboard (stats, reservations) | HECHO |
| T2.3 | Endpoints Admin Dashboard (stats, top restaurants, city distribution) | HECHO |
| T2.4 | `staff_login_view` vinculado a usuario real via StaffCode | HECHO |
| T2.5 | Frontend: conectar OwnerDashboard y AdminDashboard a API | HECHO (KPIs, tabla, heatmap -- salvo floor plan) |

## 1.4 — Bloque 3: Features sociales

| Tarea | Descripcion | Estado |
|---|---|---|
| T3.1 | Favoritos (modelo + API + frontend real) | HECHO |
| T3.2 | Reviews (modelo + signal + API + frontend) | HECHO (salvo sub-ratings) |
| T3.3 | Notificaciones (modelo + API) | HECHO backend. Frontend sigue mock (ver 2.1) |

## 1.5 — Bloque 4: Mejoras UX y plataforma

| Tarea | Descripcion | Estado |
|---|---|---|
| T4.1 | Busqueda geoespacial `GET /api/restaurants/nearby/` | HECHO |
| T4.2 | Password reset (endpoints + frontend ResetPassword) | HECHO |
| T4.3 | Lazy loading de todas las rutas | HECHO |
| T4.4 | Paginacion unificada (`StandardPagination`) | HECHO |
| T4.5 | Refactorizar codigo duplicado | **PENDIENTE** (ver 2.4) |

## 1.6 — Fase 0: Parche de seguridad inmediato

| Tarea | Descripcion | Estado |
|---|---|---|
| T0.1 | Eliminar fallback inseguro de `_owner_restaurant()` | HECHO |
| T0.2 | Eliminar GOOGLE_CLIENT_ID hardcodeado | HECHO |
| T0.3 | Eliminar SECRET_KEY con default en produccion | HECHO |

## 1.7 — Fase 1 items especificos completados

| Tarea | Descripcion | Estado |
|---|---|---|
| F1.2 | Unificar API clients (staffApi en client.ts, admin.ts/owner.ts refactorizados) | HECHO |
| F1.3 | Limpiar dependencias no usadas (leaflet, flag-icons) | HECHO |
| F1.4 | Unificar constantes de localStorage (`STORAGE_KEYS` + `storage.ts`) | HECHO |
| F1.5 | Arreglar modelos: distance -> FloatField, occasion -> TextChoices, indices | HECHO |
| F1.6 | Refactorizar recalculo de rating con signals de Django | HECHO (signal existe) |
| F1.7 | Sincronizar minLength de password (8 en backend y frontend) | HECHO |

## 1.8 — Fase 2 items especificos completados

| Tarea | Descripcion | Estado |
|---|---|---|
| F2.1 | Paginacion unificada (`StandardPagination`) | HECHO |
| F2.2 | Mejorar algoritmo best-fit (`.order_by('table__capacity')`) | HECHO |
| F2.3 | Corregir staff_login_view (token vinculado a usuario real) | HECHO |
| F2.4 | Modelo StaffCode creado | HECHO |
| F2.5 | Endpoints de favoritos (modelo + API) | HECHO |

## 1.9 — Fase 4 items especificos completados

| Tarea | Descripcion | Estado |
|---|---|---|
| T4.2 | Redis en docker-compose + settings | HECHO |
| T4.3 | Reducir MAX_RETRIES a 2 | HECHO |

---

# 2. PENDIENTE — Lo que falta implementar

## 2.1 — P0: CRITICO

### views.py DUPLICADO — El chat usa la version sin optimizar

**Archivo:** `backend/api/views.py` (842 lineas)

`urls.py` sigue importando desde `views.py` para casi todos los endpoints, en lugar de
usar los modulos separados ya creados. Esto causa un bug real:

- `views_chat.py:36-43` tiene filtro geoespacial que limita restaurantes por ubicacion GPS
- `views.py:388-394` (version activa) carga TODOS los restaurantes sin filtrar: `restaurants[:30]`
- El codigo optimizado de `views_chat.py` es **codigo muerto**

**Los modulos separados existen pero solo se usan para 3 imports en `urls.py`:**
- `views_favorites` (usado)
- `views_notifications` (usado)
- `views_restaurants.nearby_restaurants` (usado)

Todos los demas (`views_auth`, `views_restaurants`, `views_reservations`, `views_chat`,
`views_dashboards`, `views_reviews`, `views_health`) NO se usan.

**Accion:** Cambiar `urls.py` para importar desde los modulos separados, eliminar codigo
duplicado de `views.py`, y verificar que `python manage.py test` sigue pasando.

**Esfuerzo estimado:** 3-4 horas

---

### NotificationsMenu usa datos hardcodeados (no conectado a API)

**Archivo:** `frontend/src/components/NotificationsMenu.tsx`

El componente define un array `INITIAL` con 5 notificaciones falsas (lineas 13-19) y
nunca llama a la API real. La funcion `markAllRead` solo actualiza estado local.

Mientras tanto, el backend tiene 4 endpoints completamente funcionales:
- `GET /api/notifications/`
- `POST /api/notifications/{id}/read/`
- `POST /api/notifications/read-all/`
- `GET /api/notifications/unread-count/`

**Accion:** Conectar el componente a `notificationsApi`, eliminar el array `INITIAL`,
y hacer que `markAllRead` llame al endpoint correspondiente.

**Esfuerzo estimado:** 2 horas

---

## 2.2 — P1: ALTO

### OwnerDashboard floor plan — SVG hardcodeado

**Archivo:** `frontend/src/pages/OwnerDashboard.tsx` (lineas 11-23)

El array `FLOOR` define 11 mesas falsas con posiciones y estados inventados. Existe el
endpoint `GET /api/restaurants/{id}/tables/` que devuelve posiciones reales (`posX`,
`posY`, `rotation`, `capacity`, `zone`, `available`), pero el dashboard nunca lo consume.

**Accion:** Eliminar `FLOOR`, cargar mesas desde `restaurantsApi.tables()`, y renderizar
dinamicamente usando las posiciones reales del backend.

**Esfuerzo estimado:** 2 horas

---

### 19 referencias a ANTHROPIC_API_KEY en documentacion

Los siguientes archivos aun mencionan `ANTHROPIC_API_KEY` o "Anthropic" en lugar de
`OPENROUTER_API_KEY` o "OpenRouter / Gemma 3":

| Archivo | Incidencias |
|---|---|
| `docs/Home.md` | 3 (Claude, Anthropic, Leaflet en vez de MapLibre) |
| `docs/03-Backend/AI Chat Integration.md` | 4 |
| `docs/07-Development/Local Setup.md` | 4 |
| `docs/06-Deployment/Railway Deployment.md` | 2 |
| `docs/06-Deployment/Docker Setup.md` | 1 |
| `docs/08-Security/Security Incidents.md` | 1 |
| `docs/07-Development/4.2 Registro de Pruebas.md` | 2 |
| `docs/07-Development/4.2.3 Pruebas de Seguridad.md` | 1 |
| `docs/07-Development/4.2.5 Copias de Seguridad.md` | 1 |
| `docs/09-Notify/Telegram Notifications.md` | 1 ("Anthropic") |

**Accion:** Reemplazo masivo `ANTHROPIC_API_KEY` -> `OPENROUTER_API_KEY` y referencias
a "Claude"/"Anthropic" por "Gemma 3 / OpenRouter" en todos los archivos listados.

**Esfuerzo estimado:** 1 hora

---

### CLAUDE.md desactualizado

**Archivo:** `CLAUDE.md`

Errores detectados:

1. **Linea 67:** Dice "Axios base client" -> deberia decir "fetch-based API client"
2. **Linea 48:** Dice "Three models: Restaurant, MenuItem, Reservation" -> hay 10+ modelos
3. **Linea 53:** Referencia `DB_PATH` -> deberia mencionar `DATABASE_URL` para prod
4. **Lineas 56-63:** Faltan endpoints: staff auth, password reset, favorites, notifications,
   reviews, health check, availability, tables, nearby, owner/admin dashboards
5. **Linea 69:** Lista solo 5 paginas -> hay 15 paginas
6. Falta mencionar Redis, MapLibre (no Leaflet), Docker healthcheck, ErrorBoundary

**Accion:** Reescribir secciones obsoletas de CLAUDE.md.

**Esfuerzo estimado:** 30 minutos

---

### Recalculo manual de rating redundante en views.py

**Archivo:** `backend/api/views.py` (lineas 818-821)

Despues de crear una review, el codigo recalcula manualmente `restaurant.rating` y
`restaurant.reviews_count` con `aggregate(Avg('rating'), Count('id'))`. Pero
`models.py:200-208` ya tiene un signal `@receiver([post_save, post_delete], sender=Review)`
que hace esto automaticamente. El codigo en la view es redundante.

**Accion:** Eliminar lineas 818-821 de `views.py`.

**Esfuerzo estimado:** 10 minutos

---

## 2.3 — P2: MEDIO

### AdminDashboard sin grafico de revenue

**Archivo:** `frontend/src/pages/AdminDashboard.tsx`

El endpoint `GET /api/admin/stats/` devuelve `estimatedRevenue` pero el frontend no
renderiza ningun grafico (bar chart, line chart, etc.). La tarea T2.5 del roadmap pedia
un chart basado en `estimatedRevenue`.

**Accion:** Agregar un componente de grafico (usando recharts o similar, si ya esta en
dependencias, o calcular datos sinteticos simples).

**Esfuerzo estimado:** 2-3 horas

---

### Modelo Review sin sub-ratings

**Archivo:** `backend/api/models.py` (Review, lineas ~115-130)

El plan T3.2 pedia `food_rating`, `service_rating`, `ambiance_rating` como campos
separados. Actualmente solo existe `rating` (1-5).

**Accion:** Agregar los 3 campos, actualizar serializer, migrar, y actualizar frontend.

**Esfuerzo estimado:** 1-2 horas

---

### Tests frontend con cobertura insuficiente

Componentes sin tests:

| Componente | Tipo |
|---|---|
| `ReservationWidget` | Widget de reserva (3 pasos) |
| `ChatBot` | Chat flotante con IA |
| `AuthModal` | Login/registro |
| `SearchModal` | Busqueda |
| `FloorPlan3D` | Plano 3D con Three.js |
| `OwnerDashboard` | Dashboard de dueño |
| `AdminDashboard` | Dashboard de admin |
| `FavoritesPage` | Pagina de favoritos |
| `NotificationsMenu` | Menu de notificaciones |
| `RestaurantDetails` | Detalle de restaurante |
| `MapExplorer` | Mapa con MapLibre |

**Accion:** Crear tests unitarios para al menos los 5 componentes mas criticos
(ReservationWidget, AuthModal, ChatBot, NotificationsMenu, RestaurantDetails).

**Esfuerzo estimado:** 4-6 horas

---

### Sin tests de favorites API ni notifications API en backend

Existen los modelos y endpoints pero no hay tests en `backend/tests/` que cubran:
- `POST /api/favorites/`, `DELETE /api/favorites/{id}/`, `GET /api/favorites/`
- `GET /api/notifications/`, `POST /api/notifications/{id}/read/`, etc.

**Accion:** Crear `test_favorites_api.py` y `test_notifications_api.py`.

**Esfuerzo estimado:** 2-3 horas

---

### views_chat.py con `pass` silenciosos en manejo de errores

**Archivo:** `backend/api/views_chat.py` (lineas 45, 63)

Al parsear coordenadas GPS del request, las excepciones `TypeError` y `ValueError` se
atrapan con `pass` sin ningun logging. Si un cliente envia coordenadas invalidas, el
servidor simplemente las ignora sin dejar rastro.

**Accion:** Agregar `logger.warning()` en ambos bloques `except`.

**Esfuerzo estimado:** 5 minutos

---

### docs/Home.md desactualizado

| Linea | Error | Correccion |
|---|---|---|
| 13 | "Claude" | "Gemma 3 via OpenRouter" |
| 43 | "Claude (Anthropic)" en AI Chat | "Gemma 3 (OpenRouter)" |
| 113 | "Anthropic Claude Haiku 4.5" | "Google Gemma 3 via OpenRouter" |
| 117 | "Leaflet.js" | "MapLibre GL JS" |
| 122-123 | Describe mapas Leaflet | Describir MapLibre |

**Esfuerzo estimado:** 15 minutos

---

## 2.4 — P3: BAJO / NICE TO HAVE

### PWA (Progressive Web App)

Sin `vite-plugin-pwa`, sin service worker, sin `manifest.json`. La aplicacion no es
instalable en movil/desktop. Tarea T5.2 del roadmap.

**Esfuerzo estimado:** 4 horas

---

### WebSockets para disponibilidad en tiempo real

Sin Django Channels, Daphne, ni Channels-Redis. La disponibilidad de mesas requiere
que el cliente recargue o haga polling. Tarea T5.1 del roadmap.

**Esfuerzo estimado:** 1-2 semanas

---

### SEO tecnico

Sin `react-helmet-async`, sin meta tags dinamicos, sin OG tags, sin JSON-LD estructurado
para RestaurantDetails. Tarea T6.4 del plan.

**Esfuerzo estimado:** 2-3 horas

---

### E2E tests con Playwright o Cypress

Sin configuracion de E2E. El plan sugiere 3 flujos: busqueda anonima -> auth gate,
registro -> reserva -> cancelar, staff login -> dashboard.

**Esfuerzo estimado:** 1 semana

---

### CONTRIBUTING.md no existe

Tarea T8.3 del plan. Nuevos contribuidores no tienen guia de onboarding.

**Esfuerzo estimado:** 30 minutos

---

### Notificaciones Telegram documentadas pero no implementadas

`docs/09-Notify/Telegram Notifications.md` describe un sistema completo de alertas por
Telegram (errores 500, fallos de reserva, etc.) pero no hay codigo implementado.

**Esfuerzo estimado:** 3-4 horas

---

# 3. RESUMEN DE ESFUERZO PENDIENTE

| Prioridad | Tarea | Esfuerzo |
|---|---|---|
| **P0** | Corregir urls.py para usar modulos separados (eliminar duplicacion views.py) | 3-4 h |
| **P0** | Conectar NotificationsMenu a API real | 2 h |
| **P1** | Conectar OwnerDashboard floor plan a API | 2 h |
| **P1** | Actualizar 19 referencias ANTHROPIC -> OPENROUTER | 1 h |
| **P1** | Actualizar CLAUDE.md | 30 min |
| **P1** | Eliminar recalculo de rating redundante en views.py | 10 min |
| **P2** | Grafico de revenue en AdminDashboard | 2-3 h |
| **P2** | Sub-ratings en modelo Review | 1-2 h |
| **P2** | Tests frontend para componentes criticos | 4-6 h |
| **P2** | Tests backend de favorites y notifications API | 2-3 h |
| **P2** | Agregar logging a views_chat.py (excepciones silenciosas) | 5 min |
| **P2** | Actualizar docs/Home.md | 15 min |
| **P3** | PWA | 4 h |
| **P3** | WebSockets | 1-2 sem |
| **P3** | SEO | 2-3 h |
| **P3** | E2E tests | 1 sem |
| **P3** | CONTRIBUTING.md | 30 min |
| **P3** | Telegram notifications | 3-4 h |
| | **TOTAL P0-P2** | **~20 horas** |
| | **TOTAL P3** | **~3-4 semanas** |

---

# 4. ORDEN DE EJECUCION RECOMENDADO

1. **Dia 1:** P0 — urls.py + NotificationsMenu (5-6 h)
2. **Dia 2:** P1 — Floor plan, docs (ANTHROPIC, CLAUDE.md, Home.md), rating redundante (3-4 h)
3. **Dia 3:** P2 — Revenue chart, sub-ratings, logging views_chat (3-5 h)
4. **Dia 4-5:** P2 — Tests frontend + backend (6-9 h)
5. **Semanas siguientes:** P3 a ritmo segun prioridad del negocio

---

# 5. VERIFICACION FINAL (al completar P0-P2)

```bash
# Backend
cd backend
python manage.py test tests --verbosity 2
# Todos los tests pasan

# Frontend
cd frontend
npm run test:run
# Mejor cobertura

npm run build
# Compila sin errores

# Lint
npm run lint
# Sin errores

# Docker
docker compose up --build
# Servicio saludable
```
