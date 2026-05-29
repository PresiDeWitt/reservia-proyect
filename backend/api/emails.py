import logging
import requests
import concurrent.futures
from django.conf import settings
from django.utils.html import escape, strip_tags

logger = logging.getLogger(__name__)

# Executor para el envío asíncrono no bloqueante
_executor = concurrent.futures.ThreadPoolExecutor(max_workers=3, thread_name_prefix="usesend_email")


class UseSendClient:
    """
    Cliente REST simple y robusto para interactuar con la API de useSend.
    """
    def __init__(self):
        self.api_key = getattr(settings, "USESEND_API_KEY", "")
        self.base_url = getattr(settings, "USESEND_API_URL", "https://app.usesend.com/api").rstrip("/")
        self.from_email = getattr(settings, "USESEND_FROM_EMAIL", "ReserVia <no-reply@reservia.website>")

    def send_email(self, to, subject, html_content, text_content=None, idempotency_key=None):
        """
        Envía un correo a través del endpoint /v1/emails de useSend de forma síncrona.
        """
        # Si estamos en modo test o la clave no está configurada, simulamos el envío en logs
        if getattr(settings, "IS_TEST", False) or not self.api_key:
            logger.info(
                f"[useSend MOCK] Correo simulado exitosamente.\n"
                f"De: {self.from_email}\n"
                f"Para: {to}\n"
                f"Asunto: {subject}\n"
                f"HTML disponible: {bool(html_content)}"
            )
            return {"status": "mocked", "message": "Email logged successfully"}

        # La documentación de useSend especifica que se envía a /v1/emails
        url = f"{self.base_url}/v1/emails"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key

        payload = {
            "to": to if isinstance(to, list) else [to],
            "from": self.from_email,
            "subject": subject,
            "html": html_content,
            "text": text_content or strip_tags(html_content),
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            if response.status_code in (200, 201, 202):
                logger.info(f"[useSend] Correo enviado con éxito a {to}. Asunto: '{subject}'")
                return response.json()
            else:
                logger.error(
                    f"[useSend ERROR] Error al enviar correo. Código: {response.status_code}. "
                    f"Respuesta: {response.text}"
                )
                return {"error": True, "status_code": response.status_code, "detail": response.text}
        except Exception as e:
            logger.exception(f"[useSend EXCEPTION] Error de conexión con useSend: {str(e)}")
            return {"error": True, "detail": str(e)}


def _async_dispatch(to, subject, html_content, text_content=None, idempotency_key=None):
    """
    Función helper que se ejecuta en el thread pool.
    """
    client = UseSendClient()
    client.send_email(to, subject, html_content, text_content, idempotency_key)


def send_email_async(to, subject, html_content, text_content=None, idempotency_key=None):
    """
    Envía un correo electrónico de forma asíncrona usando el ThreadPoolExecutor.
    Evita bloquear el hilo principal de Django.
    """
    # Si no hay destinatario válido, no hacemos nada
    if not to:
        return
    _executor.submit(_async_dispatch, to, subject, html_content, text_content, idempotency_key)


# ==========================================
# PLANTILLAS HTML ESTÉTICAS Y PREMIUM (CSS)
# ==========================================

def get_base_html_template(content_html, preview_text="ReserVia"):
    """
    Esqueleto HTML premium con diseño responsive, HSL colores estilizados y tipografía moderna.
    """
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReserVia</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
            font-family: 'Outfit', 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;
            color: #1e293b;
            -webkit-font-smoothing: antialiased;
        }}
        .wrapper {{
            width: 100%;
            background-color: #f7f9fc;
            padding: 40px 0;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(30, 41, 59, 0.05);
            border: 1px solid #e2e8f0;
        }}
        .header {{
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            padding: 40px 30px;
            text-align: center;
        }}
        .logo {{
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
            text-decoration: none;
            margin: 0;
        }}
        .logo span {{
            color: #f59e0b;
        }}
        .body-content {{
            padding: 40px 35px;
            line-height: 1.6;
        }}
        h1 {{
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 20px;
        }}
        p {{
            font-size: 15px;
            color: #475569;
            margin-bottom: 20px;
        }}
        .card {{
            background-color: #f8fafc;
            border: 1px solid #f1f5f9;
            border-left: 4px solid #f59e0b;
            border-radius: 12px;
            padding: 24px;
            margin: 25px 0;
        }}
        .card-row {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
        }}
        .card-row:last-child {{
            margin-bottom: 0;
        }}
        .card-label {{
            font-weight: 600;
            color: #64748b;
            min-width: 120px;
        }}
        .card-value {{
            color: #0f172a;
            font-weight: 700;
            text-align: right;
            flex-grow: 1;
        }}
        .btn {{
            display: inline-block;
            background-color: #312e81;
            color: #ffffff !important;
            padding: 14px 30px;
            font-size: 15px;
            font-weight: 700;
            text-decoration: none;
            border-radius: 8px;
            text-align: center;
            margin: 15px 0;
            transition: background-color 0.2s ease;
        }}
        .btn:hover {{
            background-color: #1e1b4b;
        }}
        .footer {{
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            font-size: 12px;
            color: #94a3b8;
        }}
        .footer a {{
            color: #312e81;
            text-decoration: none;
            font-weight: 600;
        }}
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="logo">Reser<span>Via</span></div>
            </div>
            <div class="body-content">
                {content_html}
            </div>
            <div class="footer">
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #94a3b8;">
                    Este es un correo automático enviado por ReserVia.
                </p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                    © 2026 ReserVia. Todos los derechos reservados. <a href="{settings.FRONTEND_URL}">Visitar sitio web</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
