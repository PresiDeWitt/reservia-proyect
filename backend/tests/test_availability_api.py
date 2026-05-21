from datetime import date, time, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from api.models import AvailabilitySlot, Reservation
from tests.factories import create_reservation, create_restaurant, create_slot, create_table, create_user

TOMORROW = date.today() + timedelta(days=1)
YESTERDAY = date.today() - timedelta(days=1)
RES_TIME = time(20, 0)


class AvailabilityEndpointTests(APITestCase):
    def setUp(self):
        self.restaurant = create_restaurant()
        self.table = create_table(self.restaurant, capacity=4)
        create_slot(self.table, slot_date=TOMORROW, slot_time=RES_TIME)

    def test_availability_returns_slots(self):
        url = f'/api/restaurants/{self.restaurant.id}/availability/?date={TOMORROW}&guests=2'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('slots', response.data)
        self.assertTrue(len(response.data['slots']) > 0)
        times = [s['time'] for s in response.data['slots']]
        self.assertIn('20:00', times)

    def test_availability_slot_is_available(self):
        url = f'/api/restaurants/{self.restaurant.id}/availability/?date={TOMORROW}&guests=2'
        response = self.client.get(url)
        slot_20 = next(s for s in response.data['slots'] if s['time'] == '20:00')
        self.assertTrue(slot_20['available'])

    def test_availability_rejects_past_date(self):
        url = f'/api/restaurants/{self.restaurant.id}/availability/?date={YESTERDAY}&guests=2'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_availability_requires_date_param(self):
        url = f'/api/restaurants/{self.restaurant.id}/availability/?guests=2'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_tables_endpoint_returns_positions_and_availability(self):
        url = f'/api/restaurants/{self.restaurant.id}/tables/?date={TOMORROW}&time=20:00'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tables', response.data)
        self.assertEqual(len(response.data['tables']), 1)
        tbl = response.data['tables'][0]
        self.assertIn('posX', tbl)
        self.assertIn('posY', tbl)
        self.assertTrue(tbl['available'])

    def test_tables_endpoint_without_date_returns_all_available(self):
        url = f'/api/restaurants/{self.restaurant.id}/tables/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['tables']), 1)
        self.assertTrue(response.data['tables'][0]['available'])


class ReservationConsumesSlotTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.restaurant = create_restaurant()
        self.table = create_table(self.restaurant, capacity=4)
        self.slot = create_slot(self.table, slot_date=TOMORROW, slot_time=RES_TIME)

    def _payload(self, guests=2):
        return {
            'restaurantId': self.restaurant.id,
            'date': TOMORROW.isoformat(),
            'time': '20:00:00',
            'guests': guests,
        }

    def test_reservation_consumes_slot(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/reservations/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.slot.refresh_from_db()
        self.assertFalse(self.slot.is_available)

    def test_reservation_rejected_when_no_slot(self):
        self.slot.is_available = False
        self.slot.save()
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/reservations/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_reservation_releases_slot(self):
        self.client.force_authenticate(user=self.user)
        create_res = self.client.post('/api/reservations/', self._payload(), format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        reservation_id = create_res.data['id']

        cancel = self.client.delete(f'/api/reservations/{reservation_id}/')
        self.assertEqual(cancel.status_code, status.HTTP_200_OK)
        self.slot.refresh_from_db()
        self.assertTrue(self.slot.is_available)

    def test_reservation_rejected_insufficient_capacity(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/reservations/', self._payload(guests=6), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
