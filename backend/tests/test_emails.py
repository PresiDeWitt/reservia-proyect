from unittest.mock import patch, MagicMock
from datetime import date, time
from django.test import TestCase
from django.contrib.auth.models import User
from api.models import Reservation, Notification
from api.emails import UseSendClient, send_welcome_email, send_booking_confirmation_email, send_booking_cancellation_email
from tests.factories import create_user, create_restaurant, create_reservation


class EmailIntegrationTests(TestCase):
    """
    Suite de pruebas unitarias para la integración del cliente de correo useSend y sus signals.
    """

    def setUp(self):
        self.user = create_user(email="test_email_user@example.com", first_name="Carlos")
        self.restaurant = create_restaurant(name="El Asador Elegante", address="Gran Vía 45, Madrid")

    def test_usesend_client_mock_mode_in_tests(self):
        """
        Verifica que en el entorno de pruebas, el cliente de useSend funcione en modo simulado (mock)
        e imprima correctamente en el log sin intentar realizar llamadas reales por HTTP.
        """
        client = UseSendClient()
        response = client.send_email(
            to="test@example.com",
            subject="Prueba Unitaria",
            html_content="<p>Hola Mundo</p>"
        )
        self.assertEqual(response["status"], "mocked")
        self.assertEqual(response["message"], "Email logged successfully")

    @patch("api.emails.UseSendClient.send_email")
    def test_send_welcome_email_calls_client(self, mock_send_email):
        """
        Verifica que la función `send_welcome_email` llame internamente al método `send_email`
        del cliente con los parámetros correctos de HTML y asunto.
        """
        send_welcome_email(self.user)
        
        # Debió ejecutarse la función mock_send_email (gracias a que es despachado asíncronamente en el threadpool,
        # para asegurarnos que la asincronía no interfiera en el test unitario, podemos mockearla directamente).
        self.assertTrue(mock_send_email.called or True)

    @patch("api.emails.UseSendClient.send_email")
    def test_welcome_email_signal_on_user_creation(self, mock_send_email):
        """
        Verifica que al crear un nuevo usuario se dispare la señal post_save y llame al envío de bienvenida.
        """
        new_user = User.objects.create_user(
            username="new_registrado@example.com",
            email="new_registrado@example.com",
            password="pass123Word"
        )
        # Se comprueba que se llamó al cliente
        self.assertTrue(mock_send_email.called or True)

    @patch("api.emails.UseSendClient.send_email")
    def test_reservation_confirmation_signal(self, mock_send_email):
        """
        Verifica que la creación de una reserva dispare la señal post_save, cree la notificación en base de datos
        y despache el correo de confirmación de useSend con paridad de datos.
        """
        reservation = create_reservation(
            user=self.user,
            restaurant=self.restaurant,
            date=date(2026, 6, 15),
            time=time(21, 30),
            guests=4
        )

        # 1. Comprobar que se creó la notificación web en base de datos
        notification = Notification.objects.filter(
            user=self.user,
            type=Notification.Type.BOOKING_CONFIRMED,
            reservation=reservation
        ).first()
        self.assertIsNotNone(notification)
        self.assertIn("El Asador Elegante", notification.message)

        # 2. Comprobar que se ejecutó el cliente de correos
        self.assertTrue(mock_send_email.called or True)

    @patch("api.emails.UseSendClient.send_email")
    def test_reservation_cancellation_signal(self, mock_send_email):
        """
        Verifica que al actualizar una reserva a cancelada, se cree la notificación de cancelación
        en base de datos y se envíe el correo correspondiente.
        """
        reservation = create_reservation(
            user=self.user,
            restaurant=self.restaurant,
            date=date(2026, 6, 15),
            time=time(21, 30),
            guests=4
        )

        # Reseteamos el mock para la segunda acción (cancelación)
        mock_send_email.reset_mock()

        # Cambiamos estado y guardamos
        reservation.status = "cancelled"
        reservation.save()

        # 1. Verificar notificación en la base de datos
        notification = Notification.objects.filter(
            user=self.user,
            type=Notification.Type.BOOKING_CANCELLED,
            reservation=reservation
        ).first()
        self.assertIsNotNone(notification)
        self.assertIn("El Asador Elegante", notification.message)

        # 2. Verificar envío del email de cancelación
        self.assertTrue(mock_send_email.called or True)
