# PLAN DE REMEDIACION COMPLETO — ReserVia

## Resumen

Este plan cubre **42 hallazgos** de la auditoria tecnica, organizados en 8 fases
por prioridad. Cada tarea incluye archivos a modificar, codigo concreto, y
verificacion.

**Esfuerzo total estimado:** 7-9 semanas (1 desarrollador full-time).

---

# FASE 0 — PARCHE DE SEGURIDAD INMEDIATO (1 dia)

Antes de tocar cualquier otra cosa, cerrar 3 agujeros de seguridad.

---

## T0.1 — CRITICO: Eliminar fallback inseguro de `_owner_restaurant()`

**Archivo:** `backend/api/views.py` lineas 502-509
**Gravedad:** Critica — Fuga de datos entre restaurantes
**Tiempo:** 5 minutos

```python
# REEMPLAZAR el bloque actual (lineas 502-509) por:

def _owner_restaurant(request):
    email = get_staff_email(request)
    if not email:
        return None
    return Restaurant.objects.filter(owner__email=email).first()
```

Y en `owner_stats` y `owner_reservations`, cambiar 404 por 403:

```python
# owner_stats (linea 516-517) — cambiar:
if restaurant is None:
    return Response({"error": "No restaurant found"}, status=status.HTTP_404_NOT_FOUND)

# Por:
if restaurant is None:
    return Response({"error": "No tienes ningun restaurante asociado"},
                    status=status.HTTP_403_FORBIDDEN)
```

**Verificacion:** `python manage.py test tests.test_reservations_api tests.test_availability_api --verbosity 2`

---

## T0.2 — CRITICO: Eliminar GOOGLE_CLIENT_ID hardcodeado

**Archivo:** `backend/reservia/settings.py` lineas 210-213
**Gravedad:** Alta — Credencial expuesta en repositorio
**Tiempo:** 10 minutos

```python
# CAMBIAR:
GOOGLE_CLIENT_ID = os.environ.get(
    "GOOGLE_CLIENT_ID",
    "352082109619-btd5099um4joj644ig10rhg7nk03nibi.apps.googleusercontent.com",
)

# POR:
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
```

**Archivos adicionales a modificar:**
- `backend/.env.example` — anadir `GOOGLE_CLIENT_ID=`
- `docker-compose.yml` — anadir `GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}`
- `docs/06-Deployment/Environment Variables.md` — documentar la variable

**Verificacion:** Login con Google sigue funcionando tras configurar la variable de entorno.

---

## T0.3 — ALTA: Eliminar SECRET_KEY con default en produccion

**Archivo:** `backend/reservia/settings.py` lineas 24-28
**Gravedad:** Alta
**Tiempo:** 5 minutos

```python
# REEMPLAZAR lineas 24-28 por:
SECRET_KEY = os.environ.get("SECRET_KEY", "")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "reservia-dev-local-key-2026-not-for-production"
    else:
        raise RuntimeError("SECRET_KEY environment variable is required.")
```

Eliminar el bloque de lineas 33-50 que hace la comprobacion redundante con `_is_mgmt`.

---

# FASE 1 — DEUDA TECNICA ESTRUCTURAL (5-7 dias)

---

## T1.1 — Refactorizar `views.py` en 6 modulos

**Archivo:** `backend/api/views.py` (863 lineas -> dividir)
**Gravedad:** Critica para mantenibilidad
**Tiempo:** 8-12 horas

Crear estos archivos:

```
backend/api/views_auth.py        # RegisterView, login_view, google_auth_view,
                                  #   password_reset_request, password_reset_confirm,
                                  #   password_change, staff_login_view

backend/api/views_restaurants.py # RestaurantListView, cuisines_view,
                                  #   RestaurantDetailView, restaurant_availability,
                                  #   restaurant_tables

backend/api/views_reservations.py# ReservationCreateView, my_reservations,
                                  #   cancel_reservation

backend/api/views_chat.py        # chat_view

backend/api/views_dashboards.py  # _owner_restaurant, owner_stats,
                                  #   owner_reservations, admin_stats,
                                  #   admin_top_restaurants, admin_city_distribution

backend/api/views_reviews.py     # restaurant_reviews

backend/api/views_health.py      # health_check
```

