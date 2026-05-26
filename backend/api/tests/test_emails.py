"""
Tests para el módulo api.emails — cliente useSend, plantillas HTML y signals.
"""
import datetime
from unittest.mock import MagicMock, patch, call
from django.test import TestCase, override_settings
from django.contrib.auth.models import User

from api.models import Restaurant, RestaurantTable, Reservation, Notification


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _make_user(**kwargs):
    defaults = dict(username="testuser", email="testuser@example.com", first_name="Ana")
    defaults.update(kwargs)
    return User.objects.create_user(password="testpass123", **defaults)


def _make_restaurant(**kwargs):
    defaults = dict(
        name="El Fogón",
        cuisine="Española",
        location="Madrid",
        rating=4.5,
        price_range="€€",
        address="Calle Mayor 1, Madrid",
        description="Cocina tradicional.",
        lat=40.4168,
        lng=-3.7038,
        image_url="https://example.com/img.jpg",
    )
    defaults.update(kwargs)
    return Restaurant.objects.create(**defaults)


def _make_table(restaurant, **kwargs):
    defaults = dict(label="Mesa 1", zone="Terraza", capacity=4)
    defaults.update(kwargs)
    return RestaurantTable.objects.create(restaurant=restaurant, **defaults)


def _make_reservation(user, restaurant, table=None, **kwargs):
    defaults = dict(
        date=datetime.date(2026, 7, 15),
        time=datetime.time(20, 30),
        guests=2,
        status="confirmed",
    )
    defaults.update(kwargs)
    return Reservation.objects.create(
        user=user,
        restaurant=restaurant,
        assigned_table=table,
        **defaults,
    )


# ─────────────────────────────────────────────
# UseSendClient tests
# ─────────────────────────────────────────────

@override_settings(
    IS_TEST=False,
    USESEND_API_KEY="test-key-abc",
    USESEND_API_URL="https://app.usesend.com/api",
    USESEND_FROM_EMAIL="ReserVia <no-reply@reservia.website>",
)
class UseSendClientSendTests(TestCase):
    def _get_client(self):
        from api.emails import UseSendClient
        return UseSendClient()

    @patch("api.emails.requests.post")
    def test_send_email_success_201(self, mock_post):
        mock_post.return_value = MagicMock(status_code=201, json=lambda: {"id": "abc123"})

        client = self._get_client()
        result = client.send_email(
            to="user@example.com",
            subject="Prueba",
            html_content="<p>Hola</p>",
        )

        self.assertEqual(result, {"id": "abc123"})
        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args
        payload = call_kwargs[1]["json"]
        self.assertEqual(payload["to"], ["user@example.com"])
        self.assertEqual(payload["subject"], "Prueba")
        self.assertIn("html", payload)
        self.assertIn("text", payload)

    @patch("api.emails.requests.post")
    def test_send_email_wraps_single_recipient_in_list(self, mock_post):
        mock_post.return_value = MagicMock(status_code=200, json=lambda: {})
        client = self._get_client()
        client.send_email("solo@example.com", "S", "<p>X</p>")
        payload = mock_post.call_args[1]["json"]
        self.assertIsInstance(payload["to"], list)
        self.assertIn("solo@example.com", payload["to"])

    @patch("api.emails.requests.post")
    def test_send_email_accepts_list_recipients(self, mock_post):
        mock_post.return_value = MagicMock(status_code=200, json=lambda: {})
        client = self._get_client()
        client.send_email(["a@x.com", "b@x.com"], "S", "<p>X</p>")
        payload = mock_post.call_args[1]["json"]
        self.assertEqual(payload["to"], ["a@x.com", "b@x.com"])

    @patch("api.emails.requests.post")
    def test_send_email_includes_idempotency_header(self, mock_post):
        mock_post.return_value = MagicMock(status_code=200, json=lambda: {})
        client = self._get_client()
        client.send_email("u@x.com", "S", "<p>X</p>", idempotency_key="unique-key-42")
        headers = mock_post.call_args[1]["headers"]
        self.assertEqual(headers["Idempotency-Key"], "unique-key-42")

    @patch("api.emails.requests.post")
    def test_send_email_error_response_returns_error_dict(self, mock_post):
        mock_post.return_value = MagicMock(status_code=422, text="Unprocessable")
        client = self._get_client()
        result = client.send_email("u@x.com", "S", "<p>X</p>")
        self.assertTrue(result.get("error"))
        self.assertEqual(result["status_code"], 422)

    @patch("api.emails.requests.post", side_effect=ConnectionError("timeout"))
    def test_send_email_exception_returns_error_dict(self, mock_post):
        client = self._get_client()
        result = client.send_email("u@x.com", "S", "<p>X</p>")
        self.assertTrue(result.get("error"))
        self.assertIn("timeout", result["detail"])

    @patch("api.emails.requests.post")
    def test_authorization_bearer_header(self, mock_post):
        mock_post.return_value = MagicMock(status_code=200, json=lambda: {})
        client = self._get_client()
        client.send_email("u@x.com", "S", "<p>X</p>")
        headers = mock_post.call_args[1]["headers"]
        self.assertEqual(headers["Authorization"], "Bearer test-key-abc")


