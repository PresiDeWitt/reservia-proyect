# ReserVia — Admin completo, Owner UI y Robustez: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar ReserVia: panel admin con gestión de usuarios/restaurantes/reseñas/códigos staff y auditoría, UI de menú y mesas en owner dashboard, validaciones backend, error handling visible y tests.

**Architecture:** Backend Django 4.2 + DRF con function-based views y permisos `IsStaffAdmin`/`IsStaffOwner` por token JWT con claim `staff_role`. Frontend React 19 + TS; AdminDashboard gana 5 tabs nuevos implementados como componentes en `frontend/src/components/admin/`. Auditoría con modelo `AdminAuditLog` y helper `log_admin_action()`.

**Tech Stack:** Django 4.2, DRF, simplejwt, SQLite, React 19, TypeScript, Vite, Vitest, i18next.

**Comandos base:**
- Tests backend: `cd backend && source venv/bin/activate && python manage.py test api -v 1`
- Un test: `python manage.py test api.tests.test_admin_api -v 2`
- Tests frontend: `cd frontend && npx vitest run`
- Migraciones: `python manage.py makemigrations api && python manage.py migrate`

**Convenciones del repo:** commits sin co-autores, mensajes estilo `feat:`/`fix:`/`test:` en español. Nunca tocar `main` — todo en `fix/critical-gaps`.

---

## Task 0: Cerrar trabajo pendiente (Fase 0)

**Files:** los 21 modificados ya presentes en la rama (no escribir código nuevo).

- [ ] **Step 0.1:** Ejecutar tests backend: `cd backend && source venv/bin/activate && python manage.py test api`. Expected: OK.
- [ ] **Step 0.2:** Ejecutar tests frontend: `cd frontend && npx vitest run`. Expected: verde.
- [ ] **Step 0.3:** Eliminar el `.pyc` del staging si aparece (`backend/api/management/commands/__pycache__/__init__.cpython-314.pyc`) — añadir `__pycache__/` a `.gitignore` si no está.
- [ ] **Step 0.4:** Commit en dos partes:

```bash
git add backend/api/serializers.py backend/api/urls.py backend/api/views_auth.py backend/api/views_owner.py backend/api/views_reservations.py
git commit -m "feat: CRUD owner (perfil, menu, mesas), rol en UserSerializer y welcome email"
git add frontend/src frontend/tests
git commit -m "feat: perfiles owner desde backend, roles del servidor y mejoras i18n"
```

---

## Task 1: Modelo `AdminAuditLog` + helper

**Files:**
- Modify: `backend/api/models.py` (añadir al final, antes de la sección de signals)
- Create: migración auto
- Modify: `backend/api/views_admin.py`
- Test: `backend/api/tests/test_admin_audit.py` (create)

- [x] **Step 1.1: Test que falla**

```python
# backend/api/tests/test_admin_audit.py
from django.test import TestCase
from api.models import AdminAuditLog


class AdminAuditLogModelTests(TestCase):
    def test_create_log_entry(self):
        log = AdminAuditLog.objects.create(
            admin_email="admin@reservia.com",
            action="impersonate",
            target_type="restaurant",
            target_id="5",
            detail="Impersonó al owner del restaurante 5",
        )
        self.assertIsNotNone(log.created_at)
        self.assertEqual(AdminAuditLog.objects.count(), 1)
```

- [x] **Step 1.2:** Run `python manage.py test api.tests.test_admin_audit -v 2`. Expected: FAIL (ImportError: AdminAuditLog).
- [x] **Step 1.3: Modelo** — en `models.py`, después de `Favorite` y antes de los signals:

```python
class AdminAuditLog(models.Model):
    admin_email = models.CharField(max_length=255)
    action = models.CharField(max_length=50)
    target_type = models.CharField(max_length=50)
    target_id = models.CharField(max_length=50, blank=True)
    detail = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['-created_at'])]

    def __str__(self):
        return f"{self.admin_email}: {self.action} {self.target_type}#{self.target_id}"
```

- [x] **Step 1.4:** `python manage.py makemigrations api && python manage.py migrate`. Expected: nueva migración con `AdminAuditLog`.
- [x] **Step 1.5: Helper** — en `views_admin.py`, tras los imports (añadir `from .permissions import IsStaffAdmin, get_staff_email` y `from .models import Restaurant, Reservation, Review, StaffCode, AdminAuditLog`):

```python
def log_admin_action(request, action, target_type, target_id="", detail=""):
    AdminAuditLog.objects.create(
        admin_email=get_staff_email(request) or "unknown",
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        detail=detail,
    )
```

- [x] **Step 1.6:** Run test. Expected: PASS.
- [x] **Step 1.7:** Commit: `git add backend/api/models.py backend/api/migrations backend/api/views_admin.py backend/api/tests/test_admin_audit.py && git commit -m "feat: modelo AdminAuditLog y helper de auditoria admin"`

---

## Task 2: Endpoints admin de usuarios

**Files:**
- Modify: `backend/api/views_admin.py`
- Modify: `backend/api/urls.py`
- Test: `backend/api/tests/test_admin_users.py` (create)

- [x] **Step 2.1: Tests que fallan**

```python
# backend/api/tests/test_admin_users.py
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import AdminAuditLog


def admin_client():
    user = User.objects.create_user(username="admin@reservia.com", email="admin@reservia.com")
    refresh = RefreshToken.for_user(user)
    refresh['staff_role'] = 'admin'
    refresh['email'] = user.email
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


class AdminUsersTests(TestCase):
    def setUp(self):
        self.client = admin_client()
        self.target = User.objects.create_user(
            username="cliente@test.com", email="cliente@test.com", first_name="Ana")

    def test_list_users(self):
        res = self.client.get("/api/admin/users/")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data["total"], 2)
        emails = [u["email"] for u in res.data["users"]]
        self.assertIn("cliente@test.com", emails)

    def test_search_users(self):
        res = self.client.get("/api/admin/users/?search=ana")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["users"][0]["email"], "cliente@test.com")

    def test_deactivate_user_logs_action(self):
        res = self.client.patch(f"/api/admin/users/{self.target.id}/",
                                {"is_active": False}, format="json")
        self.assertEqual(res.status_code, 200)
        self.target.refresh_from_db()
        self.assertFalse(self.target.is_active)
        self.assertTrue(AdminAuditLog.objects.filter(action="user_deactivate").exists())

    def test_requires_admin_role(self):
        res = APIClient().get("/api/admin/users/")
        self.assertEqual(res.status_code, 403)
```

- [x] **Step 2.2:** Run `python manage.py test api.tests.test_admin_users -v 2`. Expected: FAIL (404).
- [x] **Step 2.3: Implementación** — en `views_admin.py` (añadir `from django.db.models import Q` al import existente):

