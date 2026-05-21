from datetime import date, time, timedelta

from django.contrib.auth.models import User

from api.models import AvailabilitySlot, MenuItem, Reservation, Restaurant, RestaurantTable, Review


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
        'distance_km': 1.2,
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


def create_table(restaurant, **overrides):
    defaults = {
        'label': 'M1',
        'zone': 'main',
        'capacity': 4,
        'supplement': 0,
        'pos_x': 0.0,
        'pos_y': 0.0,
        'is_active': True,
    }
    defaults.update(overrides)
    return RestaurantTable.objects.create(restaurant=restaurant, **defaults)


def create_slot(table, slot_date=None, slot_time=None, is_available=True):
    if slot_date is None:
        slot_date = date.today() + timedelta(days=1)
    if slot_time is None:
        slot_time = time(20, 30)
    slot, _ = AvailabilitySlot.objects.get_or_create(
        table=table, date=slot_date, time=slot_time,
        defaults={'is_available': is_available},
    )
    slot.is_available = is_available
    slot.save(update_fields=['is_available'])
    return slot


def create_reservation(user, restaurant, **overrides):
    defaults = {
        'date': date.today() + timedelta(days=1),
        'time': time(20, 30),
        'guests': 2,
        'status': 'confirmed',
    }
    defaults.update(overrides)
    return Reservation.objects.create(user=user, restaurant=restaurant, **defaults)


def create_review(user, restaurant, **overrides):
    defaults = {'rating': 5, 'comment': 'Excelente'}
    defaults.update(overrides)
    return Review.objects.create(user=user, restaurant=restaurant, **defaults)