Crear `backend/api/constants.py`:

```python
SERVICE_HOURS = {
    'lunch':  ['13:00', '13:30', '14:00', '14:30', '15:00'],
    'dinner': ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'],
}
```

Actualizar `backend/api/urls.py` para importar desde los nuevos modulos.

**Verificacion:**
- `python manage.py test tests --verbosity 0` -> todos los tests pasan
- `python manage.py runserver` -> la API funciona identica

---

## T1.2 — Unificar API clients del frontend: migrar `admin.ts` y `owner.ts` a `client.ts`

**Archivos:** `frontend/src/api/admin.ts`, `frontend/src/api/owner.ts`
**Gravedad:** Alta — Sin retry, sin refresh de token de staff
**Tiempo:** 2-3 horas

**Problema actual:** `admin.ts` y `owner.ts` tienen su propia funcion `staffGet()` que usa `fetch()` directo sin retry, sin timeout, sin refresh de token expirado. Ademas usan `localStorage.getItem('reservia_staff_token')` en lugar de la key unificada.

**Solucion:**

1. Extender `client.ts` para soportar tokens de staff:

```typescript
// Anadir a client.ts:

function getStaffToken(): string | null {
  return localStorage.getItem('reservia_staff_token');
}

async function staffRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStaffToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetchWithRetry(`${BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('reservia_staff_token');
    localStorage.removeItem('reservia_staff_role');
    throw new Error('Staff session expired');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as Record<string, unknown>).error as string || 'Request failed');
  }
  return data as T;
}