```python
def _paginate(request, qs, page_size=20):
    page = max(1, int(request.query_params.get('page', 1)))
    total = qs.count()
    return qs[(page - 1) * page_size: page * page_size], page, total, max(1, (total + page_size - 1) // page_size)


@api_view(["GET"])
@permission_classes([IsStaffAdmin])
def admin_users(request):
    from django.contrib.auth.models import User
    qs = User.objects.order_by('-date_joined')
    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    items, page, total, total_pages = _paginate(request, qs)
    return Response({
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": f"{u.first_name} {u.last_name}".strip(),
                "isActive": u.is_active,
                "dateJoined": u.date_joined.date().isoformat(),
                "reservations": u.reservations.count(),
            }
            for u in items
        ],
        "total": total, "page": page, "total_pages": total_pages,
    })


@api_view(["PATCH"])
@permission_classes([IsStaffAdmin])
def admin_user_detail(request, pk):
    from django.contrib.auth.models import User
    from rest_framework import status as drf_status
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=drf_status.HTTP_404_NOT_FOUND)

    if "is_active" not in request.data:
        return Response({"error": "Falta is_active"}, status=drf_status.HTTP_400_BAD_REQUEST)

    user.is_active = bool(request.data["is_active"])
    user.save(update_fields=["is_active"])
    action = "user_deactivate" if not user.is_active else "user_activate"
    log_admin_action(request, action, "user", user.id, f"Usuario {user.email}")
    return Response({"id": user.id, "isActive": user.is_active})
```

Nota: `Q` viene de `django.db.models`; el archivo ya importa `from django.db import models`, así que añade `Q` explícito: `from django.db.models import Count, Avg, Sum, Q`.

- [x] **Step 2.4: Rutas** — en `urls.py`, sección Admin Dashboard:

```python
    path("admin/users/", views_admin.admin_users, name="admin-users"),
    path("admin/users/<int:pk>/", views_admin.admin_user_detail, name="admin-user-detail"),
```

- [x] **Step 2.5:** Run tests. Expected: PASS (4/4).
- [x] **Step 2.6:** Commit: `git add backend/api/views_admin.py backend/api/urls.py backend/api/tests/test_admin_users.py && git commit -m "feat: gestion de usuarios desde panel admin con auditoria"`

---

## Task 3: Endpoints admin de restaurantes

**Files:**
- Modify: `backend/api/views_admin.py`, `backend/api/urls.py`
- Test: `backend/api/tests/test_admin_restaurants.py` (create)

- [x] **Step 3.1: Tests que fallan**

```python
# backend/api/tests/test_admin_restaurants.py
from django.contrib.auth.models import User
from django.test import TestCase
from api.models import Restaurant, AdminAuditLog
from api.tests.test_admin_users import admin_client


def make_restaurant(**kw):
    defaults = dict(name="Casa Pepe", cuisine="Española", location="Madrid",
                    rating=4.5, price_range="€€", address="Calle Mayor 1",
                    description="Tradicional", lat=40.4, lng=-3.7,
                    image_url="https://example.com/x.jpg")
    defaults.update(kw)
    return Restaurant.objects.create(**defaults)


class AdminRestaurantsTests(TestCase):
    def setUp(self):
        self.client = admin_client()
        self.rest = make_restaurant()

    def test_list(self):
        res = self.client.get("/api/admin/restaurants/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total"], 1)

    def test_create(self):
        res = self.client.post("/api/admin/restaurants/", {
            "name": "Nuevo", "cuisine": "Italiana", "location": "Barcelona",
            "address": "Diagonal 100",
        }, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertTrue(Restaurant.objects.filter(name="Nuevo").exists())
        self.assertTrue(AdminAuditLog.objects.filter(action="restaurant_create").exists())

    def test_create_requires_name(self):
        res = self.client.post("/api/admin/restaurants/", {"name": "  "}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_update_assign_owner(self):
        owner = User.objects.create_user(username="own@test.com", email="own@test.com")
        res = self.client.patch(f"/api/admin/restaurants/{self.rest.id}/",
                                {"owner_email": "own@test.com", "name": "Casa Pepe 2"},
                                format="json")
        self.assertEqual(res.status_code, 200)
        self.rest.refresh_from_db()
        self.assertEqual(self.rest.owner, owner)
        self.assertEqual(self.rest.name, "Casa Pepe 2")

    def test_update_owner_not_found(self):
        res = self.client.patch(f"/api/admin/restaurants/{self.rest.id}/",
                                {"owner_email": "nadie@test.com"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_delete_logs_action(self):
        res = self.client.delete(f"/api/admin/restaurants/{self.rest.id}/")
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Restaurant.objects.filter(pk=self.rest.id).exists())
        self.assertTrue(AdminAuditLog.objects.filter(action="restaurant_delete").exists())
```

- [x] **Step 3.2:** Run. Expected: FAIL (404).
- [x] **Step 3.3: Implementación** en `views_admin.py`:

```python
@api_view(["GET", "POST"])
@permission_classes([IsStaffAdmin])
def admin_restaurants(request):
    from rest_framework import status as drf_status
    if request.method == "GET":
        qs = Restaurant.objects.order_by('name')
        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(location__icontains=search))
        items, page, total, total_pages = _paginate(request, qs)
        return Response({
            "restaurants": [
                {
                    "id": r.id, "name": r.name, "cuisine": r.cuisine,
                    "location": r.location, "rating": r.rating,
                    "ownerEmail": r.owner.email if r.owner else None,
                }
                for r in items
            ],
            "total": total, "page": page, "total_pages": total_pages,
        })

    data = request.data
    name = str(data.get("name", "")).strip()
    if not name:
        return Response({"error": "El nombre es obligatorio"}, status=drf_status.HTTP_400_BAD_REQUEST)
    restaurant = Restaurant.objects.create(
        name=name,
        cuisine=str(data.get("cuisine", "")).strip() or "General",
        location=str(data.get("location", "")).strip() or "Sin ciudad",
        address=str(data.get("address", "")).strip(),
        description=str(data.get("description", "")),
        rating=0.0,
        price_range=str(data.get("price_range", "€€")),
        lat=float(data.get("lat", 0)),
        lng=float(data.get("lng", 0)),
        image_url=str(data.get("image_url", "")),
    )
    log_admin_action(request, "restaurant_create", "restaurant", restaurant.id, f"Creado {restaurant.name}")
    return Response({"id": restaurant.id, "name": restaurant.name}, status=drf_status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsStaffAdmin])
def admin_restaurant_detail(request, pk):
    from django.contrib.auth.models import User
    from rest_framework import status as drf_status
    try:
        restaurant = Restaurant.objects.get(pk=pk)
    except Restaurant.DoesNotExist:
        return Response({"error": "Restaurante no encontrado"}, status=drf_status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        name = restaurant.name
        restaurant.delete()
        log_admin_action(request, "restaurant_delete", "restaurant", pk, f"Eliminado {name}")
        return Response(status=drf_status.HTTP_204_NO_CONTENT)

    data = request.data
    if "name" in data and not str(data["name"]).strip():
        return Response({"error": "El nombre no puede estar vacío"}, status=drf_status.HTTP_400_BAD_REQUEST)
    if "owner_email" in data:
        email = str(data["owner_email"]).strip()
        if email:
            owner = User.objects.filter(email=email).first()
            if owner is None:
                return Response({"error": f"No existe usuario con email {email}"},
                                status=drf_status.HTTP_400_BAD_REQUEST)
            restaurant.owner = owner
        else:
            restaurant.owner = None
    for field in ("name", "cuisine", "location", "address", "description", "price_range", "image_url"):
        if field in data:
            setattr(restaurant, field, str(data[field]).strip() if field == "name" else data[field])
    if "lat" in data and "lng" in data:
        restaurant.lat = float(data["lat"])
        restaurant.lng = float(data["lng"])
    restaurant.save()
    log_admin_action(request, "restaurant_update", "restaurant", pk, f"Actualizado {restaurant.name}")
    return Response({"id": restaurant.id, "name": restaurant.name,
                     "ownerEmail": restaurant.owner.email if restaurant.owner else None})
```

