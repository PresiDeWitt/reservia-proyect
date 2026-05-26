from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from .encrypted_fields import EncryptedCharField, EncryptedTextField


class Restaurant(models.Model):
    name = models.CharField(max_length=200)
    cuisine = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    distance_km = models.FloatField(default=0.0)
    rating = models.FloatField()
    price_range = models.CharField(max_length=10)
    address = models.CharField(max_length=300)
    description = models.TextField()
    lat = models.FloatField()
    lng = models.FloatField()
    image_url = models.URLField(max_length=500)
    reviews_count = models.IntegerField(default=0)
    owner = models.ForeignKey(
        User, related_name='owned_restaurants', on_delete=models.SET_NULL,
        null=True, blank=True,
    )

    class Meta:
        ordering = ['-rating']
        indexes = [
            models.Index(fields=['cuisine']),
            models.Index(fields=['location']),
        ]

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, related_name='menu_items', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.FloatField()

    def __str__(self):
        return f"{self.name} ({self.restaurant.name})"


class RestaurantTable(models.Model):
    restaurant = models.ForeignKey(Restaurant, related_name='tables', on_delete=models.CASCADE)
    label = models.CharField(max_length=50)
    zone = models.CharField(max_length=50, default='main')
    capacity = models.IntegerField(default=2)
    supplement = models.IntegerField(default=0)
    pos_x = models.FloatField(default=0)
    pos_y = models.FloatField(default=0)
    rotation = models.FloatField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['zone', 'label']

    def __str__(self):
        return f"{self.label} ({self.restaurant.name})"


class AvailabilitySlot(models.Model):
    table = models.ForeignKey(RestaurantTable, related_name='slots', on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['table', 'date', 'time']
        ordering = ['date', 'time']
        indexes = [models.Index(fields=['table', 'date', 'is_available'])]

    def __str__(self):
        return f"{self.table} @ {self.date} {self.time} ({'free' if self.is_available else 'taken'})"


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(User, related_name='reservations', on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, related_name='reservations', on_delete=models.CASCADE)
    assigned_table = models.ForeignKey(
        RestaurantTable, related_name='reservations', on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    class Occasion(models.TextChoices):
        BIRTHDAY = 'birthday', 'Cumpleanos'
        ANNIVERSARY = 'anniversary', 'Aniversario'
        BUSINESS = 'business', 'Negocios'
        OTHER = 'other', 'Otro'

    date = models.DateField()
    time = models.TimeField()
    guests = models.IntegerField()
    occasion = models.CharField(max_length=20, choices=Occasion.choices, blank=True)
    note = EncryptedTextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-time']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['status']),
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f"{self.user.email} @ {self.restaurant.name} on {self.date}"


class Review(models.Model):
    user = models.ForeignKey(User, related_name='reviews', on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, related_name='reviews', on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'restaurant']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['restaurant', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} → {self.restaurant.name} ({self.rating}★)"


class Notification(models.Model):
    class Type(models.TextChoices):
        BOOKING_CONFIRMED = 'booking_confirmed', 'Reserva confirmada'
        BOOKING_CANCELLED = 'booking_cancelled', 'Reserva cancelada'
        BOOKING_REMINDER = 'booking_reminder', 'Recordatorio'
        REVIEW_REQUEST = 'review_request', 'Solicitud de reseña'
        SYSTEM = 'system', 'Sistema'

    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    type = models.CharField(max_length=30, choices=Type.choices)
    title = models.CharField(max_length=200)
    message = models.TextField()
    reservation = models.ForeignKey(
        'Reservation', on_delete=models.SET_NULL, null=True, blank=True
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
        ]


class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    phone = EncryptedCharField(max_length=500, blank=True)

    def __str__(self):
        return f"Profile<{self.user.email}>"


class StaffCode(models.Model):
    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        ADMIN = 'admin', 'Admin'

    code = models.CharField(max_length=100, unique=True)
    role = models.CharField(max_length=20, choices=Role.choices)
    email = EncryptedCharField(max_length=500, blank=True)
    restaurant = models.ForeignKey(
        'Restaurant', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='staff_codes'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role}: {self.code[:8]}..."


class Favorite(models.Model):
    user = models.ForeignKey(User, related_name='favorites', on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, related_name='favorited_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'restaurant']
        ordering = ['-created_at']


from django.db.models.signals import post_save, post_delete
from django.db.models import Avg, Count
from django.dispatch import receiver


@receiver([post_save, post_delete], sender=Review)
def update_restaurant_rating(sender, instance, **kwargs):
    restaurant = instance.restaurant
    agg = Review.objects.filter(restaurant=restaurant).aggregate(
        avg=Avg('rating'), cnt=Count('id')
    )
    restaurant.rating = round(agg['avg'], 1) if agg['avg'] else 0.0
    restaurant.reviews_count = agg['cnt']
    restaurant.save(update_fields=['rating', 'reviews_count'])


@receiver(post_save, sender=Reservation)
def create_reservation_notification(sender, instance, created, **kwargs):
    from .emails import send_booking_confirmation_email, send_booking_cancellation_email

    if created:
        # 1. Crear notificación en base de datos para panel web
        Notification.objects.create(
            user=instance.user,
            type=Notification.Type.BOOKING_CONFIRMED,
            title='Reserva confirmada',
            message=f'Tu reserva en {instance.restaurant.name} para el {instance.date} a las {instance.time} ha sido confirmada.',
            reservation=instance,
        )
        # 2. Despachar email asíncrono con useSend
        send_booking_confirmation_email(instance)
    else:
        # En caso de actualización, si pasa a cancelada
        if instance.status == 'cancelled':
            # 1. Crear notificación en DB de cancelación si no existe ya
            already_exists = Notification.objects.filter(
                user=instance.user,
                reservation=instance,
                type=Notification.Type.BOOKING_CANCELLED
            ).exists()
            
            if not already_exists:
                Notification.objects.create(
                    user=instance.user,
                    type=Notification.Type.BOOKING_CANCELLED,
                    title='Reserva cancelada',
                    message=f'Tu reserva en {instance.restaurant.name} para el {instance.date} ha sido cancelada.',
                    reservation=instance,
                )
            # 2. Despachar email de cancelación con useSend
            send_booking_cancellation_email(instance)


@receiver(post_save, sender=User)
def create_user_welcome_email(sender, instance, created, **kwargs):
    if created:
        from .emails import send_welcome_email
        send_welcome_email(instance)
