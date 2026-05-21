import os
from datetime import timezone as dt_timezone
from datetime import datetime

from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from datetime import date as date_type, time as time_type

from django.db import models
from django.db.models import Avg, Count, Sum
from django.shortcuts import get_object_or_404
from django.db.models.functions import ExtractHour

from .models import Restaurant, Reservation, RestaurantTable, AvailabilitySlot, Review
from .pagination import StandardPagination
from .permissions import IsStaffOwner, IsStaffAdmin, get_staff_email

SERVICE_HOURS = {
    'lunch':  ['13:00', '13:30', '14:00', '14:30', '15:00'],
    'dinner': ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'],
}
from .throttling import ChatRateThrottle, LoginRateThrottle, PasswordResetRateThrottle, RegisterRateThrottle
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    RestaurantListSerializer,
    RestaurantDetailSerializer,
    ReservationSerializer,
    ReviewSerializer,
)


# ---------- Auth ----------


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    from django.contrib.auth import authenticate

    email = request.data.get("email", "")
    password = request.data.get("password", "")
    user = authenticate(username=email, password=password)
    if not user:
        return Response(
            {"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED
        )
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }
    )


# ---------- Staff Auth ----------


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([LoginRateThrottle])
def staff_login_view(request):
    code = request.data.get("code", "").strip()

    if not code:
        return Response(
            {"error": "Access code required"}, status=status.HTTP_400_BAD_REQUEST
        )

    owner_code = os.environ.get("STAFF_OWNER_CODE", "")
    admin_code = os.environ.get("STAFF_ADMIN_CODE", "")

    if not owner_code or not admin_code:
        return Response(
            {"error": "Staff access not configured"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    role = None
    if code == owner_code:
        role = "owner"
    elif code == admin_code:
        role = "admin"

    if not role:
        return Response(
            {"error": "Invalid access code"}, status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken()
    refresh["staff_role"] = role
    if role == "owner":
        owner_email = os.environ.get("STAFF_OWNER_EMAIL", "owner@reservia.demo")
        refresh["email"] = owner_email

    return Response(
        {
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "role": role,
        }
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_auth_view(request):
    from django.conf import settings as django_settings
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests

    credential = request.data.get('credential', '')
    if not credential:
        return Response({'error': 'Missing credential'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        info = id_token.verify_oauth2_token(
            credential, google_requests.Request(), django_settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        return Response({'error': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)

    email = info.get('email')
    if not email or not info.get('email_verified'):
        return Response({'error': 'Email not verified by Google'}, status=status.HTTP_401_UNAUTHORIZED)

    user, created = User.objects.get_or_create(
        username=email,
        defaults={
            'email': email,
            'first_name': info.get('given_name', ''),
            'last_name': info.get('family_name', ''),
        },
    )
    if created:
        user.set_unusable_password()
        user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        'token': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    })


# ---------- Password Reset / Change ----------


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([PasswordResetRateThrottle])
def password_reset_request(request):
    from django.contrib.auth.tokens import default_token_generator
    from django.utils.http import urlsafe_base64_encode
    from django.utils.encoding import force_bytes
    from django.conf import settings as django_settings
    from django.core.mail import send_mail

    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)

    # Always return the same message to avoid email enumeration
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'Si ese email está registrado recibirás un enlace en breve.'})

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    frontend_url = getattr(django_settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

    send_mail(
        subject='Restablecer contraseña — ReserVia',
        message=(
            f'Hola {user.first_name or user.email},\n\n'
            f'Haz clic en el siguiente enlace para restablecer tu contraseña:\n\n'
            f'{reset_link}\n\n'
            f'Este enlace expira en 24 horas. Si no solicitaste este cambio, ignora este mensaje.\n\n'
            f'— El equipo de ReserVia'
        ),
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return Response({'message': 'Si ese email está registrado recibirás un enlace en breve.'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    from django.contrib.auth.tokens import default_token_generator
    from django.utils.http import urlsafe_base64_decode
    from django.utils.encoding import force_str

    uid = request.data.get('uid', '').strip()
    token = request.data.get('token', '').strip()
    new_password = request.data.get('new_password', '')

    if not uid or not token or not new_password:
        return Response({'error': 'uid, token y new_password son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({'error': 'La contraseña debe tener al menos 8 caracteres'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_pk)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Enlace inválido'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Enlace inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Contraseña actualizada correctamente'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def password_change(request):
    current_password = request.data.get('current_password', '')
    new_password = request.data.get('new_password', '')

    if not current_password or not new_password:
        return Response({'error': 'current_password y new_password son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.check_password(current_password):
        return Response({'error': 'La contraseña actual es incorrecta'}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 8:
        return Response({'error': 'La nueva contraseña debe tener al menos 8 caracteres'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()
    return Response({'message': 'Contraseña cambiada correctamente'})


# ---------- Restaurants ----------


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


# ---------- Reservations ----------


class ReservationCreateView(generics.CreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError as DRFValidationError
        restaurant = serializer.validated_data['restaurant']
        res_date = serializer.validated_data['date']
        res_time = serializer.validated_data['time']
        guests = serializer.validated_data['guests']

        reservation_dt = datetime.combine(res_date, res_time)
        if reservation_dt <= datetime.now():
            raise DRFValidationError({'detail': 'No puedes reservar una hora que ya ha pasado.'})

        slot = (
            AvailabilitySlot.objects
            .select_for_update()
            .filter(
                is_available=True,
                date=res_date,
                time=res_time,
                table__restaurant=restaurant,
                table__is_active=True,
                table__capacity__gte=guests,
            )
            .select_related('table')
            .order_by('table__capacity')
            .first()
        )
        if slot is None:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'No hay mesas disponibles para esa fecha, hora y número de comensales.'})

        slot.is_available = False
        slot.save(update_fields=['is_available'])
        serializer.save(user=self.request.user, assigned_table=slot.table)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def my_reservations(request):
    reservations = Reservation.objects.filter(user=request.user).select_related(
        "restaurant"
    )
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


# ---------- AI Chat ----------


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([ChatRateThrottle])
def chat_view(request):
    import requests as http_requests
    import logging
    from django.conf import settings as django_settings

    logger = logging.getLogger(__name__)

    message = request.data.get("message", "").strip()
    history = request.data.get("history", [])
    lat = request.data.get("lat")
    lng = request.data.get("lng")

    if not message:
        return Response(
            {"error": "Message required"}, status=status.HTTP_400_BAD_REQUEST
        )

    api_key = getattr(django_settings, "OPENROUTER_API_KEY", "")
    if not api_key:
        return Response(
            {"error": "AI service not configured"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    restaurants = Restaurant.objects.only("id", "name", "cuisine", "rating", "price_range", "address", "description", "lat", "lng")
    restaurant_lines = []
    for r in restaurants[:30]:
        restaurant_lines.append(
            f"- {r.name} | {r.cuisine} | {r.rating}/5 | {r.price_range} | {r.address}"
            + (f" | {r.description[:80]}" if r.description else "")
        )

    location_note = ""
    if lat and lng:
        location_note = (
            f"\nUser GPS: lat={lat:.4f}, lng={lng:.4f}. "
            "Mention distance or closeness when relevant using restaurant coordinates."
        )

    system_prompt = (
        "You are ReserVia's friendly AI assistant. "
        "ReserVia is a restaurant reservation platform. "
        "Help users find the perfect restaurant and guide them to book.\n\n"
        "Available restaurants:\n"
        + "\n".join(restaurant_lines)
        + location_note
        + "\n\nRules:\n"
        "- Only recommend restaurants listed above.\n"
        "- Be concise, warm and helpful.\n"
        "- Mention name, cuisine, rating, price range and why it fits.\n"
        "- To book, tell the user to click the restaurant name on the home page.\n"
        "- Respond in the same language the user writes in (Spanish or English).\n"
        "- Keep answers under 200 words."
    )

    safe_history = [
        {"role": m["role"], "content": m["content"]}
        for m in history
        if m.get("role") in ("user", "assistant") and m.get("content")
    ]
    safe_history.insert(0, {"role": "system", "content": system_prompt})
    safe_history.append({"role": "user", "content": message})

    try:
        resp = http_requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemma-3-4b-it:free",
                "messages": safe_history,
                "max_tokens": 400,
            },
            timeout=20,
        )
        data = resp.json()
        reply = data["choices"][0]["message"]["content"]
    except http_requests.Timeout:
        logger.warning("OpenRouter chat request timed out after 20s")
        return Response(
            {"error": "AI service timed out, please try again"},
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )
    except Exception as e:
        logger.error("Chat error: %s", str(e))
        return Response(
            {"error": "AI service temporarily unavailable"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response({"reply": reply})


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def cancel_reservation(request, pk):
    try:
        reservation = Reservation.objects.select_related('assigned_table').get(pk=pk, user=request.user)
    except Reservation.DoesNotExist:
        return Response(
            {"error": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND
        )
    reservation.status = "cancelled"
    reservation.save()
    if reservation.assigned_table:
        AvailabilitySlot.objects.filter(
            table=reservation.assigned_table,
            date=reservation.date,
            time=reservation.time,
        ).update(is_available=True)
    return Response({"message": "Reservation cancelled"})


# ---------- Owner Dashboard ----------


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
    total = qs.count()
    confirmed = qs.filter(status='confirmed').count()
    cancelled = qs.filter(status='cancelled').count()
    total_guests = qs.filter(status='confirmed').aggregate(s=Sum('guests'))['s'] or 0
    avg_guests = round(total_guests / confirmed, 1) if confirmed > 0 else 0
    cancellation_rate = round(cancelled / total * 100, 1) if total > 0 else 0

    hour_dist = list(
        qs.filter(status='confirmed')
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
        })

    return Response({
        "reservations": data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    })


# ---------- Admin Dashboard ----------


@api_view(["GET"])
@permission_classes([IsStaffAdmin])
def admin_stats(request):
    from django.contrib.auth.models import User as DjangoUser

    total_restaurants = Restaurant.objects.count()
    total_users = DjangoUser.objects.count()

    qs = Reservation.objects.all()
    total_reservations = qs.count()
    confirmed = qs.filter(status='confirmed').count()
    cancelled = qs.filter(status='cancelled').count()
    total_guests = qs.filter(status='confirmed').aggregate(s=Sum('guests'))['s'] or 0
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
            confirmed_reservations=Count('reservations', filter=models.Q(reservations__status='confirmed')),
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


# ---------- Availability ----------


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

    now_time = datetime.now().time() if req_date == date_type.today() else None

    slots = []
    for service, hours in SERVICE_HOURS.items():
        for h in hours:
            t = time_type.fromisoformat(h)
            is_past = now_time is not None and t <= now_time
            slots.append({
                "time": h,
                "service": service,
                "available": (t in available_times) and not is_past,
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


# ---------- Reviews ----------


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def restaurant_reviews(request, pk):
    restaurant = get_object_or_404(Restaurant, pk=pk)

    if request.method == 'GET':
        reviews = restaurant.reviews.select_related('user').all()
        serializer = ReviewSerializer(reviews, many=True)

        can_review = False
        has_reviewed = False
        if request.user.is_authenticated:
            has_reviewed = Review.objects.filter(user=request.user, restaurant=restaurant).exists()
            if not has_reviewed:
                can_review = Reservation.objects.filter(
                    user=request.user,
                    restaurant=restaurant,
                    status='confirmed',
                    date__lt=date_type.today(),
                ).exists()

        return Response({
            'reviews': serializer.data,
            'can_review': can_review,
            'has_reviewed': has_reviewed,
        })

    # POST — create review
    if Review.objects.filter(user=request.user, restaurant=restaurant).exists():
        return Response({'error': 'Already reviewed'}, status=status.HTTP_400_BAD_REQUEST)

    has_past_reservation = Reservation.objects.filter(
        user=request.user,
        restaurant=restaurant,
        status='confirmed',
        date__lt=date_type.today(),
    ).exists()
    if not has_past_reservation:
        return Response(
            {'error': 'Must have a past confirmed reservation to review'},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = ReviewSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    review = serializer.save(user=request.user, restaurant=restaurant)

    agg = Review.objects.filter(restaurant=restaurant).aggregate(avg=Avg('rating'), cnt=Count('id'))
    restaurant.rating = round(agg['avg'], 1)
    restaurant.reviews_count = agg['cnt']
    restaurant.save(update_fields=['rating', 'reviews_count'])

    return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


# ---------- Health ----------


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_check(request):
    try:
        Restaurant.objects.exists()
        db_status = "connected"
    except Exception:
        db_status = "error"

    return Response({
        "status": "ok",
        "database": db_status,
        "timestamp": datetime.now(dt_timezone.utc).isoformat(),
    })
