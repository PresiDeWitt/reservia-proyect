import os

from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import StaffCode
from .serializers import RegisterSerializer, UserSerializer
from .throttling import LoginRateThrottle, PasswordResetRateThrottle, RegisterRateThrottle


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


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@throttle_classes([LoginRateThrottle])
def staff_login_view(request):
    code = request.data.get("code", "").strip()
    if not code:
        return Response({"error": "Access code required"}, status=400)

    from django.contrib.auth.hashers import check_password as check_hashed_password

    staff_code = None
    for sc in StaffCode.objects.filter(is_active=True):
        if check_hashed_password(code, sc.code):
            staff_code = sc
            break

    # Fallback to env vars for backward compatibility
    if not staff_code:
        owner_code = os.environ.get('STAFF_OWNER_CODE', '')
        admin_code = os.environ.get('STAFF_ADMIN_CODE', '')
        if code == owner_code and owner_code:
            role = 'owner'
            email = os.environ.get('STAFF_OWNER_EMAIL', '')
        elif code == admin_code and admin_code:
            role = 'admin'
            email = ''
        else:
            return Response({"error": "Invalid access code"}, status=401)
    else:
        role = staff_code.role
        email = staff_code.email

    staff_user, created = User.objects.get_or_create(
        username=f"staff_{role}_{code[:8]}",
        defaults={
            'email': email or f'{role}@reservia.internal',
        }
    )
    if created:
        staff_user.set_unusable_password()
        staff_user.save()

    refresh = RefreshToken.for_user(staff_user)
    refresh['staff_role'] = role
    refresh['email'] = email or ''

    return Response({
        "token": str(refresh.access_token),
        "refresh": str(refresh),
        "role": role,
    })


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
