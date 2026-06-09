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
        # Sin credenciales DRF devuelve 401 (NotAuthenticated), igual que en test_admin_api
        res = APIClient().get("/api/admin/users/")
        self.assertEqual(res.status_code, 401)