@override_settings(IS_TEST=True, USESEND_API_KEY="")
class UseSendClientMockModeTests(TestCase):
    """Con IS_TEST=True, el cliente simula el envío sin llamar a requests."""

    @patch("api.emails.requests.post")
    def test_mock_mode_does_not_call_requests(self, mock_post):
        from api.emails import UseSendClient
        client = UseSendClient()
        result = client.send_email("u@x.com", "S", "<p>X</p>")
        mock_post.assert_not_called()
        self.assertEqual(result["status"], "mocked")

    @override_settings(IS_TEST=False, USESEND_API_KEY="")
    @patch("api.emails.requests.post")
    def test_empty_api_key_uses_mock_mode(self, mock_post):
        from api.emails import UseSendClient
        client = UseSendClient()
        result = client.send_email("u@x.com", "S", "<p>X</p>")
        mock_post.assert_not_called()
        self.assertEqual(result["status"], "mocked")


# ─────────────────────────────────────────────
# send_email_async tests
# ─────────────────────────────────────────────

class SendEmailAsyncTests(TestCase):
    @patch("api.emails._executor")
    def test_submit_called_with_correct_args(self, mock_executor):
        from api.emails import send_email_async
        send_email_async("u@x.com", "Asunto", "<p>Contenido</p>", idempotency_key="k1")
        mock_executor.submit.assert_called_once()
        args = mock_executor.submit.call_args[0]
        self.assertEqual(args[1], "u@x.com")
        self.assertEqual(args[2], "Asunto")
        self.assertIn("<p>Contenido</p>", args[3])

    @patch("api.emails._executor")
    def test_empty_to_skips_submit(self, mock_executor):
        from api.emails import send_email_async
        send_email_async("", "Asunto", "<p>X</p>")
        mock_executor.submit.assert_not_called()

    @patch("api.emails._executor")
    def test_none_to_skips_submit(self, mock_executor):
        from api.emails import send_email_async
        send_email_async(None, "Asunto", "<p>X</p>")
        mock_executor.submit.assert_not_called()


# ─────────────────────────────────────────────
# HTML template tests
# ─────────────────────────────────────────────

class BaseHtmlTemplateTests(TestCase):
    def test_renders_content_inside_body(self):
        from api.emails import get_base_html_template
        html = get_base_html_template("<p>MARKER_CONTENT</p>")
        self.assertIn("MARKER_CONTENT", html)

    def test_contains_reservia_branding(self):
        from api.emails import get_base_html_template
        html = get_base_html_template("")
        self.assertIn("ReserVia", html)
        self.assertIn("Via", html)

    def test_is_valid_html_structure(self):
        from api.emails import get_base_html_template
        html = get_base_html_template("<p>X</p>")
        self.assertIn("<!DOCTYPE html>", html)
        self.assertIn("<html>", html)
        self.assertIn("</html>", html)


