from django.db.models import Sum, Count
from django.db.models.functions import ExtractHour
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Restaurant, Reservation
from .permissions import IsStaffOwner, get_staff_email

OCCASION_LABELS = {
    'birthday': 'Cumpleaños',
    'anniversary': 'Aniversario',
    'business': 'Negocios',
    'other': 'Otro',
}
def _owner_restaurant(request):
    email = get_staff_email(request)
    if not email:
        return None
    return Restaurant.objects.filter(owner__email=email).first()


@api_view(["GET"])
@permission_classes([IsStaffOwner])
def owner_stats(request):
    restaurant = _owner_restaurant(request)
    if restaurant is None:
        return Response({"error": "No tienes ningun restaurante asociado"},
                        status=status.HTTP_403_FORBIDDEN)

    qs = Reservation.objects.filter(restaurant=restaurant)
    attended_statuses = ['confirmed', 'arrived']
    total = qs.count()
    confirmed = qs.filter(status__in=attended_statuses).count()
    cancelled = qs.filter(status='cancelled').count()
    total_guests = qs.filter(status__in=attended_statuses).aggregate(s=Sum('guests'))['s'] or 0
    avg_guests = round(total_guests / confirmed, 1) if confirmed > 0 else 0
    cancellation_rate = round(cancelled / total * 100, 1) if total > 0 else 0

    hour_dist = list(
        qs.filter(status__in=attended_statuses)
        .annotate(hour=ExtractHour('time'))
        .values('hour')
        .annotate(count=Count('id'))
        .order_by('hour')
    )

    return Response({
        "restaurantName": restaurant.name,
        "restaurantCuisine": restaurant.cuisine,
        "totalReservations": total,
        "confirmedReservations": confirmed,
        "cancelledReservations": cancelled,
        "totalGuests": total_guests,
        "avgGuests": avg_guests,
        "cancellationRate": cancellation_rate,
        "hourDistribution": [{"hour": h["hour"], "count": h["count"]} for h in hour_dist],
    })


@api_view(["GET"])
@permission_classes([IsStaffOwner])
def owner_reservations(request):
    restaurant = _owner_restaurant(request)
    if restaurant is None:
        return Response({"error": "No tienes ningun restaurante asociado"},
                        status=status.HTTP_403_FORBIDDEN)

    qs = Reservation.objects.filter(restaurant=restaurant).select_related('user', 'assigned_table')

    filter_status = request.query_params.get('status')
    if filter_status and filter_status != 'all':
        qs = qs.filter(status=filter_status)

    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    if date_from:
        qs = qs.filter(date__gte=date_from)
    if date_to:
        qs = qs.filter(date__lte=date_to)

    search = request.query_params.get('search', '').strip()
    if search:
        qs = (
            qs.filter(user__first_name__icontains=search) |
            qs.filter(user__last_name__icontains=search) |
            qs.filter(user__email__icontains=search)
        )

    page = max(1, int(request.query_params.get('page', 1)))
    page_size = 20
    total = qs.count()
    qs = qs.order_by('-date', '-time')[(page - 1) * page_size: page * page_size]

    data = []
    for r in qs:
        user = r.user
        name = f"{user.first_name} {user.last_name}".strip() or user.email
        data.append({
            "id": r.id,
            "name": name,
            "guests": r.guests,
            "date": r.date.isoformat(),
            "time": r.time.strftime('%H:%M'),
            "status": r.status,
            "table": r.assigned_table.label if r.assigned_table else "—",
            "note": r.note or "",
            "occasion": r.occasion or "",
        })

    return Response({
        "reservations": data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    })


@api_view(["PATCH"])
@permission_classes([IsStaffOwner])
def owner_update_reservation_status(request, pk):
    restaurant = _owner_restaurant(request)
    if restaurant is None:
        return Response({"error": "No tienes ningún restaurante asociado"},
                        status=status.HTTP_403_FORBIDDEN)

    try:
        reservation = Reservation.objects.get(pk=pk, restaurant=restaurant)
    except Reservation.DoesNotExist:
        return Response({"error": "Reserva no encontrada"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status", "").strip()
    allowed = {"arrived", "no_show", "confirmed"}
    if new_status not in allowed:
        return Response(
            {"error": f"Estado no válido. Valores permitidos: {sorted(allowed)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    reservation.status = new_status
    reservation.save(update_fields=["status"])
    return Response({"id": reservation.id, "status": reservation.status})
