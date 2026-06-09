from django.test import TestCase
from api.models import AdminAuditLog
from api.tests.test_admin_users import admin_client
from api.tests.test_admin_restaurants import make_restaurant


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
