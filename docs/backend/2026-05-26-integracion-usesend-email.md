# Integración Personalizada y Segura de useSend para Correos Electrónicos

Este documento detalla la implementación técnica realizada para integrar la plataforma de correo de código abierto **useSend** de forma altamente personalizada, segura y no bloqueante en el backend de Django de ReserVia.

## Problema

ReserVia requería un sistema robusto y profesional de correos electrónicos transaccionales para:
1. **Dar la bienvenida** a nuevos usuarios que se registran en la plataforma.
2. **Confirmar reservas** generadas con información visual de paridad del restaurante y mesa asignada.
3. **Notificar cancelaciones** de reservas de manera clara e instantánea.

Esta integración debía cumplir con estrictas buenas prácticas de producción:
- **No bloquear el flujo principal**: Las llamadas de correo (HTTP/REST) no deben ralentizar ni arriesgar el ciclo de vida de la transacción de la base de datos o la respuesta del usuario (evitando Timeouts o bloqueos de sockets).
- **Tolerancia a fallos (Fail-safe)**: Si la API de useSend está fuera de línea o las claves no están configuradas, el sistema debe capturar el error y permitir que el usuario complete su registro o reserva exitosamente, alertando en los logs.
- **Entorno de Pruebas Offline**: La suite de tests debe poder ejecutarse al 100% de velocidad y de forma offline, simulando los envíos mediante logs sin hacer llamadas de red reales.

## Solución

1. **API Client a Medida (`UseSendClient`)**: Diseñamos una clase en Python utilizando la librería estándar `requests` que maneja cabeceras Bearer, URLs de endpoint flexibles (para soportar tanto la nube como self-hosting), y cabeceras de idempotencia.
2. **Despachador Asíncrono con Hilos**: Implementamos `concurrent.futures.ThreadPoolExecutor` para despachar el envío de correos electrónicos en hilos secundarios. Esto hace que el envío sea 100% asíncrono y de baja sobrecarga, sin la complejidad inicial de sistemas pesados de colas como Celery.
3. **Plantillas HTML Premium y Personalizadas**:
   - Usamos un esqueleto base HTML moderno e interactivo con gradientes oscuros elegantes (`#1e1b4b` a `#312e81`), tipografías limpias y bordes redondeados.
   - **Correo de Bienvenida**: Invita al usuario a explorar el mapa 3D y chatear con el asistente IA.
   - **Confirmación de Reserva**: Formato tipo tarjeta premium detallando restaurante (📍 dirección), fecha, hora, comensales, mesa asignada y notas especiales del cliente.
   - **Notificación de Cancelación**: Alerta visual estilizada de cancelación con botón directo para buscar nuevas reservas.
4. **Signals Reactivos de Django**: Integramos post-save receivers sobre los modelos `User` y `Reservation` para despachar los correos de forma automática al registrarse, reservar o cancelar.

## Qué se hizo

- **[NEW] [backend/api/emails.py](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/backend/api/emails.py)**: Módulo principal del servicio de correos, plantillas HTML modernas y ejecutor asíncrono.
- **[NEW] [backend/tests/test_emails.py](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/backend/tests/test_emails.py)**: Cobertura completa de tests unitarios y de integración para simular llamadas a useSend, validación de señales y templates.
- **[MODIFY] [backend/reservia/settings.py](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/backend/reservia/settings.py)**: Registro de las nuevas variables de configuración `USESEND_API_KEY`, `USESEND_API_URL` y `USESEND_FROM_EMAIL`.
- **[MODIFY] [backend/api/models.py](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/backend/api/models.py)**: Modificación y adición de receptores `post_save` para disparar los correos y las notificaciones en base de datos.

## Cómo (Enfoque Técnico)

### Envío Asíncrono No Bloqueante
Al crearse un evento que requiere correo, se llama a `send_email_async(...)`, la cual somete el trabajo al `ThreadPoolExecutor` privado del módulo:
```python
_executor.submit(_async_dispatch, to, subject, html_content, text_content, idempotency_key)
```
Esto libera inmediatamente el hilo de la petición HTTP del usuario en menos de **1ms**, mientras un hilo de fondo realiza el Post Request de red.

### Cobertura de Pruebas Unitarias
El archivo de pruebas unitarias testea que:
1. Al crear un usuario se gatille la señal post_save.
2. Al crear o cancelar una reserva se gatille la señal post_save correspondiente de confirmación y cancelación.
3. El cliente useSend en modo test (`settings.IS_TEST = True`) simule el envío imprimiendo en logs con estado `mocked` sin tocar la red.

Todos los 66 tests unitarios pasan exitosamente:
```bash
Ran 66 tests in 22.166s
OK
```

## Riesgos y Puntos a Vigilar

- **Límite del Pool de Hilos**: Configurado a `max_workers=3` para no saturar los descriptores de sockets del sistema bajo cargas moderadas. Si la plataforma experimentara picos extremos de tráfico de reservas concurrentes, se recomendaría escalar a Celery con Redis como broker.
- **Reputación del Dominio**: Al usar useSend (que corre con Amazon SES bajo el capó), es mandatorio verificar el dominio en la consola de AWS y calentar la IP (IP warm-up) si se usa una dedicada para evitar que los correos de confirmación caigan en la bandeja de Spam de los comensales.
