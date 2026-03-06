from django.db import models
from django.contrib.auth.models import User


class Restaurant(models.Model):
    name = models.CharField(max_length=200)
    cuisine = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    distance = models.CharField(max_length=50)
    rating = models.FloatField()
    price_range = models.CharField(max_length=10)
    address = models.CharField(max_length=300)
    description = models.TextField()
    lat = models.FloatField()
    lng = models.FloatField()
    image_url = models.URLField(max_length=500)
    reviews_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-rating']

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, related_name='menu_items', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.FloatField()

    def __str__(self):
        return f"{self.name} ({self.restaurant.name})"


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(User, related_name='reservations', on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, related_name='reservations', on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    guests = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"{self.user.email} @ {self.restaurant.name} on {self.date}"
