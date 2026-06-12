from datetime import date, time

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .factories import create_reservation, create_restaurant, create_table, create_user


class OwnerReservationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = create_user(email='owner@example.com')
        self.customer = create_user(email='customer@example.com', first_name='Ana', last_name='Lopez')
        self.restaurant = create_restaurant(owner=self.owner)
        self.table = create_table(self.restaurant, label='T4')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self._owner_token(self.owner.email)}')

    def _owner_token(self, email):
        staff_user = create_user(email=f'staff-{email}', first_name='Staff', last_name='Owner')
        refresh = RefreshToken.for_user(staff_user)
        refresh['staff_role'] = 'owner'
        refresh['email'] = email
        return str(refresh.access_token)

    def test_owner_reservations_include_note_and_occasion(self):
        reservation = create_reservation(
            self.customer,
            self.restaurant,
            assigned_table=self.table,
            date=date(2026, 6, 1),
            time=time(21, 0),
            occasion='birthday',
            note='Alergia a frutos secos',
        )

        response = self.client.get('/api/owner/reservations/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data['reservations'][0]
        self.assertEqual(payload['id'], reservation.id)
        self.assertEqual(payload['name'], 'Ana Lopez')
        self.assertEqual(payload['table'], 'T4')
        self.assertEqual(payload['occasion'], 'birthday')
        self.assertEqual(payload['note'], 'Alergia a frutos secos')

    def test_owner_can_mark_reservation_arrived_and_no_show(self):
        reservation = create_reservation(self.customer, self.restaurant)

        arrived = self.client.patch(
            f'/api/owner/reservations/{reservation.id}/status/',
            {'status': 'arrived'},
            format='json',
        )
        reservation.refresh_from_db()

        self.assertEqual(arrived.status_code, status.HTTP_200_OK)
        self.assertEqual(arrived.data['status'], 'arrived')
        self.assertEqual(reservation.status, 'arrived')

        no_show = self.client.patch(
            f'/api/owner/reservations/{reservation.id}/status/',
            {'status': 'no_show'},
            format='json',
        )
        reservation.refresh_from_db()

        self.assertEqual(no_show.status_code, status.HTTP_200_OK)
        self.assertEqual(no_show.data['status'], 'no_show')
        self.assertEqual(reservation.status, 'no_show')

    def test_owner_cannot_use_unknown_status(self):
        reservation = create_reservation(self.customer, self.restaurant)

        response = self.client.patch(
            f'/api/owner/reservations/{reservation.id}/status/',
            {'status': 'seated_elsewhere'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_owner_cannot_update_another_restaurants_reservation(self):
        other_restaurant = create_restaurant(name='Other', owner=create_user(email='other@example.com'))
        reservation = create_reservation(self.customer, other_restaurant)

        response = self.client.patch(
            f'/api/owner/reservations/{reservation.id}/status/',
            {'status': 'no_show'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class OwnerProfileCapacityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = create_user(email='cap-owner@example.com')
        self.restaurant = create_restaurant(owner=self.owner)
        staff_user = create_user(email='staff-cap@example.com')
        refresh = RefreshToken.for_user(staff_user)
        refresh['staff_role'] = 'owner'
        refresh['email'] = self.owner.email
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_owner_profile_capacity_roundtrip(self):
        res = self.client.patch('/api/owner/profile/', {'capacity': 40}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.get('/api/owner/profile/')
        self.assertEqual(res.data['capacity'], 40)