- [x] **Step 3.4: Rutas:**

```python
    path("admin/restaurants/", views_admin.admin_restaurants, name="admin-restaurants"),
    path("admin/restaurants/<int:pk>/", views_admin.admin_restaurant_detail, name="admin-restaurant-detail"),
```

- [x] **Step 3.5:** Run tests. Expected: PASS (6/6).
- [x] **Step 3.6:** Commit: `git commit -m "feat: CRUD de restaurantes desde panel admin con auditoria"`

---

## Task 4: Moderación de reseñas (admin)

**Files:**
- Modify: `backend/api/views_admin.py`, `backend/api/urls.py`
- Test: `backend/api/tests/test_admin_reviews.py` (create)

- [x] **Step 4.1: Tests que fallan**

```python
# backend/api/tests/test_admin_reviews.py
from django.contrib.auth.models import User
from django.test import TestCase
from api.models import Review, AdminAuditLog
from api.tests.test_admin_users import admin_client
from api.tests.test_admin_restaurants import make_restaurant


class AdminReviewsTests(TestCase):
    def setUp(self):
        self.client = admin_client()
        self.rest = make_restaurant()
        self.user = User.objects.create_user(username="rev@test.com", email="rev@test.com")
        self.review = Review.objects.create(
            user=self.user, restaurant=self.rest, rating=1, comment="Malísimo, spam spam")

    def test_list_reviews(self):
        res = self.client.get("/api/admin/reviews/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total"], 1)
        self.assertEqual(res.data["reviews"][0]["comment"], "Malísimo, spam spam")

    def test_search_by_restaurant(self):
        res = self.client.get("/api/admin/reviews/?search=casa")
        self.assertEqual(res.data["total"], 1)

    def test_delete_review_recalculates_rating(self):
        res = self.client.delete(f"/api/admin/reviews/{self.review.id}/")
        self.assertEqual(res.status_code, 204)
        self.rest.refresh_from_db()
        self.assertEqual(self.rest.rating, 0.0)  # signal post_delete recalcula
        self.assertTrue(AdminAuditLog.objects.filter(action="review_delete").exists())
```

- [x] **Step 4.2:** Run. Expected: FAIL (404).
- [x] **Step 4.3: Implementación:**

```python
@api_view(["GET"])
@permission_classes([IsStaffAdmin])
def admin_reviews(request):
    qs = Review.objects.select_related('user', 'restaurant').order_by('-created_at')
    search = request.query_params.get('search', '').strip()
    if search:
        qs = qs.filter(
            Q(restaurant__name__icontains=search) |
            Q(user__email__icontains=search) |
            Q(comment__icontains=search)
        )
    items, page, total, total_pages = _paginate(request, qs)
    return Response({
        "reviews": [
            {
                "id": rv.id, "rating": rv.rating, "comment": rv.comment,
                "userEmail": rv.user.email, "restaurantName": rv.restaurant.name,
                "createdAt": rv.created_at.date().isoformat(),
            }
            for rv in items
        ],
        "total": total, "page": page, "total_pages": total_pages,
    })


@api_view(["DELETE"])
@permission_classes([IsStaffAdmin])
def admin_review_detail(request, pk):
    from rest_framework import status as drf_status
    try:
        review = Review.objects.select_related('restaurant').get(pk=pk)
    except Review.DoesNotExist:
        return Response({"error": "Reseña no encontrada"}, status=drf_status.HTTP_404_NOT_FOUND)
    detail = f"Reseña de {review.user.email} en {review.restaurant.name} ({review.rating}★)"
    review.delete()
    log_admin_action(request, "review_delete", "review", pk, detail)
    return Response(status=drf_status.HTTP_204_NO_CONTENT)
```

- [x] **Step 4.4: Rutas:**

```python
    path("admin/reviews/", views_admin.admin_reviews, name="admin-reviews"),
    path("admin/reviews/<int:pk>/", views_admin.admin_review_detail, name="admin-review-detail"),
```

- [x] **Step 4.5:** Run tests. Expected: PASS (3/3).
- [x] **Step 4.6:** Commit: `git commit -m "feat: moderacion de resenas desde panel admin"`

---

## Task 5: Gestión de códigos staff (admin)

**Files:**
- Modify: `backend/api/views_admin.py`, `backend/api/urls.py`
- Test: `backend/api/tests/test_admin_staff_codes.py` (create)

- [x] **Step 5.1: Tests que fallan**

```python
# backend/api/tests/test_admin_staff_codes.py
from django.test import TestCase
from api.models import StaffCode, AdminAuditLog
from api.tests.test_admin_users import admin_client
from api.tests.test_admin_restaurants import make_restaurant


class AdminStaffCodesTests(TestCase):
    def setUp(self):
        self.client = admin_client()
        self.code = StaffCode.objects.create(code="OWNER-123", role="owner")

    def test_list_codes(self):
        res = self.client.get("/api/admin/staff-codes/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["codes"][0]["code"], "OWNER-123")

    def test_create_code(self):
        rest = make_restaurant()
        res = self.client.post("/api/admin/staff-codes/", {
            "code": "NEW-456", "role": "owner", "restaurant_id": rest.id,
        }, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertTrue(StaffCode.objects.filter(code="NEW-456").exists())
        self.assertTrue(AdminAuditLog.objects.filter(action="staffcode_create").exists())

    def test_create_rejects_duplicate(self):
        res = self.client.post("/api/admin/staff-codes/",
                               {"code": "OWNER-123", "role": "owner"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_create_rejects_bad_role(self):
        res = self.client.post("/api/admin/staff-codes/",
                               {"code": "X-1", "role": "superuser"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_revoke_code(self):
        res = self.client.patch(f"/api/admin/staff-codes/{self.code.id}/",
                                {"is_active": False}, format="json")
        self.assertEqual(res.status_code, 200)
        self.code.refresh_from_db()
        self.assertFalse(self.code.is_active)
        self.assertTrue(AdminAuditLog.objects.filter(action="staffcode_revoke").exists())
```

- [x] **Step 5.2:** Run. Expected: FAIL (404).
- [x] **Step 5.3: Implementación:**

