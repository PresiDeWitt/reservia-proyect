from rest_framework import status
from rest_framework.test import APITestCase

from tests.factories import create_restaurant, create_user


class SmokeSystemTests(APITestCase):
    def setUp(self):
        self.restaurant = create_restaurant()

    def test_public_endpoints_are_reachable(self):
        list_response = self.client.get('/api/restaurants/')
        cuisines_response = self.client.get('/api/restaurants/cuisines/')
        detail_response = self.client.get(f'/api/restaurants/{self.restaurant.id}/')

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(cuisines_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

    def test_protected_endpoints_reject_anonymous(self):
        my_reservations = self.client.get('/api/reservations/my/')
        create_reservation = self.client.post(
            '/api/reservations/',
            {
                'restaurantId': self.restaurant.id,
                'date': '2026-10-20',
                'time': '20:00:00',
                'guests': 2,
            },
            format='json',
        )

        self.assertEqual(my_reservations.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(create_reservation.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_auth_register_then_login_smoke(self):
        register = self.client.post(
            '/api/auth/register/',
            {
                'first_name': 'Smoke',
                'last_name': 'Test',
                'email': 'smoke@example.com',
                'password': 'secret123',
            },
            format='json',
        )
        self.assertEqual(register.status_code, status.HTTP_201_CREATED)

        login = self.client.post(
            '/api/auth/login/',
            {'email': 'smoke@example.com', 'password': 'secret123'},
            format='json',
        )

        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn('token', login.data)

    def test_authenticated_user_can_create_and_read_own_reservation_smoke(self):
        user = create_user(email='smoke-reservation@example.com')
        self.client.force_authenticate(user=user)

        create = self.client.post(
            '/api/reservations/',
            {
                'restaurantId': self.restaurant.id,
                'date': '2026-10-21',
                'time': '21:00:00',
                'guests': 3,
            },
            format='json',
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)

        my_reservations = self.client.get('/api/reservations/my/')
        self.assertEqual(my_reservations.status_code, status.HTTP_200_OK)
        self.assertEqual(len(my_reservations.data), 1)