"""


# ==========================================
# ENVÍOS DE EMAIL PERSONALIZADOS
# ==========================================

def send_welcome_email(user):
    """
    Envía un correo de bienvenida estético a un nuevo usuario registrado.
    """
    if not user.email:
        return

    display_name = escape(user.first_name or user.username)
    subject = f"¡Te damos la bienvenida a ReserVia, {display_name}!"

    content = f"""
    <h1>¡Hola, {display_name}!</h1>
    <p>Estamos sumamente felices de que te unas a la comunidad gastronómica de <strong>ReserVia</strong>.</p>
    <p>Nuestra plataforma te permitirá descubrir los mejores restaurantes de tu ciudad, explorar su distribución de mesas en 3D en tiempo real y asegurar tu mesa favorita en cuestión de segundos.</p>
    
    <div class="card" style="border-left-color: #312e81;">
        <h3 style="margin-top: 0; color: #1e1b4b;">¿Qué puedes hacer ahora?</h3>
        <ul style="padding-left: 20px; margin-bottom: 0; color: #475569; font-size: 14.5px;">
            <li style="margin-bottom: 8px;">Explorar restaurantes interactivos en el mapa.</li>
            <li style="margin-bottom: 8px;">Personalizar tu perfil e historial de reservas.</li>
            <li style="margin-bottom: 0;">Descubrir nuevas delicias con recomendaciones inteligentes de nuestro chatbot IA.</li>
        </ul>
    </div>
    
    <p style="text-align: center;">
        <a href="{settings.FRONTEND_URL}" class="btn">Comenzar a Explorar</a>
    </p>
    """
    
    html = get_base_html_template(content)
    send_email_async(
        to=user.email,
        subject=subject,
        html_content=html,
        idempotency_key=f"welcome_{user.id}_{user.date_joined.timestamp()}"
    )


def send_booking_confirmation_email(reservation):
    """
    Envía un correo estético detallando la confirmación de la reserva.
    """
    user = reservation.user
    if not user.email:
        return

    restaurant_name = escape(reservation.restaurant.name)
    subject = f"Reserva Confirmada: {restaurant_name}"

    display_name = escape(user.first_name or user.username)

    occasion_label = reservation.get_occasion_display() if hasattr(reservation, "get_occasion_display") else reservation.occasion
    occasion_html = ""
    if occasion_label:
        occasion_html = f"""
        <div class="card-row">
            <span class="card-label">Celebración:</span>
            <span class="card-value">{escape(occasion_label)}</span>
        </div>
        """

    note_html = ""
    if reservation.note:
        # reservation.note es texto libre del cliente: debe escaparse para evitar
        # inyección de HTML/atributos en el cliente de correo del destinatario.
        note_html = f"""
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <strong style="font-size: 13.5px; color: #475569; display: block; margin-bottom: 5px;">Nota especial:</strong>
            <span style="font-size: 13.5px; color: #0f172a; font-style: italic;">"{escape(reservation.note)}"</span>
        </div>
        """

    table_label = escape(reservation.assigned_table.label) if reservation.assigned_table else "Mesa Asignada"
    table_zone = escape(reservation.assigned_table.zone) if reservation.assigned_table else "General"

    content = f"""
    <h1>¡Tu reserva ha sido confirmada!</h1>
    <p>¡Hola, {display_name}! Todo está listo para tu visita gastronómica. El restaurante ha confirmado tu asistencia y reservado tu mesa favorita.</p>

    <div class="card">
        <div class="card-row">
            <span class="card-label">Restaurante:</span>
            <span class="card-value" style="color: #312e81; font-size: 16px;">{restaurant_name}</span>
        </div>
        <div class="card-row">
            <span class="card-label">Fecha:</span>
            <span class="card-value">{reservation.date.strftime('%d/%m/%Y')}</span>
        </div>
        <div class="card-row">
            <span class="card-label">Hora:</span>
            <span class="card-value">{reservation.time.strftime('%H:%M')} hs</span>
        </div>
        <div class="card-row">
            <span class="card-label">Comensales:</span>
            <span class="card-value">{reservation.guests} personas</span>
        </div>
        <div class="card-row">
            <span class="card-label">Ubicación mesa:</span>
            <span class="card-value">{table_label} ({table_zone})</span>
        </div>
        {occasion_html}
        {note_html}
    </div>

    <p><strong>Dirección del restaurante:</strong><br>
    <span style="color: #64748b; font-size: 14px;">📍 {escape(reservation.restaurant.address)}</span></p>
    
    <p style="text-align: center; margin-top: 30px;">
        <a href="{settings.FRONTEND_URL}/bookings" class="btn">Gestionar mis Reservas</a>
    </p>
    """
    
    html = get_base_html_template(content)
    send_email_async(
        to=user.email,
        subject=subject,
        html_content=html,
        idempotency_key=f"confirm_{reservation.id}_{reservation.created_at.timestamp()}"
    )


def send_booking_cancellation_email(reservation):
    """
    Envía un correo informando la cancelación de la reserva.
    """
    user = reservation.user
    if not user.email:
        return

    restaurant_name = escape(reservation.restaurant.name)
    display_name = escape(user.first_name or user.username)
    subject = f"Reserva Cancelada: {restaurant_name}"

    content = f"""
    <h1 style="color: #dc2626;">Tu reserva ha sido cancelada</h1>
    <p>Hola, {display_name}. Te informamos que tu reserva para el restaurante <strong>{restaurant_name}</strong> programada para el <strong>{reservation.date.strftime('%d/%m/%Y')}</strong> a las <strong>{reservation.time.strftime('%H:%M')} hs</strong> ha sido cancelada exitosamente.</p>
    
    <div class="card" style="border-left-color: #dc2626; background-color: #fef2f2; border-color: #fee2e2;">
        <p style="margin: 0; font-size: 14.5px; color: #991b1b; font-weight: 600;">
            Estado de la Reserva: Cancelado
        </p>
    </div>
    
    <p>Lamentamos que no puedas asistir esta vez. Si deseas buscar otra fecha o reservar en cualquiera de nuestros otros restaurantes de la plataforma, puedes hacerlo en cualquier momento.</p>
    
    <p style="text-align: center; margin-top: 30px;">
        <a href="{settings.FRONTEND_URL}" class="btn" style="background-color: #475569;">Ver otros restaurantes</a>
    </p>
    """
    
    html = get_base_html_template(content)
    send_email_async(
        to=user.email,
        subject=subject,
        html_content=html,
        idempotency_key=f"cancel_{reservation.id}"
    )
