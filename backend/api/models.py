from django.db import models
from django.contrib.auth.models import User
from django.db.models import Avg
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


class Restaurant(models.Model):
    owner = models.ForeignKey(
        User,
        related_name="owned_restaurants",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=200)
    cuisine = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    distance = models.CharField(max_length=50)
    rating = models.FloatField(default=0.0)
    price_range = models.CharField(max_length=10)
    address = models.CharField(max_length=300)
    description = models.TextField()
    lat = models.FloatField()
    lng = models.FloatField()
    image_url = models.URLField(max_length=500)
    reviews_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["-rating"]

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
    zone = models.CharField(max_length=50, default='main')   # main | terrace | private
    capacity = models.IntegerField(default=2)
    supplement = models.IntegerField(default=0)               # EUR
    pos_x = models.FloatField(default=0)
    pos_y = models.FloatField(default=0)
    rotation = models.FloatField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['zone', 'label']

    def __str__(self):
        return f"{self.label} ({self.zone}) @ {self.restaurant.name}"


class AvailabilitySlot(models.Model):
    table = models.ForeignKey(RestaurantTable, related_name='slots', on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['table', 'date', 'time']
        ordering = ['date', 'time']
        indexes = [
            models.Index(fields=['table', 'date', 'is_available']),
        ]

    def __str__(self):
        status = "Available" if self.is_available else "Reserved"
        return f"{self.table.label} on {self.date} {self.time} - {status}"


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(User, related_name='reservations', on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, related_name='reservations', on_delete=models.CASCADE)
    assigned_table = models.ForeignKey(
        RestaurantTable,
        related_name="reservations",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    date = models.DateField()
    time = models.TimeField()
    guests = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"{self.user.email} @ {self.restaurant.name} on {self.date}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    phone = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return f"Profile<{self.user.email}>"


# ---------- Social Models (Favorites, Reviews, Notifications) ----------

class Favorite(models.Model):
    user = models.ForeignKey(User, related_name='favorites', on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, related_name='favorited_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'restaurant']

    def __str__(self):
        return f"{self.user.email} favorited {self.restaurant.name}"


class Review(models.Model):
    user = models.ForeignKey(User, related_name='reviews', on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, related_name='reviews', on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)  # 1-5 overall
    food_rating = models.IntegerField(default=5)
    service_rating = models.IntegerField(default=5)
    ambiance_rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'restaurant']
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user.email} for {self.restaurant.name} ({self.rating}/5)"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_reminder', 'Booking Reminder'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('review_request', 'Review Request'),
        ('system', 'System'),
    ]
    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default='system')
    title = models.CharField(max_length=200)
    message = models.TextField()
    reservation = models.ForeignKey(
        Reservation,
        related_name="notifications",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.email}: {self.title}"


# ---------- Signals to Recalculate Restaurant Rating/Review Count ----------

@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def update_restaurant_rating(sender, instance, **kwargs):
    restaurant = instance.restaurant
    reviews = restaurant.reviews.all()
    count = reviews.count()
    if count > 0:
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
        restaurant.rating = round(avg_rating, 2)
    else:
        restaurant.rating = 0.0
    restaurant.reviews_count = count
    restaurant.save()

