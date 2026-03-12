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


class FloorPlan(models.Model):
    restaurant = models.OneToOneField(
        Restaurant, related_name='floor_plan', on_delete=models.CASCADE
    )
    width = models.IntegerField(default=1000)
    height = models.IntegerField(default=700)
    background_color = models.CharField(max_length=7, default='#F8F9FA')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"FloorPlan for {self.restaurant.name}"


class Table(models.Model):
    SHAPE_CHOICES = [
        ('round', 'Round'),
        ('square', 'Square'),
        ('rectangular', 'Rectangular'),
    ]
    floor_plan = models.ForeignKey(
        FloorPlan, related_name='tables', on_delete=models.CASCADE
    )
    label = models.CharField(max_length=10)
    shape = models.CharField(max_length=20, choices=SHAPE_CHOICES, default='round')
    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField(default=80)
    height = models.FloatField(default=80)
    rotation = models.FloatField(default=0)
    capacity = models.IntegerField(default=4)
    min_capacity = models.IntegerField(default=1)

    class Meta:
        ordering = ['label']

    def __str__(self):
        return f"{self.label} ({self.floor_plan.restaurant.name})"


class Seat(models.Model):
    table = models.ForeignKey(
        Table, related_name='seats', on_delete=models.CASCADE
    )
    seat_index = models.IntegerField()
    label = models.CharField(max_length=10)

    class Meta:
        ordering = ['seat_index']
        unique_together = [('table', 'seat_index')]

    def __str__(self):
        return f"{self.label} at {self.table.label}"


class SeatReservation(models.Model):
    reservation = models.ForeignKey(
        Reservation, related_name='seat_reservations', on_delete=models.CASCADE
    )
    seat = models.ForeignKey(
        Seat, related_name='reservations', on_delete=models.CASCADE
    )

    class Meta:
        unique_together = [('reservation', 'seat')]

    def __str__(self):
        return f"Seat {self.seat.label} -> Reservation #{self.reservation.pk}"