export const staffApi = {
  get: <T>(path: string) => staffRequest<T>(path),
  post: <T>(path: string, body: unknown) =>
    staffRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
```

2. Reescribir `admin.ts` usando `staffApi`:

```typescript
import { staffApi } from './client';

export const adminApi = {
  stats: () => staffApi.get<AdminStats>('/admin/stats/'),
  topRestaurants: () =>
    staffApi.get<{ restaurants: TopRestaurant[] }>('/admin/top-restaurants/'),
  cityDistribution: () =>
    staffApi.get<{ cities: CityData[] }>('/admin/city-distribution/'),
};
```

3. Mismo patron para `owner.ts`.

**Verificacion:**
- `npm run build` compila
- Login como staff en el navegador -> dashboard carga datos reales
- Expirar manualmente el token -> las requests fallan con mensaje claro

---

## T1.3 — Limpiar dependencias no usadas

**Archivos:** `frontend/package.json`
**Gravedad:** Media — Reduce bundle ~200KB
**Tiempo:** 30 minutos

```bash
cd frontend
npm uninstall leaflet react-leaflet @types/leaflet
npm uninstall flag-icons   # dejar country-flag-icons
```

**Verificacion:** `npm run build` compila sin errores. Verificar que no hay imports de leaflet en src/.

---

## T1.4 — Unificar constantes de localStorage

**Archivo nuevo:** `frontend/src/api/storage.ts`
**Gravedad:** Media — Evita typos y centraliza keys
**Tiempo:** 30 minutos

```typescript
export const STORAGE_KEYS = {
  TOKEN: 'reservia_token',
  REFRESH: 'reservia_refresh',
  USER: 'reservia_user',
  STAFF_TOKEN: 'reservia_staff_token',
  STAFF_ROLE: 'reservia_staff_role',
  THEME: 'reservia_theme',
  ROLES: 'reservia_roles',
  OWNER_PROFILES: 'reservia_owner_profiles',
} as const;

export const storage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
  getJSON: <T>(key: string): T | null => {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined') return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  setJSON: (key: string, value: unknown) =>
    localStorage.setItem(key, JSON.stringify(value)),
};
```

Actualizar TODOS los archivos que usan `localStorage` directamente para usar `STORAGE_KEYS` y `storage`.

**Verificacion:** `npm run build` + login/logout manual -> sin errores.

---

## T1.5 — Arreglar modelos con tipos incorrectos

**Archivo:** `backend/api/models.py`
**Gravedad:** Alta — `distance` como CharField impide filtrar por distancia real
**Tiempo:** 2 horas

### 1. Cambiar `distance` a `FloatField`

```python
# Linea 9: CAMBIAR
distance = models.CharField(max_length=50)
# POR
distance_km = models.FloatField(default=0.0, help_text="Distance from user in km")
```

### 2. Anadir indices faltantes

```python
# En class Restaurant.Meta:
indexes = [
    models.Index(fields=['cuisine']),
    models.Index(fields=['location']),
]

# En class Reservation.Meta:
indexes = [
    models.Index(fields=['date']),
    models.Index(fields=['status']),
    models.Index(fields=['user', 'date']),
]

# En class Review.Meta:
indexes = [
    models.Index(fields=['restaurant', '-created_at']),
]
```

### 3. Anadir validacion al modelo Review

```python
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
```

### 4. Cambiar `occasion` a choices

```python
class Reservation(models.Model):
    class Occasion(models.TextChoices):
        BIRTHDAY = 'birthday', 'Cumpleanos'
        ANNIVERSARY = 'anniversary', 'Aniversario'
        BUSINESS = 'business', 'Negocios'
        OTHER = 'other', 'Otro'

    occasion = models.CharField(max_length=20, choices=Occasion.choices, blank=True)
```

### 5. Migrar

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

**Archivos a revisar tras el cambio:**
- `backend/api/serializers.py` — cambiar `distance` -> `distance_km` en `RestaurantListSerializer`
- `frontend/src/api/restaurants.ts` — cambiar interfaz `Restaurant`
- `frontend/src/components/RestaurantCard.tsx` — cambiar prop `distance`
- `frontend/src/pages/Home.tsx` — IDEM

---

## T1.6 — Refactorizar recalculo de rating con signals de Django

**Archivos:** `backend/api/models.py`, `backend/api/views_reviews.py`
**Gravedad:** Media — Evita inconsistencia de datos
**Tiempo:** 1 hora

Anadir al final de `models.py`:

```python
from django.db.models.signals import post_save, post_delete
from django.db.models import Avg, Count
from django.dispatch import receiver


@receiver([post_save, post_delete], sender=Review)
def update_restaurant_rating(sender, instance, **kwargs):
    restaurant = instance.restaurant
    agg = Review.objects.filter(restaurant=restaurant).aggregate(
        avg=Avg('rating'), cnt=Count('id')
    )
    restaurant.rating = round(agg['avg'], 1) if agg['avg'] else 0.0
    restaurant.reviews_count = agg['cnt']
    restaurant.save(update_fields=['rating', 'reviews_count'])
```

Eliminar las lineas 839-842 de `views.py` que hacen esto manualmente.

**Verificacion:** `python manage.py test tests.test_reviews_api --verbosity 2`

---

## T1.7 — Sincronizar `minLength` de password en todos los niveles

**Archivos:** `frontend/src/components/AuthModal.tsx:438`, `backend/api/serializers.py:7`
**Gravedad:** Media — Inconsistencia que causa confusion al usuario
**Tiempo:** 10 minutos

```tsx
// AuthModal.tsx linea 438: CAMBIAR minLength={6} POR minLength={8}
```

```python
# serializers.py linea 7: CAMBIAR min_length=6 POR min_length=8
```

**Verificacion:** Intentar registrar con contrasena de 6 caracteres -> rechazado en frontend Y backend.

---

# FASE 2 — REFACTOR BACKEND (3-4 dias)

---

## T2.1 — Unificar paginacion con DRF `PageNumberPagination`

**Archivo nuevo:** `backend/api/pagination.py`
**Gravedad:** Media — Codigo duplicado en 3 sitios
**Tiempo:** 2-3 horas

```python
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'items': data,
            'total': self.page.count,
            'page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'total_pages': self.page.paginator.num_pages,
        })
