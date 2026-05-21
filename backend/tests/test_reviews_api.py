from datetime import date, time, timedelta

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from api.models import Review
from tests.factories import create_reservation, create_restaurant, create_user

YESTERDAY = date.today() - timedelta(days=1)
RES_TIME = time(20, 30)


def auth_header(user):
    token = RefreshToken.for_user(user).access_token
    return {'HTTP_AUTHORIZATION': f'Bearer {token}'}


class ReviewListTests(APITestCase):
    def setUp(self):
        self.restaurant = create_restaurant()
        self.user = create_user(email='visitor@example.com')

    def _url(self):
        return f'/api/restaurants/{self.restaurant.id}/reviews/'

    def test_list_reviews_anonymous(self):
        Review.objects.create(user=self.user, restaurant=self.restaurant, rating=5, comment='Great!')
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['reviews']), 1)
        self.assertFalse(response.data['can_review'])
        self.assertFalse(response.data['has_reviewed'])

    def test_can_review_false_without_past_reservation(self):
        response = self.client.get(self._url(), **auth_header(self.user))
        self.assertFalse(response.data['can_review'])

    def test_can_review_true_with_past_reservation(self):
        create_reservation(self.user, self.restaurant, date=YESTERDAY, time=RES_TIME, status='confirmed')
        response = self.client.get(self._url(), **auth_header(self.user))
        self.assertTrue(response.data['can_review'])

    def test_has_reviewed_after_posting(self):
        Review.objects.create(user=self.user, restaurant=self.restaurant, rating=4, comment='Good')
        response = self.client.get(self._url(), **auth_header(self.user))
        self.assertTrue(response.data['has_reviewed'])
        self.assertFalse(response.data['can_review'])


class ReviewCreateTests(APITestCase):
    def setUp(self):
        self.restaurant = create_restaurant()
        self.user = create_user(email='diner@example.com', first_name='Ana', last_name='Ruiz')

    def _url(self):
        return f'/api/restaurants/{self.restaurant.id}/reviews/'

    def _payload(self, rating=5, comment='Excelente'):
        return {'rating': rating, 'comment': comment}

    def test_create_requires_auth(self):
        response = self.client.post(self._url(), self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_requires_past_reservation(self):
        response = self.client.post(self._url(), self._payload(), format='json', **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_success(self):
        create_reservation(self.user, self.restaurant, date=YESTERDAY, time=RES_TIME, status='confirmed')
        response = self.client.post(self._url(), self._payload(), format='json', **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['rating'], 5)
        self.assertEqual(response.data['userName'], 'Ana Ruiz')

    def test_create_updates_restaurant_rating(self):
        create_reservation(self.user, self.restaurant, date=YESTERDAY, time=RES_TIME, status='confirmed')
        self.client.post(self._url(), {'rating': 3, 'comment': ''}, format='json', **auth_header(self.user))
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.rating, 3.0)
        self.assertEqual(self.restaurant.reviews_count, 1)

    def test_cannot_review_twice(self):
        create_reservation(self.user, self.restaurant, date=YESTERDAY, time=RES_TIME, status='confirmed')
        self.client.post(self._url(), self._payload(), format='json', **auth_header(self.user))
        response = self.client.post(self._url(), self._payload(rating=1), format='json', **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_rating_rejected(self):
        create_reservation(self.user, self.restaurant, date=YESTERDAY, time=RES_TIME, status='confirmed')
        response = self.client.post(self._url(), {'rating': 6, 'comment': 'bad'}, format='json', **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
