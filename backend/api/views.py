from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Restaurant, Reservation
from .serializers import (
    RegisterSerializer, UserSerializer,
    RestaurantListSerializer, RestaurantDetailSerializer,
    ReservationSerializer,
)


# ---------- Auth ----------

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    from django.contrib.auth import authenticate
    email = request.data.get('email', '')
    password = request.data.get('password', '')
    user = authenticate(username=email, password=password)
    if not user:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
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
        search = self.request.query_params.get('search', '')
        cuisine = self.request.query_params.get('cuisine', '')
        if search:
            qs = qs.filter(name__icontains=search) | \
                 qs.filter(cuisine__icontains=search) | \
                 qs.filter(location__icontains=search)
        if cuisine:
            qs = qs.filter(cuisine__iexact=cuisine)
        return qs.order_by('-rating')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response({'restaurants': serializer.data, 'total': qs.count()})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def cuisines_view(request):
    cuisines = Restaurant.objects.values_list('cuisine', flat=True).distinct().order_by('cuisine')
    return Response(list(cuisines))


class RestaurantDetailView(generics.RetrieveAPIView):
    queryset = Restaurant.objects.prefetch_related('menu_items')
    serializer_class = RestaurantDetailSerializer
    permission_classes = [permissions.AllowAny]


# ---------- Reservations ----------

class ReservationCreateView(generics.CreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_reservations(request):
    reservations = Reservation.objects.filter(user=request.user).select_related('restaurant')
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


# ---------- AI Chat ----------

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def chat_view(request):
    import requests as http_requests
    from django.conf import settings as django_settings

    message = request.data.get('message', '').strip()
    history = request.data.get('history', [])
    lat = request.data.get('lat')
    lng = request.data.get('lng')

    if not message:
        return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)

    api_key = getattr(django_settings, 'OPENROUTER_API_KEY', '')
    if not api_key:
        return Response({'error': 'AI service not configured'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    restaurants = Restaurant.objects.prefetch_related('menu_items').all()
    restaurant_lines = []
    for r in restaurants:
        menu = ', '.join(f"{m.name} ({m.price:.2f}€)" for m in r.menu_items.all()[:4])
        restaurant_lines.append(
            f"- ID:{r.pk} | {r.name} | {r.cuisine} | Rating: {r.rating}/5 | {r.price_range} | "
            f"{r.address} | {r.description} | Menu: {menu}"
        )

    location_note = ''
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
        {'role': m['role'], 'content': m['content']}
        for m in history
        if m.get('role') in ('user', 'assistant') and m.get('content')
    ]
    safe_history.insert(0, {'role': 'system', 'content': system_prompt})
    safe_history.append({'role': 'user', 'content': message})

    try:
        resp = http_requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'google/gemma-3-4b-it:free',
                'messages': safe_history,
                'max_tokens': 400,
            },
            timeout=30,
        )
        data = resp.json()
        reply = data['choices'][0]['message']['content']
    except Exception as e:
        return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({'reply': reply})


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def cancel_reservation(request, pk):
    try:
        reservation = Reservation.objects.get(pk=pk, user=request.user)
    except Reservation.DoesNotExist:
        return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)
    reservation.status = 'cancelled'
    reservation.save()
    return Response({'message': 'Reservation cancelled'})