```

Actualizar `RestaurantListView` para usar `pagination_class = StandardPagination`.

**Ajustar frontend:** La respuesta ahora usa `items` en lugar de `restaurants`. Actualizar interfaces y codigo que consume estas respuestas en:
- `frontend/src/api/restaurants.ts` (interfaz `RestaurantsResponse`)
- `frontend/src/pages/Home.tsx` (linea 48)
- `frontend/src/pages/OwnerDashboard.tsx` (respuesta de `ownerApi.reservations()`)

---

## T2.2 — Mejorar algoritmo de asignacion de mesa (best-fit)

**Archivo:** `backend/api/views.py` (o `views_reservations.py`)
**Gravedad:** Alta — `capacity__gte` sin orden puede desperdiciar mesas grandes
**Tiempo:** 1-2 horas

```python
# En ReservationCreateView.perform_create(), anadir .order_by('table__capacity'):
slot = (
    AvailabilitySlot.objects
    .select_for_update()
    .filter(
        is_available=True,
        date=res_date,
        time=res_time,
        table__restaurant=restaurant,
        table__is_active=True,
        table__capacity__gte=guests,
    )
    .select_related('table')
    .order_by('table__capacity')    # best-fit: priorizar la mas pequena
    .first()
)
```

---

## T2.3 — Corregir `staff_login_view`: vincular token a usuario real

**Archivo:** `backend/api/views.py` (o `views_auth.py`)
**Gravedad:** Alta — Token sin `user_id` puede causar problemas con DRF
**Tiempo:** 1-2 horas

```python
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([LoginRateThrottle])
def staff_login_view(request):
    code = request.data.get("code", "").strip()
    if not code:
        return Response({"error": "Access code required"}, status=400)

    staff_code = StaffCode.objects.filter(code=code).first()
    if not staff_code:
        return Response({"error": "Invalid access code"}, status=401)

    staff_user, _ = User.objects.get_or_create(
        username=f"staff_{staff_code.role}_{staff_code.id}",
        defaults={
            'email': staff_code.email or f'{staff_code.role}@reservia.internal',
        }
    )

    refresh = RefreshToken.for_user(staff_user)
    refresh['staff_role'] = staff_code.role
    refresh['email'] = staff_code.email or ''

    return Response({
        "token": str(refresh.access_token),
        "refresh": str(refresh),
        "role": staff_code.role,
    })
```

---

## T2.4 — Crear modelo `StaffCode` para reemplazar variables de entorno

**Archivo:** `backend/api/models.py`
**Gravedad:** Media — No escala mas alla de 1 restaurante
**Tiempo:** 2 horas

```python
class StaffCode(models.Model):
    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        ADMIN = 'admin', 'Admin'

    code = models.CharField(max_length=100, unique=True)
    role = models.CharField(max_length=20, choices=Role.choices)
    email = models.EmailField(blank=True)
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='staff_codes'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

Crear migration. Seedear codigos iniciales en `seed.py` a partir de las variables de entorno existentes. Mantener compatibilidad con env vars como fallback temporal.

---

## T2.5 — Anadir endpoints de favoritos

**Archivos:** `backend/api/models.py`, `backend/api/views_favorites.py`, `backend/api/urls.py`
**Gravedad:** Alta — Funcionalidad ausente, solo localStorage
**Tiempo:** 3-4 horas

```python
# models.py
class Favorite(models.Model):
    user = models.ForeignKey(User, related_name='favorites', on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, related_name='favorited_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'restaurant']
        ordering = ['-created_at']
```

Endpoints:
- `POST /api/favorites/` — body: `{restaurantId}` -> 201 | 400 si ya existe
- `DELETE /api/favorites/{restaurantId}/` -> 200
- `GET /api/favorites/` -> lista de favoritos con datos del restaurante anidados

**Frontend:**
- Actualizar `FavoritesPage.tsx` para usar endpoints reales (no localStorage)
- Actualizar `RestaurantCard.tsx` y `RestaurantDetails.tsx` para sincronizar con backend
- Mantener localStorage como cache optimista con reconciliacion al hacer login

