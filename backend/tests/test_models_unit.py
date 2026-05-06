from datetime import date, timedelta, time

from django.test import TestCase

from api.models import Reservation, Restaurant, UserProfile
from tests.factories import create_menu_item, create_reservation, create_restaurant, create_user


class ModelUnitTests(TestCase):
    def test_restaurant_string_representation(self):
        restaurant = create_restaurant(name='Casa Luca')
        self.assertEqual(str(restaurant), 'Casa Luca')

    def test_menu_item_string_representation(self):
        restaurant = create_restaurant(name='La Terraza')
        item = create_menu_item(restaurant, name='Paella')
        self.assertEqual(str(item), 'Paella (La Terraza)')

    def test_reservation_string_representation(self):
        user = create_user(email='cliente1@example.com')
        restaurant = create_restaurant(name='Fuego')
        reservation = create_reservation(
            user,
            restaurant,
            date=date(2026, 5, 20),
            time=time(21, 15),
        )
        self.assertIn('cliente1@example.com', str(reservation))
        self.assertIn('Fuego', str(reservation))

    def test_user_profile_string_representation(self):
        user = create_user(email='perfil@example.com')
        profile = UserProfile.objects.create(user=user, phone='+34000000000')
        self.assertEqual(str(profile), 'Profile<perfil@example.com>')

    def test_restaurant_ordering_by_rating_desc(self):
        low = create_restaurant(name='Low', rating=3.8)
        high = create_restaurant(name='High', rating=4.9)
        self.assertEqual(list(Restaurant.objects.all()), [high, low])

    def test_reservation_default_status_and_ordering(self):
        user = create_user(email='orden@example.com')
        restaurant = create_restaurant()

        older = create_reservation(
            user,
            restaurant,
            date=date.today() + timedelta(days=1),
            time=time(20, 0),
        )
        newer = create_reservation(
            user,
            restaurant,
            date=date.today() + timedelta(days=3),
            time=time(19, 0),
        )

        self.assertEqual(older.status, 'confirmed')
        self.assertEqual(list(Reservation.objects.all()), [newer, older])
