from django.db import models
from django.db.models import Count, Avg, Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Restaurant, Reservation, Review, StaffCode, AdminAuditLog
from .permissions import IsStaffAdmin, get_staff_email


def log_admin_action(request, action, target_type, target_id="", detail=""):
    AdminAuditLog.objects.create(
        admin_email=get_staff_email(request) or "unknown",
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        detail=detail,
    )


@api_view(["GET"])
@permission_classes([IsStaffAdmin])
def admin_stats(request):
    from django.contrib.auth.models import User as DjangoUser

    total_restaurants = Restaurant.objects.count()
    total_users = DjangoUser.objects.count()

    qs = Reservation.objects.all()
    attended_statuses = ['confirmed', 'arrived']
    total_reservations = qs.count()
    confirmed = qs.filter(status__in=attended_statuses).count()
    cancelled = qs.filter(status='cancelled').count()
    total_guests = qs.filter(status__in=attended_statuses).aggregate(s=Sum('guests'))['s'] or 0
    cancellation_rate = round(cancelled / total_reservations * 100, 1) if total_reservations > 0 else 0
    estimated_revenue = total_guests * 35

    return Response({
        "totalRestaurants": total_restaurants,
        "totalUsers": total_users,
        "totalReservations": total_reservations,
        "confirmedReservations": confirmed,
        "cancelledReservations": cancelled,
        "cancellationRate": cancellation_rate,
        "totalGuests": total_guests,
        "estimatedRevenue": estimated_revenue,
    })


@api_view(["GET"])
@permission_classes([IsStaffAdmin])
def admin_top_restaurants(request):
    top = (
        Restaurant.objects.annotate(
            total_reservations=Count('reservations'),
            confirmed_reservations=Count(
                'reservations',
                filter=models.Q(reservations__status__in=['confirmed', 'arrived']),
            ),
        )
        .order_by('-total_reservations')[:20]
    )
    data = [
        {
            "id": r.id,
            "name": r.name,
            "location": r.location,
            "rating": r.rating,
            "totalReservations": r.total_reservations,
            "confirmedReservations": r.confirmed_reservations,
            "estimatedRevenue": r.confirmed_reservations * 35 * 3,
        }
        for r in top
    ]
    return Response({"restaurants": data})


@api_view(["GET"])
@permission_classes([IsStaffAdmin])
def admin_city_distribution(request):
    cities = (
        Restaurant.objects.values('location')
        .annotate(
            restaurant_count=Count('id'),
            avg_rating=Avg('rating'),
            total_reservations=Count('reservations'),
        )
        .order_by('-total_reservations')
    )
    total_restaurants = Restaurant.objects.count()
    data = []
    for c in cities:
        pct = round(c['restaurant_count'] / total_restaurants * 100) if total_restaurants else 0
        data.append({
            "name": c['location'],
            "restaurants": c['restaurant_count'],
            "avgRating": round(c['avg_rating'] or 0, 1),
            "totalReservations": c['total_reservations'],
            "pct": pct,
        })
    return Response({"cities": data})


@api_view(["POST"])
@permission_classes([IsStaffAdmin])
def admin_impersonate_owner(request):
    from rest_framework_simplejwt.tokens import RefreshToken
    from django.contrib.auth.models import User
    from rest_framework import status

    restaurant_id = request.data.get("restaurant_id")
    if not restaurant_id:
        return Response({"error": "Falta restaurant_id"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        restaurant = Restaurant.objects.get(pk=restaurant_id)
    except Restaurant.DoesNotExist:
        return Response({"error": "Restaurante no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    owner = restaurant.owner
    if not owner:
        # If no owner exists, create a default one dynamically
        owner_email = f"owner_{restaurant_id}@reservia.demo"
        owner, _ = User.objects.get_or_create(
            username=owner_email,
            defaults={'email': owner_email, 'first_name': 'Owner', 'last_name': restaurant.name},
        )
        restaurant.owner = owner
        restaurant.save(update_fields=['owner'])

    refresh = RefreshToken.for_user(owner)
    refresh['staff_role'] = 'owner'
    refresh['email'] = owner.email

    return Response({
        "token": str(refresh.access_token),
        "refresh": str(refresh),
        "role": "owner",
    })

