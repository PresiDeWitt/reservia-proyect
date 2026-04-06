---
tags:
  - reservia
  - notifications
  - telegram
  - monitoring
---

# 🔔 Sistema de Notificaciones — Telegram Bot

[[Home|← Volver al Home]]

---

> [!abstract] ¿Para qué sirve esto?
> Documentación de referencia para implementar en el futuro un bot de Telegram que notifique automáticamente cuando algo falle en producción — errores 500, fallos de reserva, errores de base de datos, etc.

---

## 1. Crear el Bot en Telegram

> [!info] Paso a paso con BotFather
>
> 1. Abre Telegram y busca **@BotFather**
> 2. Ejecuta `/newbot`
> 3. Dale un nombre y un username (debe terminar en `bot`)
> 4. BotFather te dará un **token** — guárdalo como variable de entorno:
>    ```
>    TELEGRAM_BOT_TOKEN=123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
>    ```

> [!tip] Obtener el Chat ID
>
> Una vez creado el bot, necesitas el ID del chat donde enviará mensajes:
>
> 1. Manda cualquier mensaje al bot desde tu cuenta de Telegram
> 2. Visita esta URL en el navegador (reemplaza el token):
>    ```
>    https://api.telegram.org/bot<TOKEN>/getUpdates
>    ```
> 3. En la respuesta JSON busca `"chat":{"id": XXXXXXX}` — ese es tu `TELEGRAM_CHAT_ID`
> 4. Guárdalo como variable de entorno:
>    ```
>    TELEGRAM_CHAT_ID=123456789
>    ```

---

## 2. Variables de Entorno Necesarias

> [!warning] Agregar a `.env` y a Railway
>
> ```env
> TELEGRAM_BOT_TOKEN=123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
> TELEGRAM_CHAT_ID=123456789
> ```
>
> Estos valores también deben configurarse en **Railway → Variables** para producción.
> Ver: [[Environment Variables]]

---

## 3. Implementación en Django (Python)

### Utilidad base

> [!example] `backend/utils/notify.py` (archivo a crear)
>
> ```python
> import os
> import requests
> from datetime import datetime
>
> TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
> TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
>
> def send_telegram_alert(message: str) -> None:
>     """Envía un mensaje de alerta al bot de Telegram."""
>     if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
>         return  # No configurado — silenciar en desarrollo
>
>     url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
>     payload = {
>         "chat_id": TELEGRAM_CHAT_ID,
>         "text": message,
>         "parse_mode": "HTML",
>     }
>     try:
>         requests.post(url, json=payload, timeout=5)
>     except Exception:
>         pass  # Las notificaciones nunca deben romper el flujo principal
>
>
> def alert_error(context: str, error: Exception) -> None:
>     """Formatea y envía una alerta de error."""
>     timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
>     message = (
>         f"🚨 <b>Error en Reservia</b>\n"
>         f"📍 <b>Contexto:</b> {context}\n"
>         f"❌ <b>Error:</b> {type(error).__name__}: {str(error)}\n"
>         f"🕐 <b>Hora:</b> {timestamp}"
>     )
>     send_telegram_alert(message)
> ```

---

## 4. Puntos de Integración

> [!note] Dónde conectar las notificaciones en Django

### 4.1 — Middleware de errores 500

```python
# backend/middleware/error_notify.py
from utils.notify import alert_error

class ErrorNotifyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        context = f"{request.method} {request.path}"
        alert_error(context, exception)
        return None  # Dejar que Django maneje la respuesta normalmente
```

Registrar en `settings.py`:
```python
MIDDLEWARE = [
    ...
    "backend.middleware.error_notify.ErrorNotifyMiddleware",
]
```

---

### 4.2 — Fallos en reservas (señal Django)

```python
# En el modelo o view de reservas
from utils.notify import alert_error

try:
    reservation.save()
except Exception as e:
    alert_error("Creación de reserva", e)
    raise  # Re-lanzar para que la API devuelva el error al frontend
```

---

### 4.3 — Tareas programadas o cron jobs (futuro)

```python
# Si en el futuro se agregan tareas con Celery o cron
from utils.notify import send_telegram_alert

def nightly_backup_task():
    try:
        run_backup()
        send_telegram_alert("✅ Backup nocturno completado con éxito")
    except Exception as e:
        alert_error("Backup nocturno", e)
```

---

## 5. Eventos Recomendados para Notificar

> [!check] Alta prioridad — notificar siempre en producción
> - Error 500 no controlado
> - Fallo al crear/cancelar una reserva
> - Error de conexión a la base de datos
> - Fallo en la integración con la API de Anthropic (chat IA)
> - Error al procesar pago (si se integra en el futuro)

> [!tip] Media prioridad — opcionales
> - Registro de nuevo usuario fallido
> - Login con credenciales inválidas repetido (posible brute force)
> - Tiempo de respuesta de API superior a X segundos

---

## 6. Ejemplo de Mensaje Recibido

```
🚨 Error en Reservia
📍 Contexto: POST /api/reservations/
❌ Error: IntegrityError: UNIQUE constraint failed: reservations_reservation.id
🕐 Hora: 2026-04-06 14:23:11 UTC
```

---

## 7. Dependencias

> [!info] No se necesitan librerías adicionales
> La implementación usa `requests`, que ya está disponible en el entorno Python del proyecto.
> Si en el futuro se necesita más control, se puede usar `python-telegram-bot` (v21+).

---

## 🔗 Links Relacionados

> [!quote] 📚 Sigue Explorando
> - 🔐 [[Security Incidents]] — Registro de incidentes de seguridad
> - 🌍 [[Environment Variables]] — Variables de entorno del proyecto
> - 🚂 [[Railway Deployment]] — Configuración de producción
