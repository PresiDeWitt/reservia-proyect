from django.core.management.base import BaseCommand
from api.models import Restaurant, MenuItem


RESTAURANTS = [
    {
        'name': 'The Golden Fork',
        'cuisine': 'Italian',
        'location': 'Centro',
        'distance': '0.8 km',
        'rating': 4.8,
        'price_range': '$$$',
        'address': 'Calle Gran Vía 23, Granada',
        'description': 'Auténticos sabores de Italia en el corazón de la ciudad. Nuestro chef utiliza solo los ingredientes más frescos para crear pastas tradicionales y pizzas al horno de leña.',
        'lat': 40.4200,
        'lng': -3.7025,
        'image_url': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 1240,
        'menu': [
            {'name': 'Pasta con Trufa', 'description': 'Tagliatelle artesanal con trufa negra y parmesano', 'price': 24},
            {'name': 'Pizza Margherita', 'description': 'Tomates San Marzano, mozzarella fresca, albahaca', 'price': 18},
            {'name': 'Osso Buco', 'description': 'Jarrete de ternera estofado con gremolata y risotto al azafrán', 'price': 32},
            {'name': 'Tiramisú', 'description': 'Clásico postre italiano con mascarpone y espresso', 'price': 9},
        ],
    },
    {
        'name': 'Sakura Gardens',
        'cuisine': 'Japanese',
        'location': 'Realejo',
        'distance': '2.1 km',
        'rating': 4.6,
        'price_range': '$$',
        'address': 'Paseo de la Castellana 88, Granada',
        'description': 'Una experiencia japonesa auténtica en Granada. Sushi fresco, sashimi y platos tradicionales elaborados por nuestro maestro chef de Osaka.',
        'lat': 40.4319,
        'lng': -3.6896,
        'image_url': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 874,
        'menu': [
            {'name': 'Omakase Sushi (8 uds)', 'description': 'Selección del chef de los mejores nigiris de temporada', 'price': 28},
            {'name': 'Sashimi de Salmón', 'description': 'Salmón noruego premium, cortado fino', 'price': 16},
            {'name': 'Gyoza de Wagyu', 'description': 'Empanadillas a la plancha rellenas de wagyu japonés', 'price': 14},
            {'name': 'Ramen de Miso', 'description': 'Caldo de miso intenso con chashu de cerdo y huevo semicocido', 'price': 18},
        ],
    },
    {
        'name': 'Prime Cuts',
        'cuisine': 'Steakhouse',
        'location': 'Albaicín',
        'distance': '1.5 km',
        'rating': 4.9,
        'price_range': '$$$$',
        'address': 'Calle Serrano 41, Granada',
        'description': 'Los mejores cortes de Granada, madurados a la perfección. Nuestra carne dry-aged proviene de granjas sostenibles y se cocina exactamente a tu gusto.',
        'lat': 40.4233,
        'lng': -3.7121,
        'image_url': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 2105,
        'menu': [
            {'name': 'Ribeye 300g', 'description': 'Chuletón dry-aged 45 días, chimichurri, patatas fritas', 'price': 48},
            {'name': 'Solomillo 250g', 'description': 'Solomillo AAA, mantequilla de trufa, ajo asado', 'price': 55},
            {'name': 'Tomahawk al hueso', 'description': 'Tomahawk de 1 kg para dos, verduras de temporada', 'price': 110},
            {'name': 'Crème Brûlée', 'description': 'Crema de vainilla con costra de azúcar caramelizado', 'price': 10},
        ],
    },
    {
        'name': 'El Centro Fusion',
        'cuisine': 'Fusion',
        'location': 'Centro',
        'distance': '0.5 km',
        'rating': 4.5,
        'price_range': '$$$',
        'address': 'Plaza Mayor 7, Granada',
        'description': 'Donde Oriente y Occidente se encuentran. Cocina fusión creativa que combina influencias mediterráneas y asiáticas en un entorno excepcional en el corazón de Granada.',
        'lat': 40.4153,
        'lng': -3.7073,
        'image_url': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 618,
        'menu': [
            {'name': 'Ceviche Tataki de Atún', 'description': 'Atún con sésamo, ponzu cítrico y aguacate', 'price': 22},
            {'name': 'Tacos de Wagyu (3)', 'description': 'Wagyu, kimchi y mayonesa sriracha en mini tortillas', 'price': 26},
            {'name': 'Bacalao Glaseado al Miso', 'description': 'Con pak choi, arroz jazmín y mantequilla de yuzu', 'price': 30},
            {'name': 'Cheesecake de Matcha', 'description': 'Matcha japonés con queso crema español', 'price': 10},
        ],
    },
    {
        'name': 'Green Leaf',
        'cuisine': 'Healthy',
        'location': 'Norte',
        'distance': '3.2 km',
        'rating': 4.7,
        'price_range': '$$',
        'address': 'Calle Fuencarral 102, Granada',
        'description': 'Restaurante vegetariano y vegano galardonado. Filosofía de campo a mesa con producto ecológico de temporada entregado a diario por agricultores locales.',
        'lat': 40.4290,
        'lng': -3.7014,
        'image_url': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 940,
        'menu': [
            {'name': 'Buddha Bowl', 'description': 'Quinoa, verduras asadas, garbanzos, aliño de tahini', 'price': 16},
            {'name': 'Risotto de Setas Silvestres', 'description': 'Arroz Arborio cremoso con aceite de trufa y parmigiana', 'price': 19},
            {'name': 'Tostada de Aguacate', 'description': 'Pan de masa madre, aguacate aplastado, huevo pochado, microgreens', 'price': 14},
            {'name': 'Açaí Bowl', 'description': 'Açaí ecológico, frutas de temporada, granola, miel', 'price': 12},
        ],
    },
    {
        'name': 'Petit Paris Bistro',
        'cuisine': 'French',
        'location': 'Salamanca',
        'distance': '1.9 km',
        'rating': 4.4,
        'price_range': '$$$',
        'address': 'Calle Goya 67, Granada',
        'description': 'Un trozo de París en el corazón de Granada. Cocina clásica de bistró francés con una extensa carta de vinos y el calor de un restaurante de barrio parisino.',
        'lat': 40.4255,
        'lng': -3.6828,
        'image_url': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800',
        'reviews_count': 512,
        'menu': [
            {'name': 'Sopa de Cebolla Francesa', 'description': 'Caldo de cebolla a fuego lento, picatostes, gratinado de gruyère', 'price': 14},
            {'name': 'Confit de Pato', 'description': 'Muslo de pato confitado, lentejas du Puy, jugo de cereza', 'price': 28},
            {'name': 'Steak Frites', 'description': "Entrecôte, mantequilla maître d'hôtel, patatas crujientes", 'price': 26},
            {'name': 'Crêpe Suzette', 'description': 'Crêpes clásicas flambeadas con Grand Marnier y naranja', 'price': 12},
        ],
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with restaurant data'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Delete existing data before seeding')

    def handle(self, *args, **options):
        if options['reset']:
            MenuItem.objects.all().delete()
            Restaurant.objects.all().delete()
            self.stdout.write('Existing data deleted.')

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
