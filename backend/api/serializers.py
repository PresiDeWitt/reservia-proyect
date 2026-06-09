from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Restaurant, MenuItem, Reservation, Review


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=30)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password', 'phone']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def create(self, validated_data):
        from .models import UserProfile
        phone = validated_data.pop('phone', '')
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user, phone=phone)
        return user


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name')
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role']

    def get_role(self, obj):
        from .models import StaffCode
        if obj.is_superuser:
            return 'admin'
        email = obj.email.lower()
        sc = StaffCode.objects.filter(email=email, is_active=True).first()
        if sc:
            return sc.role
        return 'customer'


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price']


class RestaurantListSerializer(serializers.ModelSerializer):
    priceRange = serializers.CharField(source='price_range')
    image = serializers.URLField(source='image_url')
    reviewsCount = serializers.IntegerField(source='reviews_count')
    coords = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'cuisine', 'location', 'distance_km', 'rating',
                  'priceRange', 'address', 'image', 'reviewsCount', 'coords']

    def get_coords(self, obj):
        return [obj.lat, obj.lng]


class RestaurantDetailSerializer(RestaurantListSerializer):
    menuItems = MenuItemSerializer(source='menu_items', many=True, read_only=True)
    description = serializers.CharField()

    class Meta(RestaurantListSerializer.Meta):
        fields = RestaurantListSerializer.Meta.fields + ['description', 'menuItems']


class ReservationSerializer(serializers.ModelSerializer):
    restaurantId = serializers.PrimaryKeyRelatedField(
        source='restaurant', queryset=Restaurant.objects.all()
    )
    restaurantName = serializers.CharField(source='restaurant.name', read_only=True)
    restaurantAddress = serializers.CharField(source='restaurant.address', read_only=True)
    restaurantImage = serializers.URLField(source='restaurant.image_url', read_only=True)
    restaurantCuisine = serializers.CharField(source='restaurant.cuisine', read_only=True)
    occasion = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')

    class Meta:
        model = Reservation
        fields = [
            'id', 'restaurantId', 'restaurantName', 'restaurantAddress',
            'restaurantImage', 'restaurantCuisine', 'date', 'time',
            'guests', 'occasion', 'note', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def validate_guests(self, value):
        if value < 1 or value > 20:
            raise serializers.ValidationError('Guests must be between 1 and 20.')
        return value


class ReviewSerializer(serializers.ModelSerializer):
    userName = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'userName', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_userName(self, obj):
        name = obj.user.get_full_name().strip()
        return name if name else obj.user.email.split('@')[0]

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value
