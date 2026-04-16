from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Restaurant, MenuItem, Reservation


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
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

    class Meta:
        model = User
        fields = ['id', 'name', 'email']


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
        fields = ['id', 'name', 'cuisine', 'location', 'distance', 'rating',
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

    class Meta:
        model = Reservation
        fields = [
            'id', 'restaurantId', 'restaurantName', 'restaurantAddress',
            'restaurantImage', 'restaurantCuisine', 'date', 'time',
            'guests', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def validate_guests(self, value):
        if value < 1 or value > 20:
            raise serializers.ValidationError('Guests must be between 1 and 20.')
        return value
