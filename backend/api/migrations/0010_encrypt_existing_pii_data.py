"""
Migración de datos: cifra los valores existentes de phone, note y StaffCode.email
que estuvieran guardados en texto plano antes de la migración 0009.

La lógica de from_db_value intenta descifrar; si falla (InvalidToken), devuelve
el valor tal cual (texto plano). get_db_prep_value siempre cifra al guardar.
Por tanto basta con releer y guardar cada objeto — el campo hace el trabajo.
"""
from django.db import migrations


def encrypt_existing_values(apps, schema_editor):
    from cryptography.fernet import InvalidToken

    UserProfile = apps.get_model('api', 'UserProfile')
    Reservation = apps.get_model('api', 'Reservation')
    StaffCode = apps.get_model('api', 'StaffCode')

    for profile in UserProfile.objects.exclude(phone=''):
        # from_db_value devuelve el valor descifrado (o texto plano si ya lo estaba)
        # get_db_prep_value lo vuelve a cifrar al guardar
        profile.save(update_fields=['phone'])

    for reservation in Reservation.objects.exclude(note=''):
        reservation.save(update_fields=['note'])

    for code in StaffCode.objects.exclude(email=''):
        code.save(update_fields=['email'])


def noop(apps, schema_editor):
    pass  # no reversible: no podemos saber si el valor original era texto plano


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_encrypt_pii_fields'),
    ]

    operations = [
        migrations.RunPython(encrypt_existing_values, noop),
    ]
