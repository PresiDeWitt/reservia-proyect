from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Reservation
from tests.factories import create_reservation, create_restaurant, create_user


class ReservationApiTests(APITestCase):
    def setUp(self):
        self.user = create_user(email='cliente@example.com', first_name='Cliente')
        self.other_user = create_user(email='otro@example.com', first_name='Otro')
        self.restaurant = create_restaurant()

    def _payload(self, guests=2):
        return {
            'restaurantId': self.restaurant.id,
            'date': (date.today() + timedelta(days=1)).isoformat(),
            'time': '20:30:00',
            'guests': guests,
        }

    def test_create_reservation_requires_authentication(self):
        response = self.client.post('/api/reservations/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_reservation_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/reservations/', self._payload(guests=4), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reservation.objects.count(), 1)
        reservation = Reservation.objects.get()
        self.assertEqual(reservation.user, self.user)
        self.assertEqual(reservation.restaurant, self.restaurant)
        self.assertEqual(reservation.guests, 4)

    def test_create_reservation_rejects_guest_limits(self):
        self.client.force_authenticate(user=self.user)

        too_low = self.client.post('/api/reservations/', self._payload(guests=0), format='json')
        too_high = self.client.post('/api/reservations/', self._payload(guests=21), format='json')

        self.assertEqual(too_low.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(too_high.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('guests', too_low.data)
        self.assertIn('guests', too_high.data)

    def test_my_reservations_requires_authentication(self):
        response = self.client.get('/api/reservations/my/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_my_reservations_only_returns_current_user(self):
        create_reservation(self.user, self.restaurant, guests=2)
        create_reservation(self.other_user, self.restaurant, guests=5)

        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/reservations/my/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['guests'], 2)

    def test_cancel_reservation_marks_status_cancelled(self):
        reservation = create_reservation(self.user, self.restaurant, guests=3)

        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/reservations/{reservation.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, 'cancelled')

    def test_cancel_reservation_of_other_user_returns_404(self):
        reservation = create_reservation(self.other_user, self.restaurant, guests=3)

        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/reservations/{reservation.id}/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cancel_reservation_not_found_returns_404(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete('/api/reservations/999999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
