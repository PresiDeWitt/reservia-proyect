from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
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
