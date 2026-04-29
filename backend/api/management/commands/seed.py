from django.core.management.base import BaseCommand
from api.models import Restaurant, MenuItem


RESTAURANTS = [
    {
        'name': 'The Golden Fork',
        'cuisine': 'Italian',
        'location': 'Downtown',
        'distance': '0.8 mi',
        'rating': 4.8,
        'price_range': '$$$',
        'address': 'Calle Gran Vía 23, Granada',
        'description': 'Experience the authentic flavors of Italy in the heart of the city. Our chef uses only the freshest ingredients to create traditional pasta dishes and wood-fired pizzas.',
        'lat': 40.4200,
        'lng': -3.7025,
        'image_url': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 1240,
        'menu': [
            {'name': 'Truffle Pasta', 'description': 'Homemade tagliatelle with black truffle and parmesan', 'price': 24},
            {'name': 'Margherita Pizza', 'description': 'San Marzano tomatoes, fresh mozzarella, basil', 'price': 18},
            {'name': 'Osso Buco', 'description': 'Braised veal shank with gremolata and saffron risotto', 'price': 32},
            {'name': 'Tiramisu', 'description': 'Classic Italian dessert with mascarpone and espresso', 'price': 9},
        ],
    },
    {
        'name': 'Sakura Gardens',
        'cuisine': 'Japanese',
        'location': 'West End',
        'distance': '2.1 mi',
        'rating': 4.6,
        'price_range': '$$',
        'address': 'Paseo de la Castellana 88, Granada',
        'description': 'An authentic Japanese experience in Granada. Fresh sushi, sashimi and traditional dishes prepared by our master chef from Osaka.',
        'lat': 40.4319,
        'lng': -3.6896,
        'image_url': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 874,
        'menu': [
            {'name': 'Omakase Sushi (8 pcs)', 'description': "Chef's selection of the finest seasonal nigiri", 'price': 28},
            {'name': 'Salmon Sashimi', 'description': 'Premium Norwegian salmon, thinly sliced', 'price': 16},
            {'name': 'Wagyu Gyoza', 'description': 'Pan-fried dumplings filled with Japanese wagyu beef', 'price': 14},
            {'name': 'Miso Ramen', 'description': 'Rich miso broth with chashu pork and soft-boiled egg', 'price': 18},
        ],
    },
    {
        'name': 'Prime Cuts',
        'cuisine': 'Steakhouse',
        'location': 'Uptown',
        'distance': '1.5 mi',
        'rating': 4.9,
        'price_range': '$$$$',
        'address': 'Calle Serrano 41, Granada',
        'description': 'The finest steaks in Granada, aged to perfection. Our dry-aged cuts are sourced from sustainable farms and cooked exactly to your preference.',
        'lat': 40.4233,
        'lng': -3.7121,
        'image_url': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 2105,
        'menu': [
            {'name': 'Ribeye 300g', 'description': '45-day dry-aged prime ribeye, chimichurri, fries', 'price': 48},
            {'name': 'Tenderloin 250g', 'description': 'AAA tenderloin, truffle butter, roasted garlic', 'price': 55},
            {'name': 'Bone-in Tomahawk', 'description': '1kg tomahawk for two, seasonal vegetables', 'price': 110},
            {'name': 'Crème Brûlée', 'description': 'Vanilla bean custard with caramelised sugar crust', 'price': 10},
        ],
    },
    {
        'name': 'El Centro Fusion',
        'cuisine': 'Fusion',
        'location': 'Centro',
        'distance': '0.5 mi',
        'rating': 4.5,
        'price_range': '$$$',
        'address': 'Plaza Mayor 7, Granada',
        'description': 'Where East meets West. Creative fusion cuisine combining Mediterranean and Asian influences in a stunning setting at the heart of Granada.',
        'lat': 40.4153,
        'lng': -3.7073,
        'image_url': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 618,
        'menu': [
            {'name': 'Tuna Tataki Ceviche', 'description': 'Sesame-crusted tuna with citrus ponzu and avocado', 'price': 22},
            {'name': 'Wagyu Tacos (3)', 'description': 'Wagyu beef, kimchi, sriracha mayo on mini tortillas', 'price': 26},
            {'name': 'Miso Glazed Cod', 'description': 'With bok choy, jasmine rice and yuzu butter', 'price': 30},
            {'name': 'Matcha Cheesecake', 'description': 'Japanese matcha with Spanish cream cheese', 'price': 10},
        ],
    },
    {
        'name': 'Green Leaf',
        'cuisine': 'Healthy',
        'location': 'Norte',
        'distance': '3.2 mi',
        'rating': 4.7,
        'price_range': '$$',
        'address': 'Calle Fuencarral 102, Granada',
        'description': 'Award-winning vegetarian and vegan restaurant. Farm-to-table philosophy with seasonal organic produce delivered daily from local farmers.',
        'lat': 40.4290,
        'lng': -3.7014,
        'image_url': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 940,
        'menu': [
            {'name': 'Buddha Bowl', 'description': 'Quinoa, roasted vegetables, chickpeas, tahini dressing', 'price': 16},
            {'name': 'Wild Mushroom Risotto', 'description': 'Creamy Arborio rice with truffle oil and parmigiana', 'price': 19},
            {'name': 'Avocado Toast Stack', 'description': 'Sourdough, smashed avocado, poached eggs, microgreens', 'price': 14},
            {'name': 'Açaí Bowl', 'description': 'Organic açaí, seasonal fruits, granola, honey', 'price': 12},
        ],
    },
    {
        'name': 'Petit Paris Bistro',
        'cuisine': 'French',
        'location': 'Salamanca',
        'distance': '1.9 mi',
        'rating': 4.4,
        'price_range': '$$$',
        'address': 'Calle Goya 67, Granada',
        'description': 'A slice of Paris in the heart of Granada. Classic French bistro cuisine with an extensive wine list and the warmth of a Parisian neighbourhood restaurant.',
        'lat': 40.4255,
        'lng': -3.6828,
        'image_url': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 512,
        'menu': [
            {'name': 'French Onion Soup', 'description': 'Slow-cooked onion broth, crouton, gruyère gratin', 'price': 14},
            {'name': 'Duck Confit', 'description': 'Slow-cooked duck leg, Puy lentils, cherry jus', 'price': 28},
            {'name': 'Steak Frites', 'description': "Entrecôte, maître d'hôtel butter, crispy fries", 'price': 26},
            {'name': 'Crêpe Suzette', 'description': 'Classic flambéed crêpes with Grand Marnier and orange', 'price': 12},
        ],
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with restaurant data'

    def handle(self, *args, **options):
        if Restaurant.objects.exists():
            self.stdout.write('Database already seeded. Use --reset to re-seed.')
            return

        for data in RESTAURANTS:
            menu = data.pop('menu')
            restaurant = Restaurant.objects.create(**data)
            for item in menu:
                MenuItem.objects.create(restaurant=restaurant, **item)
            self.stdout.write(f'  Created: {restaurant.name}')

        self.stdout.write(self.style.SUCCESS(f'Seeded {len(RESTAURANTS)} restaurants.'))