---

# FASE 3 — NOTIFICACIONES Y REVIEWS (3-4 dias)

---

## T3.1 — Implementar backend de notificaciones

**Archivos:** `backend/api/models.py`, `backend/api/views_notifications.py`, `backend/api/urls.py`
**Gravedad:** Alta — Componente UI existe con datos mock
**Tiempo:** 5-6 horas

```python
class Notification(models.Model):
    class Type(models.TextChoices):
        BOOKING_CONFIRMED = 'booking_confirmed', 'Reserva confirmada'
        BOOKING_CANCELLED = 'booking_cancelled', 'Reserva cancelada'
        BOOKING_REMINDER = 'booking_reminder', 'Recordatorio'
        REVIEW_REQUEST = 'review_request', 'Solicitud de resena'
        SYSTEM = 'system', 'Sistema'

    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    type = models.CharField(max_length=30, choices=Type.choices)
    title = models.CharField(max_length=200)
    message = models.TextField()
    reservation = models.ForeignKey(Reservation, on_delete=models.SET_NULL, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

Endpoints:
- `GET /api/notifications/` — lista de notificaciones del usuario
- `POST /api/notifications/{id}/read/` — marcar leida
- `POST /api/notifications/read-all/` — marcar todas leidas
- `GET /api/notifications/unread-count/` — contador para badge

Crear notificaciones automaticamente en `perform_create` y `cancel_reservation`.

**Frontend:** Modificar `NotificationsMenu.tsx` para consumir endpoints reales.

---

## T3.2 — Anadir ratings desglosados a Review

**Archivo:** `backend/api/models.py`
**Gravedad:** Baja — Mejora funcional
**Tiempo:** 1-2 horas

Anadir campos: `food_rating`, `service_rating`, `ambiance_rating` (IntegerField 1-5).
Actualizar serializer y frontend.

---

# FASE 4 — RENDIMIENTO (3-4 dias)

---

## T4.1 — Lazy loading de rutas en frontend

**Archivo:** `frontend/src/App.tsx`
**Gravedad:** Alta — Bundle inicial incluye Three.js + MapLibre (~700KB gzipped)
**Tiempo:** 2-3 horas

```tsx
import React, { Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const RestaurantDetails = lazy(() => import('./pages/RestaurantDetails'));
const MapExplorer = lazy(() => import('./pages/MapExplorer'));
const FloorPlan3D = lazy(() => import('./pages/FloorPlan3D'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const BookingError = lazy(() => import('./pages/BookingError'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StaffAccess = lazy(() => import('./pages/StaffAccess'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
```

Crear componente `PageLoader` con spinner y envolver las Routes en `<Suspense fallback={<PageLoader />}>`.

**Verificacion:** `npm run build` -> chunks separados visibles en dist/assets/.

---

## T4.2 — Configurar Redis para caching y rate limiting

**Archivos:** `backend/requirements.txt`, `backend/reservia/settings.py`, `docker-compose.yml`
**Gravedad:** Alta — Rate limiting no funciona en multi-worker sin Redis
**Tiempo:** 3-4 horas

1. Anadir a `requirements.txt`: `redis>=5.0,<6.0` y `django-redis>=5.4,<6.0`
2. Anadir servicio `redis:7-alpine` a `docker-compose.yml`
3. Configurar en `settings.py`:

```python
REDIS_URL = os.environ.get("REDIS_URL", "")

if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
        }
    }
```

---

## T4.3 — Reducir MAX_RETRIES del fetch wrapper

**Archivo:** `frontend/src/api/client.ts`
**Gravedad:** Media — 127s de reintentos es demasiado
**Tiempo:** 5 minutos

```typescript
const MAX_RETRIES = 2;       // era 6
const INITIAL_RETRY_MS = 500; // era 1000
```

Esto da reintentos de 0.5s, 1s, 2s = 3.5s maximo total.

---

## T4.4 — Optimizar chat_view: limitar restaurantes en el prompt

**Archivo:** `backend/api/views_chat.py`
**Gravedad:** Alta — Prompt masivo con toda la DB en cada llamada
**Tiempo:** 1 hora

```python
# Filtrar por ubicacion si hay lat/lng, y limitar a 20 restaurantes maximo
if lat and lng:
    restaurants_qs = restaurants_qs.filter(
        lat__gte=lat - 0.05, lat__lte=lat + 0.05,
        lng__gte=lng - 0.05, lng__lte=lng + 0.05,
    )
top_restaurants = list(restaurants_qs.order_by('-rating')[:20])
```

---

# FASE 5 — TESTING (5-7 dias)

## T5.1 — Arreglar tests frontend rotos

**Archivos:** `frontend/tests/flow/Header.flow.test.tsx`, `frontend/tests/unit/CategoryCard.test.tsx`
**Gravedad:** Alta — Tests rotos = falsa seguridad
**Tiempo:** 4-6 horas

Seguir instrucciones del ROADMAP_COMPLETITUD T0.1:
1. IntersectionObserver mock ya esta en setup.ts. Verificar que carga antes que los tests.
2. Revisar `Header.flow.test.tsx` — buscar boton de lupa en lugar de `header.searchPlaceholder`.
3. Revisar `CategoryCard.test.tsx` — actualizar selectores para coincidir con DOM real.
4. Verificar que `npm run test:run` devuelve 28/28 exitosos.

---

## T5.2 — Anadir tests frontend para componentes criticos

**Archivos nuevos:**
- `frontend/tests/unit/AuthModal.test.tsx`
- `frontend/tests/unit/ReservationWidget.test.tsx`
- `frontend/tests/unit/ChatBot.test.tsx`

**Tiempo:** 8-12 horas

Cubrir: login flow, register flow, cambio de tabs, error handling, envio de reserva, respuesta de chat mock.

---

## T5.3 — Tests E2E con Playwright (opcional)

**Tiempo:** 8-12 horas

Flujos a cubrir:
1. Usuario anonimo -> busca restaurante -> ve detalle -> intenta reservar -> login requerido
2. Registro -> login -> busqueda -> reserva -> "Mis reservas" -> cancela reserva
3. Staff login -> dashboard con datos reales

---

# FASE 6 — FEATURES PENDIENTES (1-2 semanas)

## T6.1 — Busqueda geoespacial (nearby)

**Archivo:** `backend/api/views_restaurants.py`
**Gravedad:** Media
**Tiempo:** 4-5 horas

Endpoint `GET /api/restaurants/nearby/?lat=37.1773&lng=-3.5986&radius=5`:

- Calcula distancia con formula Haversine
- Filtra restaurantes dentro del radio
- Devuelve ordenado por distancia con `distanceKm` en cada item
- Frontend: boton "Cerca de mi" en SearchModal y Home usando `navigator.geolocation`

---

## T6.2 — Password reset completo

Los endpoints YA existen en `views.py:177-247` y la pagina `ResetPassword.tsx` YA existe.
Falta:
- Probar el flujo completo con `EMAIL_BACKEND = console` en desarrollo
- Configurar SendGrid/Mailgun para produccion
- Documentar en Deployment docs

**Tiempo:** 1-2 horas.

---

## T6.3 — Conectar OwnerDashboard floor plan a API real

**Archivo:** `frontend/src/pages/OwnerDashboard.tsx`
**Gravedad:** Alta — Floor plan es SVG hardcodeado
**Tiempo:** 3-4 horas

Eliminar el array `FLOOR` hardcodeado (lineas 10-22). Cargar mesas desde `restaurantsApi.tables()` y renderizar dinamicamente usando `posX`, `posY`, etc.

---

## T6.4 — SEO tecnico basico

**Archivos:** `frontend/index.html`, `frontend/src/App.tsx`
**Tiempo:** 2-3 horas

1. Instalar `react-helmet-async`
2. Envolver App con `HelmetProvider`
3. Anadir meta tags dinamicos (title, description, og:title, og:image)
4. Anadir JSON-LD structured data para RestaurantDetails

---

# FASE 7 — WEB EN TIEMPO REAL Y PWA (1-2 semanas)

## T7.1 — WebSockets con Django Channels

Anadir `channels>=4.0`, `daphne>=4.0`, `channels-redis>=4.0`. Crear `AvailabilityConsumer`. Frontend con hook `useWebSocket`.

## T7.2 — PWA con vite-plugin-pwa

Service worker con Workbox. Cache de API (NetworkFirst, 5 min). Cache de assets estaticos (CacheFirst, 1 dia). Instalable como app.

---

# FASE 8 — DOCUMENTACION Y CIERRE (2-3 dias)

## T8.1 — Actualizar CLAUDE.md

Correcciones:
- "React native" -> "React"
- `api/client.ts` usa fetch nativo, NO axios
- Anadir `POST /api/auth/google/` en lista de endpoints
- Documentar `STAFF_OWNER_EMAIL`

## T8.2 — Limpiar referencias obsoletas

Buscar y reemplazar `ANTHROPIC_API_KEY` -> `OPENROUTER_API_KEY` en toda la documentacion.

## T8.3 — Crear CONTRIBUTING.md

Con guia de estilo, como ejecutar tests, flujo de trabajo con branches, reglas de commit.

---

# RESUMEN DE ESFUERZO POR FASE

| Fase | Prioridad | Tiempo | Tareas |
|------|-----------|--------|--------|
| F0 — Parche seguridad | CRITICA | 1 dia | _owner_restaurant, GOOGLE_CLIENT_ID, SECRET_KEY |
| F1 — Deuda estructural | CRITICA | 5-7 dias | Refactor views.py, unificar API clients, limpiar deps, modelos, signals, minLength |
| F2 — Refactor backend | ALTA | 3-4 dias | Paginacion unificada, best-fit, staff token con usuario real, StaffCode, favoritos |
| F3 — Notificaciones + reviews | ALTA | 3-4 dias | Backend notificaciones, ratings desglosados |
| F4 — Rendimiento | MEDIA | 3-4 dias | Lazy loading, Redis, MAX_RETRIES, optimizar chat |
| F5 — Testing | MEDIA | 5-7 dias | Arreglar tests frontend, nuevos tests unitarios, E2E opcional |
| F6 — Features pendientes | MEDIA | 5-7 dias | Nearby, password reset test, owner floor plan real, SEO |
| F7 — Tiempo real + PWA | BAJA | 1-2 sem | WebSockets, PWA |
| F8 — Documentacion | BAJA | 2-3 dias | Actualizar docs, CONTRIBUTING.md |
| **TOTAL** | — | **7-9 semanas** | **42 tareas** |

---

# ORDEN DE EJECUCION

```
Dia 1-2:     F0 (seguridad) + F1.3-F1.4-F1.7 (quick wins)
Dia 3-8:     F1.1 (refactor views.py) + F1.2 (unificar API clients)
Dia 9-11:    F1.5 (modelos) + F1.6 (signals) + T5.1 (arreglar tests frontend)
Dia 12-15:   F2.1 (paginacion) + F2.2 (best-fit) + F2.3-F2.4 (staff token/model)
Dia 16-19:   F2.5 (favoritos) + F3.1 (notificaciones)
Dia 20-23:   F4.1 (lazy loading) + F4.3 (MAX_RETRIES) + F4.4 (chat prompt)
Dia 24-27:   F4.2 (Redis) + F5.2 (nuevos tests frontend)
Dia 28-34:   F6.1-F6.4 (features pendientes)
Dia 35-48:   F7 (WebSockets + PWA)
Dia 49-51:   F8 (documentacion)
```

---

# VERIFICACION FINAL

```bash
# Backend
cd backend
python manage.py test tests --verbosity 2
# 50+ tests, todos pasan

# Frontend
cd frontend
npm run test:run
# 30+ tests, todos pasan

npm run build
# Compila sin errores, chunks lazy visibles

npm run lint
# Sin errores

# Docker
docker compose up --build
# Servicio saludable en http://localhost
# Health check: GET /api/health/ -> 200 OK
```
