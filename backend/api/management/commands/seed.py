from django.core.management.base import BaseCommand
from api.models import Restaurant, MenuItem, FloorPlan, Table, Seat


RESTAURANTS = [
    {
        'name': 'The Golden Fork',
        'cuisine': 'Italian',
        'location': 'Downtown',
        'distance': '0.8 mi',
        'rating': 4.8,
        'price_range': '$$$',
        'address': 'Calle Gran Vía 23, Madrid',
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
        'address': 'Paseo de la Castellana 88, Madrid',
        'description': 'An authentic Japanese experience in Madrid. Fresh sushi, sashimi and traditional dishes prepared by our master chef from Osaka.',
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
        'address': 'Calle Serrano 41, Madrid',
        'description': 'The finest steaks in Madrid, aged to perfection. Our dry-aged cuts are sourced from sustainable farms and cooked exactly to your preference.',
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
        'address': 'Plaza Mayor 7, Madrid',
        'description': 'Where East meets West. Creative fusion cuisine combining Mediterranean and Asian influences in a stunning setting at the heart of Madrid.',
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
        'address': 'Calle Fuencarral 102, Madrid',
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
        'address': 'Calle Goya 67, Madrid',
        'description': 'A slice of Paris in the heart of Madrid. Classic French bistro cuisine with an extensive wine list and the warmth of a Parisian neighbourhood restaurant.',
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
        self._seed_floor_plans()

    def _seed_floor_plans(self):
        LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

        def create_seats(table):
            for i in range(table.capacity):
                Seat.objects.create(
                    table=table, seat_index=i,
                    label=f"{table.label}-{LABELS[i % 26]}",
                )

        # Floor plan for The Golden Fork (Italian - elegant layout)
        r1 = Restaurant.objects.filter(name='The Golden Fork').first()
        if r1 and not FloorPlan.objects.filter(restaurant=r1).exists():
            fp = FloorPlan.objects.create(restaurant=r1, width=1000, height=700)
            tables = [
                {'label': 'T1', 'shape': 'round', 'x': 150, 'y': 150, 'width': 90, 'height': 90, 'capacity': 2},
                {'label': 'T2', 'shape': 'round', 'x': 350, 'y': 150, 'width': 90, 'height': 90, 'capacity': 2},
                {'label': 'T3', 'shape': 'round', 'x': 550, 'y': 150, 'width': 100, 'height': 100, 'capacity': 4},
                {'label': 'T4', 'shape': 'round', 'x': 800, 'y': 150, 'width': 100, 'height': 100, 'capacity': 4},
                {'label': 'T5', 'shape': 'square', 'x': 150, 'y': 380, 'width': 90, 'height': 90, 'capacity': 4},
                {'label': 'T6', 'shape': 'square', 'x': 350, 'y': 380, 'width': 90, 'height': 90, 'capacity': 4},
                {'label': 'T7', 'shape': 'rectangular', 'x': 600, 'y': 380, 'width': 160, 'height': 90, 'capacity': 6},
                {'label': 'T8', 'shape': 'round', 'x': 150, 'y': 570, 'width': 90, 'height': 90, 'capacity': 2},
                {'label': 'T9', 'shape': 'round', 'x': 350, 'y': 570, 'width': 90, 'height': 90, 'capacity': 2},
                {'label': 'T10', 'shape': 'rectangular', 'x': 650, 'y': 570, 'width': 200, 'height': 100, 'capacity': 8},
            ]
            for t in tables:
                table = Table.objects.create(floor_plan=fp, **t)
                create_seats(table)
            self.stdout.write(f'  Floor plan: {r1.name} ({len(tables)} tables)')

        # Floor plan for Sakura Gardens (Japanese - minimalist)
        r2 = Restaurant.objects.filter(name='Sakura Gardens').first()
        if r2 and not FloorPlan.objects.filter(restaurant=r2).exists():
            fp = FloorPlan.objects.create(restaurant=r2, width=1000, height=700)
            tables = [
                {'label': 'T1', 'shape': 'rectangular', 'x': 200, 'y': 150, 'width': 140, 'height': 80, 'capacity': 4},
                {'label': 'T2', 'shape': 'rectangular', 'x': 500, 'y': 150, 'width': 140, 'height': 80, 'capacity': 4},
                {'label': 'T3', 'shape': 'rectangular', 'x': 800, 'y': 150, 'width': 140, 'height': 80, 'capacity': 4},
                {'label': 'T4', 'shape': 'round', 'x': 200, 'y': 380, 'width': 100, 'height': 100, 'capacity': 4},
                {'label': 'T5', 'shape': 'round', 'x': 500, 'y': 380, 'width': 100, 'height': 100, 'capacity': 4},
                {'label': 'T6', 'shape': 'round', 'x': 800, 'y': 380, 'width': 80, 'height': 80, 'capacity': 2},
                {'label': 'T7', 'shape': 'rectangular', 'x': 350, 'y': 580, 'width': 200, 'height': 90, 'capacity': 8},
                {'label': 'T8', 'shape': 'square', 'x': 700, 'y': 580, 'width': 80, 'height': 80, 'capacity': 2},
            ]
            for t in tables:
                table = Table.objects.create(floor_plan=fp, **t)
                create_seats(table)
            self.stdout.write(f'  Floor plan: {r2.name} ({len(tables)} tables)')

        # Floor plan for Prime Cuts (Steakhouse - spacious)
        r3 = Restaurant.objects.filter(name='Prime Cuts').first()
        if r3 and not FloorPlan.objects.filter(restaurant=r3).exists():
            fp = FloorPlan.objects.create(restaurant=r3, width=1000, height=700)
            tables = [
                {'label': 'T1', 'shape': 'round', 'x': 180, 'y': 170, 'width': 110, 'height': 110, 'capacity': 4},
                {'label': 'T2', 'shape': 'round', 'x': 450, 'y': 170, 'width': 110, 'height': 110, 'capacity': 4},
                {'label': 'T3', 'shape': 'round', 'x': 720, 'y': 170, 'width': 80, 'height': 80, 'capacity': 2},
                {'label': 'T4', 'shape': 'rectangular', 'x': 180, 'y': 400, 'width': 150, 'height': 90, 'capacity': 6},
                {'label': 'T5', 'shape': 'rectangular', 'x': 500, 'y': 400, 'width': 150, 'height': 90, 'capacity': 6},
                {'label': 'T6', 'shape': 'round', 'x': 800, 'y': 400, 'width': 80, 'height': 80, 'capacity': 2},
                {'label': 'T7', 'shape': 'rectangular', 'x': 500, 'y': 590, 'width': 250, 'height': 100, 'capacity': 10},
            ]
            for t in tables:
                table = Table.objects.create(floor_plan=fp, **t)
                create_seats(table)
            self.stdout.write(f'  Floor plan: {r3.name} ({len(tables)} tables)')
