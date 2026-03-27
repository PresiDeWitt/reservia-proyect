---
tags: [reservia, backend, authentication, jwt, security]
---

# Authentication

[[Home|← Volver al Home]]

## Sistema de Autenticación

Reservia usa **JWT (JSON Web Tokens)** mediante la librería `djangorestframework-simplejwt`.

---

## 🔐 Configuración de Tokens

```python
# backend/reservia/settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
}
```

| Token | Duración | Uso |
|-------|----------|-----|
| Access Token | 7 días | Autenticar requests API |
| Refresh Token | 30 días | Obtener nuevo access token |

---

## 💾 Almacenamiento en Frontend

Los tokens se guardan en `localStorage`:

```typescript
// frontend/src/context/AuthContext.tsx
localStorage.setItem('reservia_token', token)
localStorage.setItem('reservia_user', JSON.stringify(user))
```

| Key | Contenido |
|-----|-----------|
| `reservia_token` | JWT access token |
| `reservia_user` | Objeto usuario `{id, name, email}` |

---

## 📤 Envío de Tokens

Cada request autenticada incluye el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Configurado en el cliente base:

```typescript
// frontend/src/api/client.ts
const token = localStorage.getItem('reservia_token')
headers['Authorization'] = `Bearer ${token}`
```

---

## 🔒 Endpoints Protegidos vs Públicos

### Requieren Autenticación (✅)
- `POST /api/reservations/` — Crear reserva
- `GET /api/reservations/my/` — Ver mis reservas
- `DELETE /api/reservations/{id}/` — Cancelar reserva
- `PUT /api/restaurants/{id}/floor-plan/edit/` — Editar plano

### Públicos (❌)
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/restaurants/`
- `GET /api/restaurants/{id}/`
- `GET /api/restaurants/cuisines/`
- `GET /api/restaurants/{id}/floor-plan/`
- `GET /api/restaurants/{id}/availability/`
- `POST /api/chat/`

---

## 🔄 Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database

    U->>FE: Introduce email + password
    FE->>BE: POST /api/auth/login/
    BE->>DB: Verifica credenciales
    DB-->>BE: User object
    BE-->>FE: {token, refresh, user}
    FE->>FE: Guarda en localStorage
    FE-->>U: Usuario autenticado

    Note over FE,BE: Requests autenticadas posteriores
    FE->>BE: GET /api/reservations/my/ + Authorization header
    BE->>BE: Verifica JWT
    BE-->>FE: Datos protegidos
```

---

## 📝 Registro de Usuario

```python
# backend/api/views.py - RegisterView
class RegisterView(APIView):
    # El username de Django se usa como email
    user = User.objects.create_user(
        username=email,
        email=email,
        first_name=first_name,
        password=password
    )
```

> [!note] Username = Email
> Django requiere un `username`. En Reservia, el `username` y el `email` son el mismo valor.

---

## 🚪 Logout

El logout es **solo en el cliente** — se eliminan los tokens del `localStorage`:

```typescript
// AuthContext.tsx
const logout = () => {
    localStorage.removeItem('reservia_token')
    localStorage.removeItem('reservia_user')
    setUser(null)
}
```

> [!warning] Sin blacklist de tokens
> Los tokens no se invalidan en el servidor al hacer logout. Permanecen válidos hasta que expiran (7 días). Esto es aceptable para esta aplicación, pero en producción crítica se debería implementar token blacklisting.

---

## 🛡️ Manejo de Errores

| Código | Descripción |
|--------|-------------|
| `401` | Token ausente o inválido |
| `400` | Email ya registrado |
| `400` | Credenciales incorrectas |

---

## 🔗 Links Relacionados

- [[API Endpoints]] — Endpoints de auth
- [[State Management]] — AuthContext del frontend
- [[Environment Variables]] — SECRET_KEY y configuración
