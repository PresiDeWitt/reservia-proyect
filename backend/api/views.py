import os

from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Restaurant, Reservation
from .throttling import ChatRateThrottle, LoginRateThrottle, RegisterRateThrottle
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    RestaurantListSerializer,
    RestaurantDetailSerializer,
    ReservationSerializer,
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


# ---------- Restaurants ----------


class RestaurantListView(generics.ListAPIView):
    serializer_class = RestaurantListSerializer
    permission_classes = [permissions.AllowAny]

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

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        total = qs.count()

        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))
        page_size = min(page_size, 100)

        start = (page - 1) * page_size
        end = start + page_size
        paged_qs = qs[start:end]

        serializer = self.get_serializer(paged_qs, many=True)
        return Response(
            {
                "restaurants": serializer.data,
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": max(1, (total + page_size - 1) // page_size),
            }
        )


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
        serializer.save(user=self.request.user)


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
    from django.conf import settings as django_settings

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

    restaurants = Restaurant.objects.prefetch_related("menu_items").all()
    restaurant_lines = []
    for r in restaurants:
        menu = ", ".join(f"{m.name} ({m.price:.2f}€)" for m in r.menu_items.all()[:4])
        restaurant_lines.append(
            f"- ID:{r.pk} | {r.name} | {r.cuisine} | Rating: {r.rating}/5 | {r.price_range} | "
            f"{r.address} | {r.description} | Menu: {menu}"
        )

    location_note = ""
    if lat and lng:
        location_note = (
            f"\nUser GPS: lat={lat}, lng={lng}. "
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
            timeout=30,
        )
        data = resp.json()
        reply = data["choices"][0]["message"]["content"]
    except Exception:
        return Response(
            {"error": "AI service temporarily unavailable"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response({"reply": reply})


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def cancel_reservation(request, pk):
    try:
        reservation = Reservation.objects.get(pk=pk, user=request.user)
    except Reservation.DoesNotExist:
        return Response(
            {"error": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND
        )
    reservation.status = "cancelled"
    reservation.save()
    return Response({"message": "Reservation cancelled"})
