---
tags:
  - reservia
  - security
  - incidents
---

# 🚨 Incidencias de Seguridad Encontradas

[[Home|← Volver al Home]]

> [!warning] 📋 Sobre este documento
> Este documento recoge las vulnerabilidades y riesgos de seguridad identificados durante el análisis de la aplicación. Deben ser resueltas antes de un despliegue en producción crítico.

---

## 🔴 Alta Criticidad

> [!danger] INC-001 — Sin Rate Limiting en `/api/chat/`
>
> **Endpoint afectado:** `POST /api/chat/`
> **Tipo de ataque:** Abuso económico / DoS económico
>
> El endpoint del chatbot es público y no tiene límite de peticiones por IP. Cada llamada genera un coste real en la ==ANTHROPIC_API_KEY==. Un atacante puede lanzar miles de peticiones automatizadas para inflar los costes sin ninguna barrera.
>
> **Impacto:** Coste económico directo, posible suspensión de la API key.
> **Mitigación:** `AnonRateThrottle` en DRF — por ejemplo, 20 req/hora por IP.
> **Referencia:** [[AI Chat Integration]]

> [!danger] INC-002 — Brute Force en `/api/auth/login/`
>
> **Endpoint afectado:** `POST /api/auth/login/`
> **Tipo de ataque:** Fuerza bruta de credenciales
>
> No existe límite de intentos de login por IP ni por cuenta. Un atacante puede probar contraseñas de forma automatizada indefinidamente hasta acertar.
>
> **Impacto:** Compromiso de cuentas de usuario.
> **Mitigación:** `AnonRateThrottle` + bloqueo temporal tras N intentos fallidos.
> **Referencia:** [[Authentication]]

---

## 🟠 Media Criticidad

> [!warning] INC-003 — Sin Throttling en `/api/auth/register/`
>
> **Endpoint afectado:** `POST /api/auth/register/`
> **Tipo de ataque:** Spam de cuentas / enumeración de emails
>
> El endpoint de registro no tiene límite de peticiones. Un atacante puede crear cuentas masivamente o usar el mensaje de error `"Email ya registrado"` para enumerar qué correos tienen cuenta en el sistema.
>
> **Impacto:** Base de datos contaminada, enumeración de usuarios.
> **Mitigación:** Throttling por IP + respuestas de error genéricas (no revelar si el email existe).
> **Referencia:** [[Authentication]]

> [!warning] INC-004 — Sin Token Blacklisting al hacer Logout
>
> **Endpoint afectado:** Logout (solo cliente)
> **Tipo de ataque:** Reutilización de token robado
>
> El logout elimina el token del `localStorage` pero no lo invalida en el servidor. Si un token es robado (XSS, red no cifrada, etc.), sigue siendo válido durante ==7 días== aunque el usuario haya cerrado sesión.
>
> **Impacto:** Sesiones activas no revocables.
> **Mitigación:** Implementar `TokenBlacklist` de `simplejwt` o reducir la duración del access token.
> **Referencia:** [[Authentication]]

> [!warning] INC-005 — Autorización a Nivel Objeto en Reservas
>
> **Endpoint afectado:** `DELETE /api/reservations/{id}/`
> **Tipo de ataque:** Acceso no autorizado a recursos ajenos (IDOR)
>
> Debe verificarse en `views.py` que la reserva a cancelar pertenece al usuario autenticado. Si solo se comprueba que el usuario esté autenticado pero no que sea el propietario, cualquier usuario autenticado podría cancelar reservas de otros conociendo el ID.
>
> **Impacto:** Cancelación fraudulenta de reservas ajenas.
> **Mitigación:** Filtrar por `reservation.user == request.user` antes de procesar.
> **Referencia:** [[API Endpoints]]

---

## 🟡 Baja Criticidad / Buenas Prácticas

> [!info] INC-006 — Inyección SQL no documentada
>
> **Área:** Backend general
>
> Django ORM previene inyección SQL por defecto al usar `QuerySet`. Sin embargo, si en algún punto se usan queries crudas con `raw()` o `cursor.execute()` sin parámetros parametrizados, existe riesgo.
>
> **Impacto:** Potencialmente crítico si se usan queries manuales.
> **Acción:** Auditar `views.py` para confirmar que no se usan queries crudas con interpolación de strings.

> [!info] INC-007 — XSS no documentado
>
> **Área:** Frontend React
>
> React escapa el contenido por defecto, lo que previene XSS en la mayoría de casos. Sin embargo, el uso de `dangerouslySetInnerHTML` o la renderización del contenido del chatbot IA sin sanitizar podría introducir vectores XSS.
>
> **Acción:** Confirmar que las respuestas del chatbot no se renderizan como HTML crudo.

---

## 📊 Resumen

| ID | Criticidad | Estado | Área |
|----|-----------|--------|------|
| INC-001 | 🔴 Alta | Pendiente | Chat IA |
| INC-002 | 🔴 Alta | Pendiente | Auth |
| INC-003 | 🟠 Media | Pendiente | Auth |
| INC-004 | 🟠 Media | Pendiente | Auth / Tokens |
| INC-005 | 🟠 Media | Pendiente | Reservas |
| INC-006 | 🟡 Baja | Por auditar | Backend |
| INC-007 | 🟡 Baja | Por auditar | Frontend |

---

## 🔗 Links Relacionados

- [[Authentication]] — Sistema JWT y flujo de auth
- [[AI Chat Integration]] — Endpoint del chatbot
- [[API Endpoints]] — Todos los endpoints REST
- [[Environment Variables]] — Gestión de secrets