# ─────────────────────────────────────────────
# send_welcome_email tests
# ─────────────────────────────────────────────

class SendWelcomeEmailTests(TestCase):
    @patch("api.emails.send_email_async")
    def test_calls_send_email_async_with_user_email(self, mock_async):
        from api.emails import send_welcome_email
        user = MagicMock(
            email="ana@example.com",
            first_name="Ana",
            username="ana",
            id=1,
            date_joined=datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc),
        )
        send_welcome_email(user)
        mock_async.assert_called_once()
        call_kwargs = mock_async.call_args[1]
        self.assertEqual(call_kwargs["to"], "ana@example.com")
        self.assertIn("Ana", call_kwargs["subject"])
        self.assertIn("<html>", call_kwargs["html_content"])

    @patch("api.emails.send_email_async")
    def test_falls_back_to_username_when_no_first_name(self, mock_async):
        from api.emails import send_welcome_email
        user = MagicMock(
            email="bob@example.com",
            first_name="",
            username="bob99",
            id=2,
            date_joined=datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc),
        )
        send_welcome_email(user)
        call_kwargs = mock_async.call_args[1]
        self.assertIn("bob99", call_kwargs["subject"])

    @patch("api.emails.send_email_async")
    def test_skips_when_no_email(self, mock_async):
        from api.emails import send_welcome_email
        user = MagicMock(email="", first_name="Bob", username="bob", id=3)
        send_welcome_email(user)
        mock_async.assert_not_called()

    @patch("api.emails.send_email_async")
    def test_idempotency_key_includes_user_id(self, mock_async):
        from api.emails import send_welcome_email
        user = MagicMock(
            email="u@x.com",
            first_name="U",
            username="u",
            id=99,
            date_joined=datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc),
        )
        send_welcome_email(user)
        ikey = mock_async.call_args[1]["idempotency_key"]
        self.assertIn("99", ikey)
        self.assertIn("welcome", ikey)


# ─────────────────────────────────────────────
# send_booking_confirmation_email tests
# ─────────────────────────────────────────────