```python
@api_view(["GET", "POST"])
@permission_classes([IsStaffAdmin])
def admin_staff_codes(request):
    from rest_framework import status as drf_status
    if request.method == "GET":
        qs = StaffCode.objects.select_related('restaurant').order_by('-created_at')
        items, page, total, total_pages = _paginate(request, qs)
        return Response({
            "codes": [
                {
                    "id": c.id, "code": c.code, "role": c.role,
                    "email": c.email or "", "isActive": c.is_active,
                    "restaurantName": c.restaurant.name if c.restaurant else None,
                    "createdAt": c.created_at.date().isoformat(),
                }
                for c in items
            ],
            "total": total, "page": page, "total_pages": total_pages,
        })

    data = request.data
    code = str(data.get("code", "")).strip()
    role = str(data.get("role", "")).strip()
    if not code:
        return Response({"error": "El código es obligatorio"}, status=drf_status.HTTP_400_BAD_REQUEST)
    if role not in (StaffCode.Role.OWNER, StaffCode.Role.ADMIN):
        return Response({"error": "Rol no válido (owner|admin)"}, status=drf_status.HTTP_400_BAD_REQUEST)
    if StaffCode.objects.filter(code=code).exists():
        return Response({"error": "Ese código ya existe"}, status=drf_status.HTTP_400_BAD_REQUEST)

    restaurant = None
    if data.get("restaurant_id"):
        restaurant = Restaurant.objects.filter(pk=data["restaurant_id"]).first()
        if restaurant is None:
            return Response({"error": "Restaurante no encontrado"}, status=drf_status.HTTP_400_BAD_REQUEST)

    staff_code = StaffCode.objects.create(
        code=code, role=role, email=str(data.get("email", "")), restaurant=restaurant)
    log_admin_action(request, "staffcode_create", "staffcode", staff_code.id,
                     f"Código {role} {code[:8]}...")
    return Response({"id": staff_code.id, "code": staff_code.code, "role": staff_code.role},
                    status=drf_status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsStaffAdmin])
def admin_staff_code_detail(request, pk):
    from rest_framework import status as drf_status
    try:
        staff_code = StaffCode.objects.get(pk=pk)
    except StaffCode.DoesNotExist:
        return Response({"error": "Código no encontrado"}, status=drf_status.HTTP_404_NOT_FOUND)
    if "is_active" not in request.data:
        return Response({"error": "Falta is_active"}, status=drf_status.HTTP_400_BAD_REQUEST)
    staff_code.is_active = bool(request.data["is_active"])
    staff_code.save(update_fields=["is_active"])
    action = "staffcode_revoke" if not staff_code.is_active else "staffcode_activate"
    log_admin_action(request, action, "staffcode", pk, f"Código {staff_code.code[:8]}...")
    return Response({"id": staff_code.id, "isActive": staff_code.is_active})
```

- [x] **Step 5.4: Rutas:**

```python
    path("admin/staff-codes/", views_admin.admin_staff_codes, name="admin-staff-codes"),
    path("admin/staff-codes/<int:pk>/", views_admin.admin_staff_code_detail, name="admin-staff-code-detail"),
```

- [x] **Step 5.5:** Run tests. Expected: PASS (5/5).
- [x] **Step 5.6:** Commit: `git commit -m "feat: gestion de codigos staff desde panel admin"`

---

## Task 6: Audit log endpoint + auditar impersonación

**Files:**
- Modify: `backend/api/views_admin.py`, `backend/api/urls.py`
- Test: añadir a `backend/api/tests/test_admin_audit.py`

- [x] **Step 6.1: Tests que fallan** (añadir al archivo de Task 1):

```python
from rest_framework.test import APIClient
from api.tests.test_admin_users import admin_client
from api.tests.test_admin_restaurants import make_restaurant


class AdminAuditEndpointTests(TestCase):
    def setUp(self):
        self.client = admin_client()

    def test_audit_log_list(self):
        AdminAuditLog.objects.create(admin_email="a@b.com", action="x", target_type="user")
        res = self.client.get("/api/admin/audit-log/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total"], 1)

    def test_impersonate_creates_log(self):
        rest = make_restaurant()
        res = self.client.post("/api/admin/impersonate/", {"restaurant_id": rest.id}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(AdminAuditLog.objects.filter(
            action="impersonate", target_id=str(rest.id)).exists())
```

- [x] **Step 6.2:** Run. Expected: FAIL.
- [x] **Step 6.3: Implementación** — endpoint nuevo y una línea en `admin_impersonate_owner` justo antes del `return Response({...})` final:

```python
@api_view(["GET"])
@permission_classes([IsStaffAdmin])
def admin_audit_log(request):
    qs = AdminAuditLog.objects.all()
    items, page, total, total_pages = _paginate(request, qs)
    return Response({
        "entries": [
            {
                "id": e.id, "adminEmail": e.admin_email, "action": e.action,
                "targetType": e.target_type, "targetId": e.target_id,
                "detail": e.detail, "createdAt": e.created_at.isoformat(),
            }
            for e in items
        ],
        "total": total, "page": page, "total_pages": total_pages,
    })
```

En `admin_impersonate_owner`:

```python
    log_admin_action(request, "impersonate", "restaurant", restaurant_id,
                     f"Impersonó al owner de {restaurant.name}")
```

- [x] **Step 6.4: Ruta:** `path("admin/audit-log/", views_admin.admin_audit_log, name="admin-audit-log"),`
- [x] **Step 6.5:** Run tests + suite completa: `python manage.py test api`. Expected: todo PASS.
- [x] **Step 6.6:** Commit: `git commit -m "feat: log de auditoria consultable e impersonacion auditada"`

---

## Task 7: Campo `capacity` en Restaurant

**Files:**
- Modify: `backend/api/models.py` (Restaurant), `backend/api/views_owner.py` (owner_profile)
- Modify: `frontend/src/api/ownerProfile.ts`, `frontend/src/components/OwnerOnboarding.tsx` (quitar el workaround "not on the backend yet")
- Test: añadir a `backend/api/tests/test_owner_api.py`

- [ ] **Step 7.1: Test que falla** (añadir test: PATCH `/api/owner/profile/` con `{"capacity": 40}` responde 200 y GET devuelve `"capacity": 40`; usar el helper de cliente owner ya presente en `test_owner_api.py`).

```python
    def test_owner_profile_capacity(self):
        res = self.client.patch("/api/owner/profile/", {"capacity": 40}, format="json")
        self.assertEqual(res.status_code, 200)
        res = self.client.get("/api/owner/profile/")
        self.assertEqual(res.data["capacity"], 40)
```

- [ ] **Step 7.2:** Run. Expected: FAIL (KeyError capacity).
- [ ] **Step 7.3: Modelo** — en `Restaurant` añadir tras `reviews_count`:

```python
    capacity = models.IntegerField(default=0)
```

`python manage.py makemigrations api && python manage.py migrate`

- [ ] **Step 7.4: View** — en `owner_profile` GET añadir `"capacity": restaurant.capacity,` al dict; en PATCH añadir:

```python
    if "capacity" in data:
        restaurant.capacity = max(0, int(data["capacity"]))
```

- [ ] **Step 7.5:** Frontend: en `ownerProfile.ts` añadir `capacity?: number` al tipo del perfil y pasarlo en get/set; en `OwnerOnboarding.tsx` enviar `capacity` en el payload (buscar el comentario `// not on the backend yet` y eliminarlo usando ya el campo real).
- [ ] **Step 7.6:** Run tests backend + `npx vitest run`. Expected: PASS.
- [ ] **Step 7.7:** Commit: `git commit -m "feat: capacidad del restaurante persistida en backend"`

---

## Task 8: Validaciones backend owner (Fase 3)

**Files:**
- Modify: `backend/api/views_owner.py`
- Test: `backend/api/tests/test_owner_validations.py` (create)

- [ ] **Step 8.1: Tests que fallan**

