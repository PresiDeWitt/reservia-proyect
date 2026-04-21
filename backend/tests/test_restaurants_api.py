from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Restaurant
from tests.factories import create_menu_item, create_restaurant


class RestaurantsApiTests(APITestCase):
    def setUp(self):
        self.r1 = create_restaurant(
            name='Sushi House',
            cuisine='Japanese',
            location='Sol',
            rating=4.8,
        )
        self.r2 = create_restaurant(
            name='Pasta Roma',
            cuisine='Italian',
            location='Malasana',
            rating=4.2,
        )
        self.r3 = create_restaurant(
            name='La Brasa',
            cuisine='Spanish',
            location='Salamanca',
            rating=4.5,
        )
        create_menu_item(self.r1, name='Maki', price=13.5)
        create_menu_item(self.r1, name='Nigiri', price=14.0)

    def test_list_returns_total_and_sorted_by_rating(self):
        response = self.client.get('/api/restaurants/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 3)
        names = [item['name'] for item in response.data['restaurants']]
        self.assertEqual(names, ['Sushi House', 'La Brasa', 'Pasta Roma'])

    def test_list_search_matches_name_cuisine_or_location(self):
        by_name = self.client.get('/api/restaurants/?search=sushi')
        by_cuisine = self.client.get('/api/restaurants/?search=italian')
        by_location = self.client.get('/api/restaurants/?search=salamanca')

        self.assertEqual(by_name.data['total'], 1)
        self.assertEqual(by_name.data['restaurants'][0]['name'], 'Sushi House')

        self.assertEqual(by_cuisine.data['total'], 1)
        self.assertEqual(by_cuisine.data['restaurants'][0]['name'], 'Pasta Roma')

        self.assertEqual(by_location.data['total'], 1)
        self.assertEqual(by_location.data['restaurants'][0]['name'], 'La Brasa')

    def test_list_cuisine_filter_is_case_insensitive(self):
        response = self.client.get('/api/restaurants/?cuisine=jApAnEsE')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 1)
        self.assertEqual(response.data['restaurants'][0]['name'], 'Sushi House')

    def test_cuisines_endpoint_returns_unique_sorted_values(self):
        response = self.client.get('/api/restaurants/cuisines/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, ['Italian', 'Japanese', 'Spanish'])

    def test_restaurant_detail_includes_menu_items(self):
        response = self.client.get(f'/api/restaurants/{self.r1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Sushi House')
        self.assertEqual(len(response.data['menuItems']), 2)

    def test_restaurant_detail_returns_404_for_unknown_id(self):
        unknown_id = Restaurant.objects.latest('id').id + 1
        response = self.client.get(f'/api/restaurants/{unknown_id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_schema_contains_expected_keys(self):
        response = self.client.get('/api/restaurants/')
        restaurant = response.data['restaurants'][0]

        expected = {
            'id',
            'name',
            'cuisine',
            'location',
            'distance',
            'rating',
            'priceRange',
            'address',
            'image',
            'reviewsCount',
            'coords',
        }
        self.assertTrue(expected.issubset(restaurant.keys()))
