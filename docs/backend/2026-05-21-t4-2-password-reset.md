# T4.2 — Password Reset y Change

## Problema
No había mecanismo para recuperar una cuenta si el usuario olvidaba su contraseña, ni para cambiarla estando logueado. Cualquier evaluador que registrara una cuenta se quedaba bloqueado.

## Solución
Flujo completo en dos capas:
- **Forgot password** (no autenticado): solicitud por email → enlace con token → página de confirmación
- **Change password** (autenticado): contraseña actual + nueva

En desarrollo el email se imprime en la consola del servidor (`console` backend). En producción se activa SMTP vía variables de entorno.

## Qué se hizo

### Backend
- `reservia/settings.py` — configuración de email por env vars; fallback `console.EmailBackend` para dev; `FRONTEND_URL` configurable
- `api/throttling.py` — `PasswordResetRateThrottle` (5/hora por IP) para prevenir abuso
- `reservia/settings.py` — scope `password_reset` en `DEFAULT_THROTTLE_RATES`
- `api/views.py` — 3 vistas:
  - `POST /api/auth/password/reset/` — genera token con `PasswordResetTokenGenerator`, envía email; respuesta idéntica tanto si el email existe como si no (anti-enumeración)
  - `POST /api/auth/password/reset/confirm/` — valida uid + token, actualiza contraseña
  - `POST /api/auth/password/change/` — requiere auth, verifica contraseña actual
- `api/urls.py` — 3 nuevas rutas

### Frontend
- `api/auth.ts` — `requestPasswordReset`, `confirmPasswordReset`, `changePassword`
- `components/AuthModal.tsx` — modo `'forgot'` inline: enlace "¿Olvidaste tu contraseña?" en el login → formulario de email → pantalla de confirmación de envío
- `pages/ResetPassword.tsx` — página `/reset-password?uid=...&token=...` con validación de token y formulario de nueva contraseña; redirige al inicio tras éxito
- `App.tsx` — ruta `/reset-password`

## Cómo
- Usa `django.contrib.auth.tokens.default_token_generator` (token HMAC basado en password hash + last_login → expira al cambiar la contraseña o tras ~24h por defecto de Django)
- El uid es el PK del usuario codificado en base64url
- El AuthModal pasa de `'login' | 'register'` a un tercer modo `'forgot'` renderizado en el mismo panel derecho sin abrir una nueva pantalla
- La respuesta de `reset/` es siempre la misma frase independientemente de si el email existe

## Riesgos
- Sin email configurado en producción, los usuarios no recibirán el enlace. Hay que configurar `EMAIL_BACKEND`, `EMAIL_HOST`, etc. vía env vars antes de desplegar
- `change/` no invalida los JWT existentes — el usuario sigue logueado con el token viejo hasta que expire (1h por config de SimpleJWT). Aceptable para el TFG
- El enlace de reset no está disponible en el panel "AccountPage" para usuarios ya logueados, solo en el AuthModal y en la ruta directa
