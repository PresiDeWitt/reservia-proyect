from django.contrib import admin
from .models import Restaurant, MenuItem, Reservation, FloorPlan, Table, Seat, SeatReservation

admin.site.register(Restaurant)
admin.site.register(MenuItem)
admin.site.register(Reservation)
admin.site.register(FloorPlan)
admin.site.register(Table)
admin.site.register(Seat)
admin.site.register(SeatReservation)