```python
# backend/api/tests/test_owner_validations.py
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import MenuItem, RestaurantTable
from api.tests.test_admin_restaurants import make_restaurant


def owner_client(restaurant):
    user = User.objects.create_user(username="own2@test.com", email="own2@test.com")
    restaurant.owner = user
    restaurant.save(update_fields=["owner"])
    refresh = RefreshToken.for_user(user)
    refresh['staff_role'] = 'owner'
    refresh['email'] = user.email
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


class OwnerValidationTests(TestCase):
    def setUp(self):
        self.rest = make_restaurant()
        self.client = owner_client(self.rest)

    def test_menu_item_rejects_empty_name(self):
        res = self.client.post("/api/owner/menu-items/", {"name": " ", "price": 10}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_menu_item_rejects_nonpositive_price(self):
        res = self.client.post("/api/owner/menu-items/", {"name": "Plato", "price": 0}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_menu_item_rejects_invalid_price(self):
        res = self.client.post("/api/owner/menu-items/", {"name": "Plato", "price": "abc"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_table_rejects_nonpositive_capacity(self):
        res = self.client.post("/api/owner/tables/", {"label": "M1", "capacity": 0}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_table_rejects_negative_supplement(self):
        res = self.client.post("/api/owner/tables/", {"label": "M1", "capacity": 2, "supplement": -5}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_table_rejects_empty_label(self):
        res = self.client.post("/api/owner/tables/", {"label": "", "capacity": 2}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_profile_rejects_empty_name(self):
        res = self.client.patch("/api/owner/profile/", {"name": "  "}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_valid_menu_item_still_works(self):
        res = self.client.post("/api/owner/menu-items/", {"name": "Plato", "price": 12.5}, format="json")
        self.assertEqual(res.status_code, 201)
```

- [ ] **Step 8.2:** Run. Expected: FAIL (crea con datos inválidos, 201/200).
- [ ] **Step 8.3: Implementación** — en `views_owner.py` añadir helpers tras `_owner_restaurant`:

```python
def _validate_menu_payload(data, partial=False):
    if "name" in data or not partial:
        if not str(data.get("name", "")).strip():
            return "El nombre es obligatorio"
    if "price" in data or not partial:
        try:
            price = float(data.get("price", 0))
        except (TypeError, ValueError):
            return "Precio no válido"
        if price <= 0:
            return "El precio debe ser mayor que 0"
    return None


def _validate_table_payload(data, partial=False):
    if "label" in data or not partial:
        if not str(data.get("label", "")).strip():
            return "La etiqueta es obligatoria"
    if "capacity" in data or not partial:
        try:
            capacity = int(data.get("capacity", 0))
        except (TypeError, ValueError):
            return "Capacidad no válida"
        if capacity <= 0:
            return "La capacidad debe ser mayor que 0"
    if "supplement" in data:
        try:
            if int(data["supplement"]) < 0:
                return "El suplemento no puede ser negativo"
        except (TypeError, ValueError):
            return "Suplemento no válido"
    return None
```

Aplicar:
- `owner_menu_items` POST: antes de `MenuItem.objects.create`, `err = _validate_menu_payload(request.data)` → si err, `return Response({"error": err}, status=status.HTTP_400_BAD_REQUEST)`.
- `owner_menu_item_detail` PATCH: `err = _validate_menu_payload(request.data, partial=True)` igual.
- `owner_tables` POST y `owner_table_detail` PATCH: análogo con `_validate_table_payload`.
- `owner_profile` PATCH: al inicio del bloque PATCH:

```python
    if "name" in data and not str(data["name"]).strip():
        return Response({"error": "El nombre no puede estar vacío"},
                        status=status.HTTP_400_BAD_REQUEST)
```

- **Reservas (`guests > 0`):** comprobar primero si ya existe validación en el serializer de creación (`backend/api/serializers.py`, clase del POST `/api/reservations/`). Si no existe, añadir al serializer:

```python
    def validate_guests(self, value):
        if value <= 0:
            raise serializers.ValidationError("El número de comensales debe ser mayor que 0")
        return value
```

  Y test en `test_owner_validations.py` (cliente autenticado normal): POST `/api/reservations/` con `guests: 0` → 400.

- [ ] **Step 8.4:** Run tests (8/8 PASS) + suite completa `python manage.py test api`.
- [ ] **Step 8.5:** Commit: `git commit -m "fix: validaciones de menu, mesas y perfil en endpoints owner"`

---

## Task 9: API frontend admin ampliada

**Files:**
- Modify: `frontend/src/api/admin.ts`
- Test: `frontend/tests/unit/adminApi.test.ts` (create)

- [ ] **Step 9.1: Test que falla** (sigue el patrón de mocks de `frontend/tests/` existentes — mockear `staffApi` de `../src/api/client`):

```typescript
// frontend/tests/unit/adminApi.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/api/client', () => ({
  staffApi: { get: vi.fn().mockResolvedValue({}), post: vi.fn().mockResolvedValue({}),
              patch: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}) },
}));

import { adminApi } from '../../src/api/admin';
import { staffApi } from '../../src/api/client';

describe('adminApi', () => {
  it('lista usuarios con búsqueda y página', async () => {
    await adminApi.users(2, 'ana');
    expect(staffApi.get).toHaveBeenCalledWith('/admin/users/?page=2&search=ana');
  });
  it('desactiva usuario', async () => {
    await adminApi.updateUser(7, false);
    expect(staffApi.patch).toHaveBeenCalledWith('/admin/users/7/', { is_active: false });
  });
  it('borra reseña', async () => {
    await adminApi.deleteReview(3);
    expect(staffApi.delete).toHaveBeenCalledWith('/admin/reviews/3/');
  });
});
```

- [ ] **Step 9.2:** Run `npx vitest run tests/unit/adminApi.test.ts`. Expected: FAIL (users is not a function).
- [ ] **Step 9.3: Implementación** — añadir a `admin.ts` (mantener lo existente):

```typescript
export interface AdminUser {
  id: number; email: string; name: string;
  isActive: boolean; dateJoined: string; reservations: number;
}
export interface AdminRestaurant {
  id: number; name: string; cuisine: string; location: string;
  rating: number; ownerEmail: string | null;
}
export interface AdminReview {
  id: number; rating: number; comment: string;
  userEmail: string; restaurantName: string; createdAt: string;
}
export interface AdminStaffCode {
  id: number; code: string; role: 'owner' | 'admin'; email: string;
  isActive: boolean; restaurantName: string | null; createdAt: string;
}
export interface AdminAuditEntry {
  id: number; adminEmail: string; action: string; targetType: string;
  targetId: string; detail: string; createdAt: string;
}
const q = (page: number, search?: string) =>
  `?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

