from django.urls import path
from . import views_auth
from . import views_restaurants
from . import views_reservations
from . import views_chat
from . import views_owner
from . import views_admin
from . import views_reviews
from . import views_system
from .views_favorites import list_favorites, add_favorite, remove_favorite
from .views_notifications import list_notifications, mark_read, mark_all_read, unread_count

urlpatterns = [
    # Auth
    path("auth/register/", views_auth.RegisterView.as_view(), name="register"),
    path("auth/login/", views_auth.login_view, name="login"),
    path("auth/google/", views_auth.google_auth_view, name="google-auth"),
    path("auth/staff/", views_auth.staff_login_view, name="staff-login"),
    path("auth/password/reset/", views_auth.password_reset_request, name="password-reset-request"),
    path("auth/password/reset/confirm/", views_auth.password_reset_confirm, name="password-reset-confirm"),
    path("auth/password/change/", views_auth.password_change, name="password-change"),
    # Restaurants
    path("restaurants/", views_restaurants.RestaurantListView.as_view(), name="restaurant-list"),
    path("restaurants/cuisines/", views_restaurants.cuisines_view, name="cuisines"),
    path("restaurants/nearby/", views_restaurants.nearby_restaurants, name="restaurants-nearby"),
    path(
        "restaurants/<int:pk>/",
        views_restaurants.RestaurantDetailView.as_view(),
        name="restaurant-detail",
    ),
    path("restaurants/<int:pk>/availability/", views_restaurants.restaurant_availability, name="restaurant-availability"),
    path("restaurants/<int:pk>/tables/", views_restaurants.restaurant_tables, name="restaurant-tables"),
    path("restaurants/<int:pk>/reviews/", views_reviews.restaurant_reviews, name="restaurant-reviews"),
    # Owner Dashboard
    path("owner/stats/", views_owner.owner_stats, name="owner-stats"),
    path("owner/reservations/", views_owner.owner_reservations, name="owner-reservations"),
    path("owner/reservations/<int:pk>/status/", views_owner.owner_update_reservation_status, name="owner-reservation-status"),
    # Admin Dashboard
    path("admin/stats/", views_admin.admin_stats, name="admin-stats"),
    path("admin/top-restaurants/", views_admin.admin_top_restaurants, name="admin-top-restaurants"),
    path("admin/city-distribution/", views_admin.admin_city_distribution, name="admin-city-distribution"),
    # Health
    path("health/", views_system.health_check, name="health"),
    # AI Chat
    path("chat/", views_chat.chat_view, name="chat"),
    # Reservations
    path(
        "reservations/",
        views_reservations.ReservationCreateView.as_view(),
        name="reservation-create",
    ),
    path("reservations/my/", views_reservations.my_reservations, name="my-reservations"),
    path("reservations/<int:pk>/", views_reservations.cancel_reservation, name="cancel-reservation"),
    path("reservations/<int:pk>/edit/", views_reservations.edit_reservation, name="edit-reservation"),
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
