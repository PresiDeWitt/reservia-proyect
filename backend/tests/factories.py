from datetime import date, time, timedelta

from django.contrib.auth.models import User

from api.models import MenuItem, Reservation, Restaurant


def create_user(
    email='user@example.com',
    password='secret123',
    first_name='User',
    last_name='Test',
):
    return User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )


def create_restaurant(**overrides):
    defaults = {
        'name': 'Bistro Central',
        'cuisine': 'Mediterranean',
        'location': 'Centro',
        'distance': '1.2 km',
        'rating': 4.6,
        'price_range': '$$',
        'address': 'Calle Mayor 10, Madrid',
        'description': 'Cocina mediterranea contemporanea.',
        'lat': 40.4168,
        'lng': -3.7038,
        'image_url': 'https://example.com/bistro.jpg',
        'reviews_count': 120,
    }
    defaults.update(overrides)
    return Restaurant.objects.create(**defaults)


def create_menu_item(restaurant, **overrides):
    defaults = {
        'name': 'Tortilla de patatas',
        'description': 'Receta tradicional.',
        'price': 9.5,
    }
    defaults.update(overrides)
    return MenuItem.objects.create(restaurant=restaurant, **defaults)


def create_reservation(user, restaurant, **overrides):
    defaults = {
        'date': date.today() + timedelta(days=1),
        'time': time(20, 30),
        'guests': 2,
    }
    defaults.update(overrides)
    return Reservation.objects.create(user=user, restaurant=restaurant, **defaults)
