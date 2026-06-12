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