class SendBookingConfirmationEmailTests(TestCase):
    @patch("api.emails.send_email_async")
    def test_calls_async_with_correct_fields(self, mock_async):
        from api.emails import send_booking_confirmation_email

        table = MagicMock(label="Mesa 3", zone="Interior")
        reservation = MagicMock(
            id=10,
            user=MagicMock(email="u@x.com", first_name="Luis", username="luis"),
            restaurant=MagicMock(name="El Fogón", address="Calle Mayor 1"),
            assigned_table=table,
            date=datetime.date(2026, 7, 20),
            time=datetime.time(21, 0),
            guests=4,
            occasion="",
            note="",
            created_at=datetime.datetime(2026, 6, 1, tzinfo=datetime.timezone.utc),
        )
        reservation.get_occasion_display.return_value = ""

        send_booking_confirmation_email(reservation)

        mock_async.assert_called_once()
        call_kwargs = mock_async.call_args[1]
        self.assertEqual(call_kwargs["to"], "u@x.com")
        self.assertIn("El Fogón", call_kwargs["subject"])
        self.assertIn("El Fogón", call_kwargs["html_content"])
        self.assertIn("Mesa 3", call_kwargs["html_content"])
        self.assertIn("20/07/2026", call_kwargs["html_content"])

    @patch("api.emails.send_email_async")
    def test_handles_null_assigned_table(self, mock_async):
        from api.emails import send_booking_confirmation_email

        reservation = MagicMock(
            id=11,
            user=MagicMock(email="u@x.com", first_name="M", username="m"),
            restaurant=MagicMock(name="Restaurante", address="Calle 2"),
            assigned_table=None,
            date=datetime.date(2026, 7, 20),
            time=datetime.time(20, 0),
            guests=2,
            occasion="",
            note="",
            created_at=datetime.datetime(2026, 6, 1, tzinfo=datetime.timezone.utc),
        )
        reservation.get_occasion_display.return_value = ""

        send_booking_confirmation_email(reservation)
        mock_async.assert_called_once()
        html = mock_async.call_args[1]["html_content"]
        self.assertIn("Mesa Asignada", html)

    @patch("api.emails.send_email_async")
    def test_skips_when_no_user_email(self, mock_async):
        from api.emails import send_booking_confirmation_email

        reservation = MagicMock(
            user=MagicMock(email=""),
        )
        send_booking_confirmation_email(reservation)
        mock_async.assert_not_called()

    @patch("api.emails.send_email_async")
    def test_includes_special_note_in_html(self, mock_async):
        from api.emails import send_booking_confirmation_email

        reservation = MagicMock(
            id=12,
            user=MagicMock(email="u@x.com", first_name="X", username="x"),
            restaurant=MagicMock(name="R", address="A"),
            assigned_table=MagicMock(label="M1", zone="Z"),
            date=datetime.date(2026, 8, 1),
            time=datetime.time(20, 0),
            guests=2,
            occasion="",
            note="Sin gluten por favor",
            created_at=datetime.datetime(2026, 6, 1, tzinfo=datetime.timezone.utc),
        )
        reservation.get_occasion_display.return_value = ""

        send_booking_confirmation_email(reservation)
        html = mock_async.call_args[1]["html_content"]
        self.assertIn("Sin gluten por favor", html)

    @patch("api.emails.send_email_async")
    def test_idempotency_key_includes_reservation_id(self, mock_async):
        from api.emails import send_booking_confirmation_email

        reservation = MagicMock(
            id=77,
            user=MagicMock(email="u@x.com", first_name="X", username="x"),
            restaurant=MagicMock(name="R", address="A"),
            assigned_table=None,
            date=datetime.date(2026, 8, 1),
            time=datetime.time(20, 0),
            guests=2,
            occasion="",
            note="",
            created_at=datetime.datetime(2026, 6, 1, tzinfo=datetime.timezone.utc),
        )
        reservation.get_occasion_display.return_value = ""

        send_booking_confirmation_email(reservation)
        ikey = mock_async.call_args[1]["idempotency_key"]
        self.assertIn("77", ikey)
        self.assertIn("confirm", ikey)


# ─────────────────────────────────────────────
# send_booking_cancellation_email tests
# ─────────────────────────────────────────────

class SendBookingCancellationEmailTests(TestCase):
    @patch("api.emails.send_email_async")
    def test_sends_cancellation_email(self, mock_async):
        from api.emails import send_booking_cancellation_email

        reservation = MagicMock(
            id=20,
            user=MagicMock(email="u@x.com", first_name="P", username="p"),
            restaurant=MagicMock(name="La Taberna"),
            date=datetime.date(2026, 7, 10),
            time=datetime.time(19, 0),
        )
        send_booking_cancellation_email(reservation)
        mock_async.assert_called_once()
        call_kwargs = mock_async.call_args[1]
        self.assertEqual(call_kwargs["to"], "u@x.com")
        self.assertIn("La Taberna", call_kwargs["subject"])
        self.assertIn("La Taberna", call_kwargs["html_content"])

    @patch("api.emails.send_email_async")
    def test_skips_when_no_user_email(self, mock_async):
        from api.emails import send_booking_cancellation_email

        reservation = MagicMock(user=MagicMock(email=""))
        send_booking_cancellation_email(reservation)
        mock_async.assert_not_called()

    @patch("api.emails.send_email_async")
    def test_idempotency_key_includes_reservation_id(self, mock_async):
        from api.emails import send_booking_cancellation_email

        reservation = MagicMock(
            id=55,
            user=MagicMock(email="u@x.com", first_name="Q", username="q"),
            restaurant=MagicMock(name="R"),
            date=datetime.date(2026, 8, 1),
            time=datetime.time(20, 0),
        )
        send_booking_cancellation_email(reservation)
        ikey = mock_async.call_args[1]["idempotency_key"]
        self.assertIn("55", ikey)
        self.assertIn("cancel", ikey)


# ─────────────────────────────────────────────
# Signal integration tests
# ─────────────────────────────────────────────

