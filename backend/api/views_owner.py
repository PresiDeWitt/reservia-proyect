from django.db.models import Sum, Count
from django.db.models.functions import ExtractHour
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Restaurant, Reservation, MenuItem, RestaurantTable
from .permissions import IsStaffOwner, get_staff_email
def _owner_restaurant(request):
    email = get_staff_email(request)
    if not email:
        return None
    return Restaurant.objects.filter(owner__email=email).first()


def _validate_menu_payload(data, partial=False):
    if "name" in data or not partial:
        if not str(data.get("name", "")).strip():
            return "El nombre es obligatorio"
    if "price" in data or not partial:
        try:
            price = float(data.get("price", 0))
        except (TypeError, ValueError):
            return "Precio no válido"
        if price <= 0:
            return "El precio debe ser mayor que 0"
    return None


def _validate_table_payload(data, partial=False):
    if "label" in data or not partial:
        if not str(data.get("label", "")).strip():
            return "La etiqueta es obligatoria"
    if "capacity" in data or not partial:
        try:
            capacity = int(data.get("capacity", 0))
        except (TypeError, ValueError):
            return "Capacidad no válida"
        if capacity <= 0:
            return "La capacidad debe ser mayor que 0"
    if "supplement" in data:
        try:
            if int(data["supplement"]) < 0:
                return "El suplemento no puede ser negativo"
        except (TypeError, ValueError):
            return "Suplemento no válido"
    return None


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


@api_view(["GET", "PATCH"])
@permission_classes([IsStaffOwner])
def owner_profile(request):
    restaurant = _owner_restaurant(request)
    if restaurant is None:
        return Response({"error": "No tienes ningun restaurante asociado"},
                        status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        return Response({
            "id": restaurant.id,
            "name": restaurant.name,
            "cuisine": restaurant.cuisine,
            "address": restaurant.address,
            "description": restaurant.description,
            "location": restaurant.location,
            "price_range": restaurant.price_range,
            "image_url": restaurant.image_url,
            "lat": restaurant.lat,
            "lng": restaurant.lng,
            "capacity": restaurant.capacity,
            "phone": "",  # pending profile field
        })

    data = request.data
    if "name" in data and not str(data["name"]).strip():
        return Response({"error": "El nombre no puede estar vacío"},
                        status=status.HTTP_400_BAD_REQUEST)
    for field in ("name", "cuisine", "address", "description",
                  "location", "price_range", "image_url"):
        if field in data:
            setattr(restaurant, field, data[field])
    if "lat" in data and "lng" in data:
        restaurant.lat = float(data["lat"])
        restaurant.lng = float(data["lng"])
    if "capacity" in data:
        try:
            restaurant.capacity = max(0, int(data["capacity"]))
        except (TypeError, ValueError):
            return Response({"error": "Capacidad no válida"},
                            status=status.HTTP_400_BAD_REQUEST)
    restaurant.save()
    return Response({"message": "Restaurante actualizado", "id": restaurant.id})


# ── Menu items ──────────────────────────────────────────────────────────────
@api_view(["GET", "POST"])
@permission_classes([IsStaffOwner])
def owner_menu_items(request):
    restaurant = _owner_restaurant(request)
    if restaurant is None:
        return Response({"error": "No tienes ningun restaurante asociado"},
                        status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        items = restaurant.menu_items.all().values("id", "name", "description", "price")
        return Response(list(items))

    data = request.data
    err = _validate_menu_payload(data)
    if err:
        return Response({"error": err}, status=status.HTTP_400_BAD_REQUEST)
    item = MenuItem.objects.create(
        restaurant=restaurant,
        name=data.get("name", ""),
        description=data.get("description", ""),
        price=float(data.get("price", 0)),
    )
    return Response({"id": item.id, "name": item.name, "description": item.description,
                     "price": item.price}, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsStaffOwner])
def owner_menu_item_detail(request, pk):
    restaurant = _owner_restaurant(request)
    if restaurant is None:
        return Response({"error": "No tienes ningun restaurante asociado"},
                        status=status.HTTP_403_FORBIDDEN)
    try:
        item = MenuItem.objects.get(pk=pk, restaurant=restaurant)
    except MenuItem.DoesNotExist:
        return Response({"error": "Elemento del menu no encontrado"},
                        status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        item.delete()
        return Response({"message": "Elemento eliminado"}, status=status.HTTP_204_NO_CONTENT)

    data = request.data
    err = _validate_menu_payload(data, partial=True)
    if err:
        return Response({"error": err}, status=status.HTTP_400_BAD_REQUEST)
    for field in ("name", "description", "price"):
        if field in data:
            val = float(data[field]) if field == "price" else data[field]
            setattr(item, field, val)
    item.save()
    return Response({"id": item.id, "name": item.name, "description": item.description,
                     "price": item.price})


# ── Tables ──────────────────────────────────────────────────────────────────
@api_view(["GET", "POST"])
@permission_classes([IsStaffOwner])
def owner_tables(request):
    restaurant = _owner_restaurant(request)
    if restaurant is None:
        return Response({"error": "No tienes ningun restaurante asociado"},
                        status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        tables = restaurant.tables.all().values(
            "id", "label", "zone", "capacity", "supplement",
            "pos_x", "pos_y", "rotation", "is_active",
        )
        return Response(list(tables))

    data = request.data
    err = _validate_table_payload(data)
    if err:
        return Response({"error": err}, status=status.HTTP_400_BAD_REQUEST)
    table = RestaurantTable.objects.create(
        restaurant=restaurant,
        label=data.get("label", ""),
        zone=data.get("zone", "main"),
        capacity=int(data.get("capacity", 2)),
        supplement=int(data.get("supplement", 0)),
        pos_x=float(data.get("pos_x", 0)),
        pos_y=float(data.get("pos_y", 0)),
        rotation=float(data.get("rotation", 0)),
        is_active=bool(data.get("is_active", True)),
    )
    return Response({"id": table.id, "label": table.label, "zone": table.zone,
                     "capacity": table.capacity}, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsStaffOwner])
def owner_table_detail(request, pk):
    restaurant = _owner_restaurant(request)
    if restaurant is None:
        return Response({"error": "No tienes ningun restaurante asociado"},
                        status=status.HTTP_403_FORBIDDEN)
    try:
        table = RestaurantTable.objects.get(pk=pk, restaurant=restaurant)
    except RestaurantTable.DoesNotExist:
        return Response({"error": "Mesa no encontrada"},
                        status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        table.delete()
        return Response({"message": "Mesa eliminada"}, status=status.HTTP_204_NO_CONTENT)

    data = request.data
    err = _validate_table_payload(data, partial=True)
    if err:
        return Response({"error": err}, status=status.HTTP_400_BAD_REQUEST)
    for field in ("label", "zone", "capacity", "supplement", "pos_x", "pos_y", "rotation", "is_active"):
        if field in data:
            val = data[field]
            if field in ("capacity", "supplement"):
                val = int(val)
            elif field in ("pos_x", "pos_y", "rotation"):
                val = float(val)
            elif field == "is_active":
                val = bool(val)
            setattr(table, field, val)
    table.save()
    return Response({"id": table.id, "label": table.label, "zone": table.zone,
                     "capacity": table.capacity})
