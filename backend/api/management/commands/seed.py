import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from api.models import Restaurant, MenuItem, RestaurantTable, Review


RESTAURANTS = [
    {
        'name': 'The Golden Fork',
        'cuisine': 'Italian',
        'location': 'Centro',
        'distance_km': 0.8,
        'rating': 4.8,
        'price_range': '$$$',
        'address': 'Calle Gran Vía 23, Granada',
        'description': 'Auténticos sabores de Italia en el corazón de la ciudad. Nuestro chef utiliza solo los ingredientes más frescos para crear pastas tradicionales y pizzas al horno de leña.',
        'lat': 37.1773,
        'lng': -3.5986,
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
        'distance_km': 2.1,
        'rating': 4.6,
        'price_range': '$$',
        'address': 'Paseo de la Castellana 88, Granada',
        'description': 'Una experiencia japonesa auténtica en Granada. Sushi fresco, sashimi y platos tradicionales elaborados por nuestro maestro chef de Osaka.',
        'lat': 37.1810,
        'lng': -3.5956,
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
        'distance_km': 1.5,
        'rating': 4.9,
        'price_range': '$$$$',
        'address': 'Calle Serrano 41, Granada',
        'description': 'Los mejores cortes de Granada, madurados a la perfección. Nuestra carne dry-aged proviene de granjas sostenibles y se cocina exactamente a tu gusto.',
        'lat': 37.1850,
        'lng': -3.5910,
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
        'distance_km': 0.5,
        'rating': 4.5,
        'price_range': '$$$',
        'address': 'Plaza Mayor 7, Granada',
        'description': 'Donde Oriente y Occidente se encuentran. Cocina fusión creativa que combina influencias mediterráneas y asiáticas en un entorno excepcional en el corazón de Granada.',
        'lat': 37.1740,
        'lng': -3.6050,
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
        'distance_km': 3.2,
        'rating': 4.7,
        'price_range': '$$',
        'address': 'Calle Fuencarral 102, Granada',
        'description': 'Restaurante vegetariano y vegano galardonado. Filosofía de campo a mesa con producto ecológico de temporada entregado a diario por agricultores locales.',
        'lat': 37.1780,
        'lng': -3.6140,
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
        'distance_km': 1.9,
        'rating': 4.4,
        'price_range': '$$$',
        'address': 'Calle Goya 67, Granada',
        'description': 'Un trozo de París en el corazón de Granada. Cocina clásica de bistró francés con una extensa carta de vinos y el calor de un restaurante de barrio parisino.',
        'lat': 37.1700,
        'lng': -3.5970,
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

        DEFAULT_TABLES = [
            {'label': 'M1', 'zone': 'main',    'capacity': 2, 'supplement': 0,  'pos_x': -4, 'pos_y': -2},
            {'label': 'M2', 'zone': 'main',    'capacity': 4, 'supplement': 0,  'pos_x':  0, 'pos_y': -2},
            {'label': 'M3', 'zone': 'main',    'capacity': 2, 'supplement': 0,  'pos_x':  4, 'pos_y': -2},
            {'label': 'M4', 'zone': 'main',    'capacity': 4, 'supplement': 0,  'pos_x': -4, 'pos_y':  1},
            {'label': 'M5', 'zone': 'main',    'capacity': 6, 'supplement': 0,  'pos_x':  0, 'pos_y':  1},
            {'label': 'M6', 'zone': 'main',    'capacity': 2, 'supplement': 0,  'pos_x':  4, 'pos_y':  1},
            {'label': 'T1', 'zone': 'terrace', 'capacity': 2, 'supplement': 5,  'pos_x': -4, 'pos_y':  5},
            {'label': 'T2', 'zone': 'terrace', 'capacity': 4, 'supplement': 5,  'pos_x':  0, 'pos_y':  5},
            {'label': 'T3', 'zone': 'terrace', 'capacity': 2, 'supplement': 5,  'pos_x':  4, 'pos_y':  5},
            {'label': 'P1', 'zone': 'private', 'capacity': 8, 'supplement': 15, 'pos_x':  7, 'pos_y': -1},
        ]

        for data in RESTAURANTS:
            menu = data.pop('menu')
            restaurant = Restaurant.objects.create(**data)
            for item in menu:
                MenuItem.objects.create(restaurant=restaurant, **item)
            for tbl in DEFAULT_TABLES:
                RestaurantTable.objects.create(restaurant=restaurant, **tbl)
            self.stdout.write(f'  Created: {restaurant.name}')

        owner_email = os.environ.get('STAFF_OWNER_EMAIL', 'owner@reservia.demo')
        owner_user, _ = User.objects.get_or_create(
            username=owner_email,
            defaults={'email': owner_email, 'first_name': 'Owner', 'last_name': 'Demo'},
        )
        first_restaurant = Restaurant.objects.first()
        if first_restaurant and first_restaurant.owner is None:
            first_restaurant.owner = owner_user
            first_restaurant.save(update_fields=['owner'])
            self.stdout.write(f'  Owner assigned to: {first_restaurant.name}')

        from django.core.management import call_command
        call_command('generate_slots', days=30)

        # Seed reviewers and sample reviews
        REVIEWERS = [
            {'first_name': 'María',   'last_name': 'García',    'email': 'maria.garcia@example.com'},
            {'first_name': 'Carlos',  'last_name': 'López',     'email': 'carlos.lopez@example.com'},
            {'first_name': 'Ana',     'last_name': 'Martínez',  'email': 'ana.martinez@example.com'},
            {'first_name': 'Javier',  'last_name': 'Sánchez',   'email': 'javier.sanchez@example.com'},
            {'first_name': 'Laura',   'last_name': 'Fernández', 'email': 'laura.fernandez@example.com'},
        ]
        reviewer_users = []
        for r in REVIEWERS:
            u, _ = User.objects.get_or_create(
                username=r['email'],
                defaults={'email': r['email'], 'first_name': r['first_name'], 'last_name': r['last_name']},
            )
            reviewer_users.append(u)

        restaurants = list(Restaurant.objects.order_by('id'))
        SEED_REVIEWS = [
            # (restaurant_idx, reviewer_idx, rating, comment)
            (0, 0, 5, 'Increíble experiencia. La pasta con trufa es simplemente espectacular y el ambiente es acogedor.'),
            (0, 1, 4, 'Muy buena cocina italiana auténtica. Porciones generosas y precios razonables para la calidad.'),
            (0, 2, 5, 'Mejor restaurante italiano de la ciudad sin duda. El osso buco está de otra galaxia.'),
            (1, 0, 5, 'El omakase es una experiencia única. Sushi fresco preparado con una precisión extraordinaria.'),
            (1, 3, 4, 'El ramen de miso es reconfortante y muy auténtico. Servicio rápido y amable.'),
            (2, 1, 5, 'El tomahawk para dos fue una experiencia memorable. La carne dry-aged es excepcional.'),
            (2, 4, 5, 'Calidad de carne sin igual en la ciudad. Punto de cocción perfecto sin necesidad de pedirlo.'),
            (2, 0, 4, 'Caro pero merece cada euro. El solomillo con trufa es espectacular.'),
            (3, 2, 5, 'Los tacos de wagyu son una revelación. Fusión creativa que realmente funciona.'),
            (3, 3, 4, 'El ceviche tataki es delicioso. Ambiente moderno y personal muy atento.'),
            (4, 1, 5, 'El Buddha bowl es enorme y muy nutritivo. Ingredientes ecológicos de gran calidad.'),
            (4, 4, 4, 'Excelente opción vegetariana. El risotto de setas silvestres supera todas las expectativas.'),
            (5, 2, 4, 'La sopa de cebolla es exactamente como en París. Muy buen ambiente bistró.'),
            (5, 0, 5, 'Auténtica cocina francesa. El confit de pato es magistral y las crêpes Suzette un espectáculo.'),
        ]

        reviews_created = 0
        for rest_idx, user_idx, rating, comment in SEED_REVIEWS:
            if rest_idx >= len(restaurants) or user_idx >= len(reviewer_users):
                continue
            _, created = Review.objects.get_or_create(
                user=reviewer_users[user_idx],
                restaurant=restaurants[rest_idx],
                defaults={'rating': rating, 'comment': comment},
            )
            if created:
                reviews_created += 1

        # Recompute ratings from seed reviews
        from django.db.models import Avg, Count
        for restaurant in restaurants:
            agg = Review.objects.filter(restaurant=restaurant).aggregate(avg=Avg('rating'), cnt=Count('id'))
            if agg['avg'] is not None:
                restaurant.rating = round(agg['avg'], 1)
                restaurant.reviews_count = agg['cnt']
                restaurant.save(update_fields=['rating', 'reviews_count'])

        # Seed staff codes only if env vars are explicitly configured
        from api.models import StaffCode
        from django.contrib.auth.hashers import make_password

        owner_code = os.environ.get('STAFF_OWNER_CODE')
        admin_code = os.environ.get('STAFF_ADMIN_CODE')
        owner_email = os.environ.get('STAFF_OWNER_EMAIL', '')

        if owner_code:
            if not StaffCode.objects.filter(role='owner', is_active=True).exists():
                StaffCode.objects.create(
                    code=make_password(owner_code), role='owner', email=owner_email
                )
        else:
            self.stdout.write(self.style.WARNING('STAFF_OWNER_CODE no configurado — se omite el código de propietario.'))

        if admin_code:
            if not StaffCode.objects.filter(role='admin', is_active=True).exists():
                StaffCode.objects.create(
                    code=make_password(admin_code), role='admin', email=''
                )
        else:
            self.stdout.write(self.style.WARNING('STAFF_ADMIN_CODE no configurado — se omite el código de administrador.'))

        self.stdout.write(self.style.SUCCESS(f'Seeded {len(RESTAURANTS)} restaurants + {reviews_created} reviews.'))
