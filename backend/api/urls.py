from django.urls import path
from . import views
from .views_favorites import list_favorites, add_favorite, remove_favorite
from .views_notifications import list_notifications, mark_read, mark_all_read, unread_count
from .views_restaurants import nearby_restaurants

urlpatterns = [
    # Auth
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.login_view, name="login"),
    path("auth/google/", views.google_auth_view, name="google-auth"),
    path("auth/staff/", views.staff_login_view, name="staff-login"),
    path("auth/password/reset/", views.password_reset_request, name="password-reset-request"),
    path("auth/password/reset/confirm/", views.password_reset_confirm, name="password-reset-confirm"),
    path("auth/password/change/", views.password_change, name="password-change"),
    # Restaurants
    path("restaurants/", views.RestaurantListView.as_view(), name="restaurant-list"),
    path("restaurants/cuisines/", views.cuisines_view, name="cuisines"),
    path("restaurants/nearby/", nearby_restaurants, name="restaurants-nearby"),
    path(
        "restaurants/<int:pk>/",
        views.RestaurantDetailView.as_view(),
        name="restaurant-detail",
    ),
    path("restaurants/<int:pk>/availability/", views.restaurant_availability, name="restaurant-availability"),
    path("restaurants/<int:pk>/tables/", views.restaurant_tables, name="restaurant-tables"),
    path("restaurants/<int:pk>/reviews/", views.restaurant_reviews, name="restaurant-reviews"),
    # Owner Dashboard
    path("owner/stats/", views.owner_stats, name="owner-stats"),
    path("owner/reservations/", views.owner_reservations, name="owner-reservations"),
    # Admin Dashboard
    path("admin/stats/", views.admin_stats, name="admin-stats"),
    path("admin/top-restaurants/", views.admin_top_restaurants, name="admin-top-restaurants"),
    path("admin/city-distribution/", views.admin_city_distribution, name="admin-city-distribution"),
    # Health
    path("health/", views.health_check, name="health"),
    # AI Chat
    path("chat/", views.chat_view, name="chat"),
    # Reservations
    path(
        "reservations/",
        views.ReservationCreateView.as_view(),
        name="reservation-create",
    ),
    path("reservations/my/", views.my_reservations, name="my-reservations"),
    path("reservations/<int:pk>/", views.cancel_reservation, name="cancel-reservation"),
    # Favorites
    path('favorites/', list_favorites, name='list-favorites'),
    path('favorites/add/', add_favorite, name='add-favorite'),
    path('favorites/<int:restaurant_id>/remove/', remove_favorite, name='remove-favorite'),
    # Notifications
    path('notifications/', list_notifications, name='list-notifications'),
    path('notifications/<int:notification_id>/read/', mark_read, name='mark-notification-read'),
    path('notifications/read-all/', mark_all_read, name='mark-all-notifications-read'),
    path('notifications/unread-count/', unread_count, name='notification-unread-count'),
]