// añadir dentro de adminApi:
  users: (page = 1, search?: string) =>
    staffApi.get<{ users: AdminUser[]; total: number; page: number; total_pages: number }>(`/admin/users/${q(page, search)}`),
  updateUser: (id: number, isActive: boolean) =>
    staffApi.patch<{ id: number; isActive: boolean }>(`/admin/users/${id}/`, { is_active: isActive }),
  restaurants: (page = 1, search?: string) =>
    staffApi.get<{ restaurants: AdminRestaurant[]; total: number; page: number; total_pages: number }>(`/admin/restaurants/${q(page, search)}`),
  createRestaurant: (data: { name: string; cuisine?: string; location?: string; address?: string }) =>
    staffApi.post<{ id: number; name: string }>('/admin/restaurants/', data),
  updateRestaurant: (id: number, data: Partial<{ name: string; cuisine: string; location: string; owner_email: string }>) =>
    staffApi.patch<{ id: number; name: string; ownerEmail: string | null }>(`/admin/restaurants/${id}/`, data),
  deleteRestaurant: (id: number) => staffApi.delete<void>(`/admin/restaurants/${id}/`),
  reviews: (page = 1, search?: string) =>
    staffApi.get<{ reviews: AdminReview[]; total: number; page: number; total_pages: number }>(`/admin/reviews/${q(page, search)}`),
  deleteReview: (id: number) => staffApi.delete<void>(`/admin/reviews/${id}/`),
  staffCodes: (page = 1) =>
    staffApi.get<{ codes: AdminStaffCode[]; total: number; page: number; total_pages: number }>(`/admin/staff-codes/${q(page)}`),
  createStaffCode: (data: { code: string; role: 'owner' | 'admin'; email?: string; restaurant_id?: number }) =>
    staffApi.post<{ id: number; code: string; role: string }>('/admin/staff-codes/', data),
  updateStaffCode: (id: number, isActive: boolean) =>
    staffApi.patch<{ id: number; isActive: boolean }>(`/admin/staff-codes/${id}/`, { is_active: isActive }),
  auditLog: (page = 1) =>
    staffApi.get<{ entries: AdminAuditEntry[]; total: number; page: number; total_pages: number }>(`/admin/audit-log/${q(page)}`),
```

Nota: verificar que `staffApi` en `client.ts` expone `patch` y `delete`; si no, añadirlos siguiendo el patrón de `get`/`post` existente.

- [ ] **Step 9.4:** Run test. Expected: PASS.
- [ ] **Step 9.5:** Commit: `git commit -m "feat: cliente API admin para usuarios, restaurantes, resenas, staff y auditoria"`

---

## Task 10: Tabs nuevos en AdminDashboard

**Files:**
- Create: `frontend/src/components/admin/AdminTable.tsx` (tabla genérica con búsqueda/paginación/error)
- Create: `frontend/src/components/admin/UsersTab.tsx`, `RestaurantsTab.tsx`, `ReviewsTab.tsx`, `StaffCodesTab.tsx`, `AuditTab.tsx`
- Modify: `frontend/src/pages/AdminDashboard.tsx` (registrar tabs)
- Modify: `frontend/src/i18n/es.json`, `frontend/src/i18n/en.json`

- [ ] **Step 10.1: Infraestructura compartida** — `AdminTable.tsx`:

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  headers: string[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  searchValue?: string;
  onSearch?: (v: string) => void;
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  children: React.ReactNode; // <tr> rows
}

const AdminTable: React.FC<Props> = ({
  headers, loading, error, onRetry, searchValue, onSearch, page, totalPages, onPage, children,
}) => {
  const { t } = useTranslation();
  return (
    <div className="admin-table-card">
      {onSearch && (
        <input
          className="admin-search-input"
          placeholder={t('admin.searchPlaceholder')}
          value={searchValue}
          onChange={e => onSearch(e.target.value)}
        />
      )}
      {error ? (
        <div className="admin-error">
          <p>{error}</p>
          <button onClick={onRetry} className="admin-button-action">{t('admin.retry')}</button>
        </div>
      ) : (
        <table className="admin-table">
          <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {loading
              ? <tr className="admin-loading-row"><td colSpan={headers.length}>{t('admin.loading')}</td></tr>
              : children}
          </tbody>
        </table>
      )}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => onPage(page + 1)}>›</button>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
```

Añadir a `AdminDashboard.css` (estilos mínimos consistentes con clases existentes):

```css
.admin-search-input { width: 100%; max-width: 320px; margin-bottom: 12px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-3); color: var(--ink); }
.admin-error { padding: 24px; text-align: center; color: var(--ink); }
.admin-pagination { display: flex; gap: 12px; justify-content: center; padding: 12px; align-items: center; }
.admin-pagination button { padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface-3); color: var(--ink); cursor: pointer; }
.admin-pagination button:disabled { opacity: 0.4; cursor: default; }
```

- [ ] **Step 10.2: UsersTab** — `UsersTab.tsx`:

```tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi, type AdminUser } from '../../api/admin';
import AdminTable from './AdminTable';

const UsersTab: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi.users(page, search || undefined)
      .then(res => { setUsers(res.users); setTotalPages(res.total_pages); })
      .catch(() => setError(t('admin.loadError')))
      .finally(() => setLoading(false));
  }, [page, search, t]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (u: AdminUser) => {
    try {
      const res = await adminApi.updateUser(u.id, !u.isActive);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: res.isActive } : x));
    } catch {
      setError(t('admin.actionError'));
    }
  };

  return (
    <AdminTable
      headers={[t('admin.users.email'), t('admin.users.name'), t('admin.users.joined'), t('admin.users.bookings'), t('admin.users.status'), t('admin.table.actions')]}
      loading={loading} error={error} onRetry={load}
      searchValue={search} onSearch={v => { setSearch(v); setPage(1); }}
      page={page} totalPages={totalPages} onPage={setPage}
    >
      {users.map(u => (
        <tr key={u.id}>
          <td>{u.email}</td>
          <td className="is-muted">{u.name || '—'}</td>
          <td className="is-muted">{u.dateJoined}</td>
          <td className="is-bold">{u.reservations}</td>
          <td>{u.isActive ? t('admin.users.active') : t('admin.users.inactive')}</td>
          <td>
            <button className="admin-button-action" onClick={() => toggleActive(u)}>
              {u.isActive ? t('admin.users.deactivate') : t('admin.users.activate')}
            </button>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
};

export default UsersTab;
```

- [ ] **Step 10.3: RestaurantsTab** — mismo patrón que UsersTab con `adminApi.restaurants`. Columnas: nombre, cocina, ciudad, rating, owner, acciones. Acciones: asignar owner (input email + botón que llama `adminApi.updateRestaurant(id, { owner_email })`), borrar con `window.confirm(t('admin.restaurants.deleteConfirm', { name: r.name }))` antes de `adminApi.deleteRestaurant(id)` y recargar. Formulario superior plegable para crear: inputs name/cuisine/location/address → `adminApi.createRestaurant(...)` → recargar. Errores con `setError`, nunca catch vacío.
- [ ] **Step 10.4: ReviewsTab** — patrón UsersTab con `adminApi.reviews`. Columnas: restaurante, usuario, rating (★), comentario (truncado a 80 chars), fecha, acciones. Acción: borrar con `window.confirm` → `adminApi.deleteReview(id)` → quitar de la lista local.
- [ ] **Step 10.5: StaffCodesTab** — lista `adminApi.staffCodes`. Columnas: código, rol, email, restaurante, estado, creado, acciones. Acción revocar/activar → `adminApi.updateStaffCode(id, !isActive)`. Formulario crear: code (requerido), role (select owner/admin), email, restaurant_id opcional → `adminApi.createStaffCode` → recargar; mostrar el `error` del backend si responde 400.
- [ ] **Step 10.6: AuditTab** — solo lectura, `adminApi.auditLog(page)`. Columnas: fecha (toLocaleString), admin, acción, objetivo (`targetType#targetId`), detalle. Sin búsqueda.
- [ ] **Step 10.7: Registrar tabs** — en `AdminDashboard.tsx`:
  - Tipo: `useState<'overview' | 'restaurants' | 'users' | 'manage' | 'reviews' | 'staff' | 'audit'>('overview')` (el tab existente de top restaurantes mantiene id `restaurants`; el de gestión usa `manage`).
  - Array de tabs:

