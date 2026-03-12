from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Restaurant, MenuItem, Reservation, FloorPlan, Table, Seat, SeatReservation


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            password=validated_data['password'],
        )
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
    seatIds = serializers.ListField(
        child=serializers.IntegerField(), required=False, default=list, write_only=True
    )
    seats = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'restaurantId', 'restaurantName', 'restaurantAddress',
            'restaurantImage', 'restaurantCuisine', 'date', 'time',
            'guests', 'status', 'created_at', 'seatIds', 'seats',
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def get_seats(self, obj):
        seat_reservations = obj.seat_reservations.select_related('seat', 'seat__table').all()
        return [
            {'id': sr.seat.id, 'label': sr.seat.label, 'tableLabel': sr.seat.table.label}
            for sr in seat_reservations
        ]

    def validate_guests(self, value):
        if value < 1 or value > 20:
            raise serializers.ValidationError('Guests must be between 1 and 20.')
        return value

    def validate(self, attrs):
        seat_ids = attrs.get('seatIds', [])
        if seat_ids:
            restaurant = attrs['restaurant']
            seats = Seat.objects.filter(id__in=seat_ids, table__floor_plan__restaurant=restaurant)
            if seats.count() != len(seat_ids):
                raise serializers.ValidationError('One or more seats do not belong to this restaurant.')
            if len(seat_ids) != attrs['guests']:
                raise serializers.ValidationError('Number of selected seats must match number of guests.')
            occupied = SeatReservation.objects.filter(
                seat_id__in=seat_ids,
                reservation__date=attrs['date'],
                reservation__time=attrs['time'],
                reservation__status='confirmed',
            ).exists()
            if occupied:
                raise serializers.ValidationError('One or more seats are already taken for this time slot.')
        return attrs

    def create(self, validated_data):
        seat_ids = validated_data.pop('seatIds', [])
        reservation = super().create(validated_data)
        for seat_id in seat_ids:
            SeatReservation.objects.create(reservation=reservation, seat_id=seat_id)
        return reservation


# ---------- Floor Plan Serializers ----------

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'seat_index', 'label']


class TableSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Table
        fields = ['id', 'label', 'shape', 'x', 'y', 'width', 'height',
                  'rotation', 'capacity', 'min_capacity', 'seats']


class FloorPlanSerializer(serializers.ModelSerializer):
    tables = TableSerializer(many=True, read_only=True)

    class Meta:
        model = FloorPlan
        fields = ['id', 'width', 'height', 'background_color', 'updated_at', 'tables']


class TableEditorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'label', 'shape', 'x', 'y', 'width', 'height',
                  'rotation', 'capacity', 'min_capacity']
        read_only_fields = ['id']

    def create(self, validated_data):
        table = super().create(validated_data)
        self._sync_seats(table)
        return table

    def update(self, instance, validated_data):
        table = super().update(instance, validated_data)
        self._sync_seats(table)
        return table

    def _sync_seats(self, table):
        table.seats.all().delete()
        labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        for i in range(table.capacity):
            Seat.objects.create(
                table=table, seat_index=i,
                label=f"{table.label}-{labels[i % 26]}",
            )
