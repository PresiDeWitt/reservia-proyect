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


class AdminStaffCodeInputValidationTests(TestCase):
    def setUp(self):
        self.client = admin_client()
        self.code = StaffCode.objects.create(code="VAL-1", role="owner")

    def test_create_with_invalid_restaurant_id_returns_400(self):
        res = self.client.post("/api/admin/staff-codes/", {
            "code": "VAL-2", "role": "owner", "restaurant_id": "abc",
        }, format="json")
        self.assertEqual(res.status_code, 400)

    def test_revoke_with_form_encoded_false_string(self):
        res = self.client.patch(
            f"/api/admin/staff-codes/{self.code.id}/",
            data="is_active=false",
            content_type="application/x-www-form-urlencoded",
        )
        self.assertEqual(res.status_code, 200)
        self.code.refresh_from_db()
        self.assertFalse(self.code.is_active)
