from django.contrib import admin
from .models import Restaurant, MenuItem, Reservation

admin.site.register(Restaurant)
admin.site.register(MenuItem)
admin.site.register(Reservation)
