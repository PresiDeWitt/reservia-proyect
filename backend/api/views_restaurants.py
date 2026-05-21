from datetime import date as date_type, time as time_type

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .constants import SERVICE_HOURS
from .models import Restaurant, RestaurantTable, AvailabilitySlot
from .pagination import StandardPagination
from .serializers import RestaurantListSerializer, RestaurantDetailSerializer


class RestaurantListView(generics.ListAPIView):
    serializer_class = RestaurantListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Restaurant.objects.all()
        search = self.request.query_params.get("search", "")
        cuisine = self.request.query_params.get("cuisine", "")
        if search:
            qs = (
                qs.filter(name__icontains=search)
                | qs.filter(cuisine__icontains=search)
                | qs.filter(location__icontains=search)
            )
        if cuisine:
            qs = qs.filter(cuisine__iexact=cuisine)
        return qs.order_by("-rating")


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def cuisines_view(request):
    cuisines = (
        Restaurant.objects.values_list("cuisine", flat=True)
        .distinct()
        .order_by("cuisine")
    )
    return Response(list(cuisines))


class RestaurantDetailView(generics.RetrieveAPIView):
    queryset = Restaurant.objects.prefetch_related("menu_items")
    serializer_class = RestaurantDetailSerializer
    permission_classes = [permissions.AllowAny]


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def restaurant_availability(request, pk):
    try:
        restaurant = Restaurant.objects.get(pk=pk)
    except Restaurant.DoesNotExist:
        return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

    raw_date = request.query_params.get("date")
    if not raw_date:
        return Response({"error": "date query param required (YYYY-MM-DD)"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        from datetime import datetime
        req_date = datetime.strptime(raw_date, "%Y-%m-%d").date()
    except ValueError:
        return Response({"error": "Invalid date format, use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

    if req_date < date_type.today():
        return Response({"error": "Cannot check availability for past dates"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        guests = int(request.query_params.get("guests", 1))
    except ValueError:
        return Response({"error": "guests must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

    active_tables = RestaurantTable.objects.filter(
        restaurant=restaurant, is_active=True, capacity__gte=guests,
    ).values_list('id', flat=True)

    available_times = set(
        AvailabilitySlot.objects.filter(
            table_id__in=active_tables,
            date=req_date,
            is_available=True,
        ).values_list('time', flat=True)
    )

    slots = []
    for service, hours in SERVICE_HOURS.items():
        for h in hours:
            t = time_type.fromisoformat(h)
            slots.append({
                "time": h,
                "service": service,
                "available": t in available_times,
            })

    return Response({"date": raw_date, "guests": guests, "slots": slots})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def restaurant_tables(request, pk):
    try:
        restaurant = Restaurant.objects.get(pk=pk)
    except Restaurant.DoesNotExist:
        return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

    raw_date = request.query_params.get("date")
    raw_time = request.query_params.get("time")

    available_ids: set | None = None
    if raw_date and raw_time:
        try:
            from datetime import datetime
            req_date = datetime.strptime(raw_date, "%Y-%m-%d").date()
            req_time = datetime.strptime(raw_time, "%H:%M").time()
        except ValueError:
            return Response({"error": "Invalid date/time format"}, status=status.HTTP_400_BAD_REQUEST)
        available_ids = set(
            AvailabilitySlot.objects.filter(
                table__restaurant=restaurant,
                date=req_date,
                time=req_time,
                is_available=True,
            ).values_list('table_id', flat=True)
        )

    tables = RestaurantTable.objects.filter(restaurant=restaurant, is_active=True)
    result = []
    for t in tables:
        item = {
            "id": t.id,
            "label": t.label,
            "zone": t.zone,
            "capacity": t.capacity,
            "supplement": t.supplement,
            "posX": t.pos_x,
            "posY": t.pos_y,
            "rotation": t.rotation,
        }
        if available_ids is not None:
            item["available"] = t.id in available_ids
        else:
            item["available"] = True
        result.append(item)

    return Response({"tables": result})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def nearby_restaurants(request):
    try:
        lat = float(request.query_params["lat"])
        lng = float(request.query_params["lng"])
    except (KeyError, ValueError):
        return Response({"error": "lat and lng are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        radius = float(request.query_params.get("radius", 5))
    except ValueError:
        return Response({"error": "radius must be a number"}, status=status.HTTP_400_BAD_REQUEST)

    from math import asin, cos, radians, sin, sqrt

    def haversine(lat1, lon1, lat2, lon2):
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat, dlon = lat2 - lat1, lon2 - lon1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        return 2 * 6371 * asin(sqrt(a))

    nearby = []
    for r in Restaurant.objects.all():
        dist = haversine(lat, lng, r.lat, r.lng)
        if dist <= radius:
            nearby.append((dist, r))

    nearby.sort(key=lambda x: x[0])

    items = []
    for dist, r in nearby:
        data = RestaurantListSerializer(r).data
        data["distance_km"] = round(dist, 2)
        items.append(data)

    return Response({"items": items, "total": len(items)})
