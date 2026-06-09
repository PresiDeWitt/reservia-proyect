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
