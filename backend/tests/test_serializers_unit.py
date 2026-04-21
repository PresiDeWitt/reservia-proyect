from datetime import date, timedelta

from django.test import TestCase

from api.serializers import (
    RegisterSerializer,
    ReservationSerializer,
    RestaurantDetailSerializer,
    RestaurantListSerializer,
)
from tests.factories import create_menu_item, create_restaurant


class SerializerUnitTests(TestCase):
    def test_register_serializer_creates_user_and_profile(self):
        serializer = RegisterSerializer(
            data={
                'first_name': 'Ana',
                'last_name': 'Soto',
                'email': 'ana.serializer@example.com',
                'password': 'secret123',
                'phone': '+34123456789',
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.username, 'ana.serializer@example.com')
        self.assertEqual(user.profile.phone, '+34123456789')

    def test_register_serializer_rejects_duplicate_email(self):
        first = RegisterSerializer(
            data={
                'first_name': 'A',
                'last_name': 'B',
                'email': 'duplicado@example.com',
                'password': 'secret123',
            }
        )
        self.assertTrue(first.is_valid(), first.errors)
        first.save()

        duplicate = RegisterSerializer(
            data={
                'first_name': 'C',
                'last_name': 'D',
                'email': 'duplicado@example.com',
                'password': 'secret123',
            }
        )
        self.assertFalse(duplicate.is_valid())
        self.assertIn('email', duplicate.errors)

    def test_reservation_serializer_validates_guest_range(self):
        restaurant = create_restaurant()
        base_data = {
            'restaurantId': restaurant.id,
            'date': (date.today() + timedelta(days=2)).isoformat(),
            'time': '20:30:00',
        }

        too_low = ReservationSerializer(data={**base_data, 'guests': 0})
        too_high = ReservationSerializer(data={**base_data, 'guests': 21})
        valid = ReservationSerializer(data={**base_data, 'guests': 4})

        self.assertFalse(too_low.is_valid())
        self.assertFalse(too_high.is_valid())
        self.assertTrue(valid.is_valid(), valid.errors)

    def test_restaurant_list_serializer_maps_fields(self):
        restaurant = create_restaurant(
            price_range='$$$',
            image_url='https://example.com/image.jpg',
            reviews_count=345,
        )

        data = RestaurantListSerializer(restaurant).data
        self.assertEqual(data['priceRange'], '$$$')
        self.assertEqual(data['image'], 'https://example.com/image.jpg')
        self.assertEqual(data['reviewsCount'], 345)
        self.assertEqual(data['coords'], [restaurant.lat, restaurant.lng])

    def test_restaurant_detail_serializer_includes_menu(self):
        restaurant = create_restaurant()
        create_menu_item(restaurant, name='Croquetas', price=7.5)
        create_menu_item(restaurant, name='Pulpo', price=18.0)

        data = RestaurantDetailSerializer(restaurant).data
        self.assertEqual(len(data['menuItems']), 2)
        self.assertEqual(data['menuItems'][0]['name'], 'Croquetas')
        self.assertIn('description', data)