```tsx
([['overview', t('admin.tabs.overview'), 'analytics'],
  ['restaurants', t('admin.tabs.topRestaurants'), 'workspace_premium'],
  ['users', t('admin.tabs.users'), 'group'],
  ['manage', t('admin.tabs.restaurants'), 'storefront'],
  ['reviews', t('admin.tabs.reviews'), 'reviews'],
  ['staff', t('admin.tabs.staff'), 'badge'],
  ['audit', t('admin.tabs.audit'), 'history']] as const)
```

  - Render: `{activeTab === 'users' && <UsersTab />}` etc. (imports `lazy` no necesarios; importar directo).
  - Sustituir el `.catch(() => {})` del `useEffect` por `.catch(() => setError(t('admin.loadError')))` con estado `error` y banner con botón reintentar (reutilizar patrón de AdminTable).
- [ ] **Step 10.8: i18n** — añadir a `es.json` bajo `admin`:

```json
"searchPlaceholder": "Buscar…",
"retry": "Reintentar",
"loadError": "No se pudieron cargar los datos",
"actionError": "La acción ha fallado, inténtalo de nuevo",
"tabs": { "users": "Usuarios", "restaurants": "Restaurantes", "reviews": "Reseñas", "staff": "Códigos staff", "audit": "Auditoría" },
"users": { "email": "Email", "name": "Nombre", "joined": "Alta", "bookings": "Reservas", "status": "Estado", "active": "Activo", "inactive": "Inactivo", "activate": "Activar", "deactivate": "Desactivar" },
"restaurants": { "create": "Crear restaurante", "assignOwner": "Asignar owner", "deleteConfirm": "¿Eliminar {{name}}? Se borrarán sus reservas, reseñas y mesas." },
"reviews": { "restaurant": "Restaurante", "user": "Usuario", "comment": "Comentario", "delete": "Eliminar" },
"staff": { "code": "Código", "role": "Rol", "restaurant": "Restaurante", "created": "Creado", "revoke": "Revocar", "activate": "Activar", "newCode": "Nuevo código" },
"audit": { "date": "Fecha", "admin": "Admin", "action": "Acción", "target": "Objetivo", "detail": "Detalle" }
```

(merge con las claves `admin.tabs.*` existentes, no sobrescribir `overview`/`topRestaurants`). Equivalentes en `en.json` en inglés.

- [ ] **Step 10.9: Verificar en navegador** — arrancar backend (`python manage.py runserver`) y frontend (`npm run dev`), entrar en `/staff` con código admin, recorrer los 7 tabs: listar, buscar, desactivar usuario, crear/borrar restaurante de prueba, borrar reseña, crear/revocar código, ver auditoría con las acciones recién hechas.
- [ ] **Step 10.10:** `npm run lint && npx vitest run`. Expected: verde.
- [ ] **Step 10.11:** Commit: `git add frontend/src && git commit -m "feat: panel admin completo con usuarios, restaurantes, resenas, staff y auditoria"`

---

## Task 11: Tab Menú en OwnerDashboard

**Files:**
- Create: `frontend/src/components/owner/MenuTab.tsx`
- Modify: `frontend/src/pages/OwnerDashboard.tsx`, i18n

- [ ] **Step 11.1: Componente** — `MenuTab.tsx`:

```tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ownerApi, type OwnerMenuItem } from '../../api/owner';

const empty = { name: '', description: '', price: '' };

const MenuTab: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<OwnerMenuItem[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    ownerApi.getMenuItems()
      .then(setItems)
      .catch(() => setError(t('owner.menu.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.name.trim() || !(price > 0)) {
      setError(t('owner.menu.validationError'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const updated = await ownerApi.updateMenuItem(editingId, { ...form, price });
        setItems(prev => prev.map(i => i.id === editingId ? updated : i));
      } else {
        const created = await ownerApi.createMenuItem({ ...form, price });
        setItems(prev => [...prev, created]);
      }
      setForm(empty);
      setEditingId(null);
    } catch {
      setError(t('owner.menu.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm(t('owner.menu.deleteConfirm'))) return;
    try {
      await ownerApi.deleteMenuItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      setError(t('owner.menu.saveError'));
    }
  };

  return (
    <div className="owner-menu-tab">
      <form onSubmit={submit} className="owner-menu-form">
        <input value={form.name} placeholder={t('owner.menu.name')}
               onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input value={form.description} placeholder={t('owner.menu.description')}
               onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <input value={form.price} type="number" step="0.01" min="0.01" placeholder="€"
               onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
        <button type="submit" disabled={saving}>
          {editingId ? t('owner.menu.save') : t('owner.menu.add')}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm(empty); }}>
            {t('common.cancel')}
          </button>
        )}
      </form>
      {error && <div className="owner-error">{error} <button onClick={load}>{t('admin.retry')}</button></div>}
      {loading ? <p>{t('admin.loading')}</p> : (
        <ul className="owner-menu-list">
          {items.map(i => (
            <li key={i.id}>
              <span className="is-bold">{i.name}</span>
              <span className="is-muted">{i.description}</span>
              <span>{i.price.toFixed(2)}€</span>
              <button onClick={() => { setEditingId(i.id); setForm({ name: i.name, description: i.description, price: String(i.price) }); }}>
                {t('owner.menu.edit')}
              </button>
              <button onClick={() => remove(i.id)}>{t('owner.menu.delete')}</button>
            </li>
          ))}
          {items.length === 0 && <li className="is-muted">{t('owner.menu.empty')}</li>}
        </ul>
      )}
    </div>
  );
};

export default MenuTab;
```

Ajustar nombres de método/tipo a los reales de `frontend/src/api/owner.ts` (existen `getMenuItems/createMenuItem/updateMenuItem/deleteMenuItem` y tipo `OwnerMenuItem` según la rama actual — verificar firma exacta antes de usar).

- [ ] **Step 11.2:** Registrar tab `menu` en `OwnerDashboard.tsx` junto a los existentes (`activeTab === 'menu' && <MenuTab />`) con icono `restaurant_menu` y label `t('owner.tabs.menu')`.
- [ ] **Step 11.3: i18n** — claves `owner.tabs.menu` ("Menú"/"Menu") y bloque `owner.menu.*`: name, description, add, save, edit, delete, empty, deleteConfirm, loadError, saveError, validationError (ES/EN). Añadir `common.cancel` si no existe.
- [ ] **Step 11.4:** Estilos mínimos en el CSS del OwnerDashboard siguiendo clases existentes (`owner-menu-form` flex con gap, `owner-menu-list` filas con borde inferior).
- [ ] **Step 11.5: Verificar en navegador** como owner: crear, editar, borrar plato; probar precio 0 (error visible).
- [ ] **Step 11.6:** Commit: `git commit -m "feat: gestion de menu desde panel owner"`

---

## Task 12: Tab Mesas en OwnerDashboard

**Files:**
- Create: `frontend/src/components/owner/TablesTab.tsx`
- Modify: `frontend/src/pages/OwnerDashboard.tsx`, i18n