@override_settings(IS_TEST=True)
class SignalEmailTests(TestCase):
    """Integración end-to-end: signals disparan las funciones de email correctas."""

    @patch("api.emails.send_email_async")
    def test_welcome_email_sent_on_user_creation(self, mock_async):
        User.objects.create_user(
            username="newuser", email="new@example.com", password="pass1234!"
        )
        called_subjects = [c[1]["subject"] for c in mock_async.call_args_list if c[1].get("subject")]
        # Al menos uno de los emails debe ser el de bienvenida
        welcome_calls = [s for s in called_subjects if "bienvenida" in s.lower() or "bienvenido" in s.lower()]
        self.assertTrue(len(welcome_calls) >= 1)

    @patch("api.emails.send_email_async")
    def test_welcome_email_NOT_sent_on_user_update(self, mock_async):
        user = _make_user(username="exuser", email="ex@example.com")
        mock_async.reset_mock()
        user.first_name = "Updated"
        user.save()
        # No debería haber nuevas llamadas de bienvenida
        welcome_calls = [
            c for c in mock_async.call_args_list
            if c[1].get("subject") and "bienvenida" in c[1]["subject"].lower()
        ]
        self.assertEqual(len(welcome_calls), 0)

    @patch("api.emails.send_email_async")
    def test_confirmation_email_sent_on_reservation_creation(self, mock_async):
        user = _make_user(username="u1", email="u1@example.com")
        restaurant = _make_restaurant()
        table = _make_table(restaurant)
        mock_async.reset_mock()

        _make_reservation(user, restaurant, table)

        confirm_calls = [
            c for c in mock_async.call_args_list
            if c[1].get("subject") and "Confirmada" in c[1]["subject"]
        ]
        self.assertEqual(len(confirm_calls), 1)
        self.assertEqual(confirm_calls[0][1]["to"], "u1@example.com")

    @patch("api.emails.send_email_async")
    def test_cancellation_email_sent_once_on_status_change(self, mock_async):
        user = _make_user(username="u2", email="u2@example.com")
        restaurant = _make_restaurant(name="La Casa")
        table = _make_table(restaurant)
        reservation = _make_reservation(user, restaurant, table)
        mock_async.reset_mock()

        # Primera cancelación
        reservation.status = "cancelled"
        reservation.save()

        cancel_calls = [
            c for c in mock_async.call_args_list
            if c[1].get("subject") and "Cancelada" in c[1]["subject"]
        ]
        self.assertEqual(len(cancel_calls), 1)

    @patch("api.emails.send_email_async")
    def test_cancellation_email_NOT_sent_twice(self, mock_async):
        """El email de cancelación NO debe enviarse dos veces si la reserva ya está cancelada."""
        user = _make_user(username="u3", email="u3@example.com")
        restaurant = _make_restaurant(name="El Rincón")
        table = _make_table(restaurant)
        reservation = _make_reservation(user, restaurant, table)

        reservation.status = "cancelled"
        reservation.save()
        mock_async.reset_mock()

        # Segundo save con status='cancelled' (ej. actualización de otro campo)
        reservation.guests = 3
        reservation.save()

        cancel_calls = [
            c for c in mock_async.call_args_list
            if c[1].get("subject") and "Cancelada" in c[1]["subject"]
        ]
        self.assertEqual(len(cancel_calls), 0, "El email de cancelación no debe enviarse dos veces")

    @patch("api.emails.send_email_async")
    def test_no_cancellation_email_on_confirmed_reservation_update(self, mock_async):
        user = _make_user(username="u4", email="u4@example.com")
        restaurant = _make_restaurant(name="Sabores")
        table = _make_table(restaurant)
        reservation = _make_reservation(user, restaurant, table)
        mock_async.reset_mock()

        # Actualizar guests sin cambiar status
        reservation.guests = 5
        reservation.save()

        cancel_calls = [
            c for c in mock_async.call_args_list
            if c[1].get("subject") and "Cancelada" in c[1]["subject"]
        ]
        self.assertEqual(len(cancel_calls), 0)
