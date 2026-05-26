from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import models


def _get_fernet() -> Fernet:
    key = getattr(settings, 'FIELD_ENCRYPTION_KEY', None)
    if not key:
        raise ImproperlyConfigured('FIELD_ENCRYPTION_KEY must be set in settings.')
    return Fernet(key.encode() if isinstance(key, str) else key)


class EncryptedCharField(models.CharField):
    """CharField cifrado en reposo con Fernet (AES-128-CBC + HMAC-SHA256).
    No soporta búsquedas por igualdad (el ciphertext es aleatorio por IV)."""

    def from_db_value(self, value, expression, connection):
        if not value:
            return value
        try:
            return _get_fernet().decrypt(value.encode()).decode()
        except (InvalidToken, Exception):
            return value

    def get_db_prep_value(self, value, connection, prepared=False):
        if not value:
            return value
        return _get_fernet().encrypt(value.encode()).decode()


class EncryptedTextField(models.TextField):
    """TextField cifrado en reposo con Fernet (AES-128-CBC + HMAC-SHA256).
    No soporta búsquedas por igualdad (el ciphertext es aleatorio por IV)."""

    def from_db_value(self, value, expression, connection):
        if not value:
            return value
        try:
            return _get_fernet().decrypt(value.encode()).decode()
        except (InvalidToken, Exception):
            return value

    def get_db_prep_value(self, value, connection, prepared=False):
        if not value:
            return value
        return _get_fernet().encrypt(value.encode()).decode()