- [ ] **Step 12.1: Componente** — mismo patrón exacto que `MenuTab` con `ownerApi.getTables/createTable/updateTable/deleteTable` y tipo `OwnerTableData`. Formulario: label (text), zone (text, default "main"), capacity (number min 1), supplement (number min 0), is_active (checkbox). Validación cliente: label no vacío, capacity ≥ 1, supplement ≥ 0. Lista con columnas label/zone/capacity/supplement/estado y botones editar/borrar (confirm). Errores visibles + retry, nunca catch silencioso.
- [ ] **Step 12.2:** Registrar tab `tables` con icono `table_restaurant` y label `t('owner.tabs.tables')`. Nota: existe ya el tab `floor` (visualización) — mantenerlo; este tab es el CRUD.
- [ ] **Step 12.3: i18n** — `owner.tabs.tables` ("Mesas"/"Tables") y bloque `owner.tables.*`: label, zone, capacity, supplement, active, add, save, edit, delete, empty, deleteConfirm, loadError, saveError, validationError (ES/EN).
- [ ] **Step 12.4: Verificar en navegador**: crear mesa, verla en tab floor, editar capacidad, borrar. Probar capacity 0 (error visible).
- [ ] **Step 12.5:** Commit: `git commit -m "feat: gestion de mesas desde panel owner"`

---

## Task 13: Error handling restante + notificaciones con refetch

**Files:**
- Modify: `frontend/src/pages/OwnerDashboard.tsx` (catches silenciosos)
- Modify: `frontend/src/components/NotificationsMenu.tsx`
- Modify: i18n si faltan claves

- [ ] **Step 13.1:** Buscar catches silenciosos: `grep -rn "catch(() => {})\|catch(() =>" frontend/src --include=*.tsx`. En `OwnerDashboard.tsx` (stats y profile) sustituir por estado `error` + banner con texto i18n y botón reintentar (mismo patrón Task 10/11). En AdminDashboard ya se hizo en Task 10.7.
- [ ] **Step 13.2: Notificaciones** — en `NotificationsMenu.tsx`, localizar el fetch inicial de notificaciones/unread-count y envolverlo en un `useEffect` con polling + focus:

```tsx
useEffect(() => {
  const refresh = () => { void loadNotifications(); };
  refresh();
  const interval = setInterval(refresh, 60_000);
  window.addEventListener('focus', refresh);
  return () => {
    clearInterval(interval);
    window.removeEventListener('focus', refresh);
  };
}, [loadNotifications]);
```

(`loadNotifications` = la función de carga existente, memoizada con `useCallback` si no lo está; solo cuando hay usuario autenticado).

- [ ] **Step 13.3:** Verificar en navegador: crear reserva en una pestaña, volver a otra pestaña → al recuperar foco aparece la notificación sin recargar.
- [ ] **Step 13.4:** `npm run lint && npx vitest run`. Expected: verde.
- [ ] **Step 13.5:** Commit: `git commit -m "fix: errores visibles en dashboards y refresco de notificaciones al foco"`

---

## Task 14: Tests frontend de dashboards

**Files:**
- Create: `frontend/tests/flow/AdminDashboard.test.tsx`
- Create: `frontend/tests/flow/OwnerMenuTab.test.tsx`

- [ ] **Step 14.1: AdminDashboard test** — seguir el patrón de mocks de `frontend/tests/flow/Home.test.tsx` (i18next/framer-motion ya mockeados en `tests/setup.ts`):

```tsx
// frontend/tests/flow/AdminDashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockApi = {
  stats: vi.fn().mockResolvedValue({
    totalRestaurants: 3, totalUsers: 10, totalReservations: 25,
    confirmedReservations: 20, cancelledReservations: 5,
    cancellationRate: 20, totalGuests: 60, estimatedRevenue: 2100,
  }),
  topRestaurants: vi.fn().mockResolvedValue({ restaurants: [] }),
  cityDistribution: vi.fn().mockResolvedValue({ cities: [] }),
  users: vi.fn().mockResolvedValue({
    users: [{ id: 1, email: 'a@b.com', name: 'Ana', isActive: true, dateJoined: '2026-01-01', reservations: 2 }],
    total: 1, page: 1, total_pages: 1,
  }),
  updateUser: vi.fn().mockResolvedValue({ id: 1, isActive: false }),
};
vi.mock('../../src/api/admin', () => ({ adminApi: mockApi }));
vi.mock('../../src/api/storage', () => ({
  STORAGE_KEYS: { STAFF_ROLE: 'staff_role', STAFF_TOKEN: 'staff_token' },
  storage: { get: vi.fn((k: string) => (k === 'staff_role' ? 'admin' : 'tok')), set: vi.fn(), remove: vi.fn() },
}));

import AdminDashboard from '../../src/pages/AdminDashboard';

describe('AdminDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra KPIs tras cargar', async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(mockApi.stats).toHaveBeenCalled());
  });

  it('tab usuarios lista y desactiva', async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(await screen.findByText('admin.tabs.users'));
    expect(await screen.findByText('a@b.com')).toBeInTheDocument();
    fireEvent.click(screen.getByText('admin.users.deactivate'));
    await waitFor(() => expect(mockApi.updateUser).toHaveBeenCalledWith(1, false));
  });

  it('muestra error con retry si la API falla', async () => {
    mockApi.users.mockRejectedValueOnce(new Error('boom'));
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(await screen.findByText('admin.tabs.users'));
    expect(await screen.findByText('admin.loadError')).toBeInTheDocument();
  });
});
```

Ajustar asserts de textos i18n al comportamiento real del mock de i18next en `tests/setup.ts` (si devuelve la clave tal cual, los asserts de arriba valen; si devuelve traducciones, usar los textos ES).

- [ ] **Step 14.2:** Run: `npx vitest run tests/flow/AdminDashboard.test.tsx`. Iterar hasta PASS.
- [ ] **Step 14.3: OwnerMenuTab test** — mockear `ownerApi` (`getMenuItems` → 1 item, `createMenuItem`, `deleteMenuItem`); render `<MenuTab />`; asserts: lista el item, submit con nombre+precio llama `createMenuItem`, precio vacío muestra `owner.menu.validationError`, borrar con `window.confirm` mockeado a `true` llama `deleteMenuItem`.
- [ ] **Step 14.4:** Run suite completa frontend y backend. Expected: todo verde.
- [ ] **Step 14.5:** Commit: `git commit -m "test: cobertura de AdminDashboard y tab de menu owner"`

---

## Task 15: Cierre

- [ ] **Step 15.1:** Suites completas: `python manage.py test api` y `npx vitest run` + `npm run lint` + `npm run build`. Expected: todo verde.
- [ ] **Step 15.2:** Verificación manual final en navegador (flujo customer intacto: buscar → reservar → cancelar; owner: menú/mesas; admin: 7 tabs).
- [ ] **Step 15.3:** Documentar según convención del repo: `docs/backend/2026-06-XX-admin-completo.md` y `docs/frontend/2026-06-XX-owner-menu-mesas.md` (Problema/Solución/Qué se hizo/Cómo/Riesgos/Notas).
- [ ] **Step 15.4:** Commit docs. NO merge a `main` — preguntar al usuario.
