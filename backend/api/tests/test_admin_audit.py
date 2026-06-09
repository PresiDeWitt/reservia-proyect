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
