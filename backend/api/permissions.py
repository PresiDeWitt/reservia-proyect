from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError


def _decode_staff_token(request):
    auth = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth.startswith('Bearer '):
        return None
    try:
        return AccessToken(auth.split(' ', 1)[1])
    except TokenError:
        return None


def get_staff_role(request) -> str | None:
    token = _decode_staff_token(request)
    return token.get('staff_role') if token else None


def get_staff_email(request) -> str | None:
    token = _decode_staff_token(request)
    return token.get('email') if token else None


class IsStaffOwner(BasePermission):
    def has_permission(self, request, view):
        return get_staff_role(request) == 'owner'


class IsStaffAdmin(BasePermission):
    def has_permission(self, request, view):
        return get_staff_role(request) == 'admin'
