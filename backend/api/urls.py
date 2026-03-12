from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.login_view, name='login'),

    # Restaurants
    path('restaurants/', views.RestaurantListView.as_view(), name='restaurant-list'),
    path('restaurants/cuisines/', views.cuisines_view, name='cuisines'),
    path('restaurants/<int:pk>/', views.RestaurantDetailView.as_view(), name='restaurant-detail'),

    # AI Chat
    path('chat/', views.chat_view, name='chat'),

    # Reservations
    path('reservations/', views.ReservationCreateView.as_view(), name='reservation-create'),
    path('reservations/my/', views.my_reservations, name='my-reservations'),
    path('reservations/<int:pk>/', views.cancel_reservation, name='cancel-reservation'),

    # Floor Plan
    path('restaurants/<int:restaurant_id>/floor-plan/', views.floor_plan_view, name='floor-plan'),
    path('restaurants/<int:restaurant_id>/availability/', views.seat_availability_view, name='seat-availability'),
    path('restaurants/<int:restaurant_id>/floor-plan/edit/', views.floor_plan_editor_view, name='floor-plan-edit'),
]
