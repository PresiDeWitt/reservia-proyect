---
tags:
  - reservia
  - backend
  - auth
  - jwt
---

# 🔐 Authentication

[[Home|← Volver al Home]]

## 🛡️ Sistema de Autenticación

Reservia usa ==JWT (JSON Web Tokens)== mediante la librería ==djangorestframework-simplejwt==.

---

## ⏱️ Configuración de Tokens

> [!info] 🎟️ Access Token
> - **Duración** → ==7 días==
> - **Uso** → Autenticar cada request a la API
> - **Se envía** → en el header ==Authorization: Bearer \<token\>==

> [!info] 🔄 Refresh Token
> - **Duración** → ==30 días==
> - **Uso** → Obtener un nuevo Access Token cuando el actual expire
> - **Configurado en** → ==settings.py== → bloque ==SIMPLE_JWT==

---

## 💾 Almacenamiento en Frontend

> [!info] 🗄️ localStorage
> Los tokens se guardan en el navegador usando ==localStorage==:
>
> | Clave | Contenido |
> |-------|-----------|
> | **reservia_token** | JWT access token |
> | **reservia_user** | Objeto usuario con ==id==, ==name== y ==email== |
>
> Configurado en → [[State Management|AuthContext.tsx]]

---

## 🔄 Flujo de Autenticación

> [!tip] 1️⃣ El usuario introduce sus credenciales
> El usuario ingresa su ==email== y ==password== en el formulario de login del frontend.

⬇️

> [!tip] 2️⃣ Frontend envía la petición
> Se realiza un **POST** a ==/api/auth/login/== con las credenciales.

⬇️

> [!tip] 3️⃣ Backend verifica credenciales
> Django busca al usuario en la base de datos y valida la contraseña.

⬇️

> [!tip] 4️⃣ Backend genera tokens JWT
> Si las credenciales son correctas, se generan el ==access token== y el ==refresh token==.

⬇️

> [!tip] 5️⃣ Frontend almacena los tokens
> Los tokens se guardan en ==localStorage== junto con los datos del usuario.

⬇️

> [!tip] 6️⃣ Requests autenticadas
> Cada petición posterior incluye el header ==Authorization: Bearer \<token\>== automáticamente.

---

## 📤 Envío de Tokens

> [!info] 📡 Header de autorización
> Cada request autenticada incluye automáticamente:
>
> **Authorization** → ==Bearer== + el JWT access token
>
> Esto se configura en el cliente API base del frontend (==client.ts==).

---

## 🔒 Endpoints Protegidos vs Públicos

> [!abstract] ✅ Requieren Autenticación
> - **POST** /api/reservations/ → Crear reserva
> - **GET** /api/reservations/my/ → Ver mis reservas
> - **DELETE** /api/reservations/{id}/ → Cancelar reserva
> - **PUT** /api/restaurants/{id}/floor-plan/edit/ → Editar plano
>
> Ver detalles en [[API Endpoints]]

> [!abstract] ❌ Endpoints Públicos
> - **POST** /api/auth/register/ y /api/auth/login/
> - **GET** /api/restaurants/ y /api/restaurants/{id}/
> - **GET** /api/restaurants/cuisines/
> - **GET** /api/restaurants/{id}/floor-plan/ y /availability/
> - **POST** /api/chat/

---

## 📝 Registro de Usuario

> [!info] 🆕 Creación de cuenta
> Al registrarse, Django crea un usuario donde:
>
> - **username** → se usa el ==email== como username (Django lo requiere)
> - **email** → correo proporcionado
> - **first_name** → nombre del usuario
> - **password** → contraseña hasheada automáticamente por Django
>
> ℹ️ ==Username y Email son el mismo valor== en Reservia.

---

## 🚪 Logout

> [!info] 🔓 Cierre de sesión
> El logout es ==solo en el cliente== — se eliminan los tokens del ==localStorage==:
>
> - Se borra **reservia_token**
> - Se borra **reservia_user**
> - Se establece el estado del usuario a ==null==

> [!warning] ⚠️ Sin blacklist de tokens
> Los tokens ==no se invalidan en el servidor== al hacer logout. Permanecen válidos hasta que expiran (==7 días==).
>
> Esto es aceptable para esta aplicación, pero en producción crítica se debería implementar ==token blacklisting==.

---

## 🛡️ Manejo de Errores

> [!warning] Códigos de error de autenticación
> - ==401== → Token ausente, expirado o inválido
> - ==400== → Email ya registrado al intentar registro
> - ==400== → Credenciales incorrectas al intentar login

---

## 🔗 Links Relacionados

- [[API Endpoints]] — Endpoints de auth
- [[State Management]] — AuthContext del frontend
- [[Environment Variables]] — SECRET_KEY y configuración
