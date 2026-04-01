---
tags:
  - reservia
  - backend
  - api
---

# 🌐 API Endpoints

[[Home|← Volver al Home]]

> [!info] 🔗 Base URL
> - **Desarrollo** → ==http://localhost:8000/api/==
> - **Producción** → ==https://reservia.up.railway.app/api/==

---

## 🔐 Autenticación

> [!abstract] Endpoints de Auth
>
> | Método | Endpoint | Auth | Descripción |
> |--------|----------|------|-------------|
> | **POST** | /api/auth/register/ | ❌ | Registrar nuevo usuario |
> | **POST** | /api/auth/login/ | ❌ | Iniciar sesión |
> | **POST** | /api/auth/token/refresh/ | ❌ | Renovar access token |

> [!example] 📝 **POST** /api/auth/register/
>
> **Enviar:**
> - **first_name** → nombre del usuario (ej: =="Ana"==)
> - **email** → correo electrónico (ej: =="ana@ejemplo.com"==)
> - **password** → contraseña elegida
>
> **Respuesta exitosa** ✅ ==201==
> - **token** → JWT access token
> - **refresh** → JWT refresh token
> - **user** → objeto con ==id==, ==name== y ==email== del usuario creado

> [!example] 🔑 **POST** /api/auth/login/
>
> **Enviar:**
> - **email** → correo registrado
> - **password** → contraseña del usuario
>
> **Respuesta exitosa** ✅ ==200==
> - **token** → JWT access token
> - **refresh** → JWT refresh token
> - **user** → objeto con ==id==, ==name== y ==email==

> [!warning] Errores comunes
> - ==400== → Email ya registrado o credenciales incorrectas
> - ==401== → Token inválido o expirado

---

## 🍽️ Restaurantes

> [!abstract] Endpoints de Restaurantes
>
> | Método | Endpoint | Auth | Descripción |
> |--------|----------|------|-------------|
> | **GET** | /api/restaurants/ | ❌ | Listar todos los restaurantes |
> | **GET** | /api/restaurants/{id}/ | ❌ | Detalle de un restaurante |
> | **GET** | /api/restaurants/cuisines/ | ❌ | Listar cocinas únicas |

> [!example] 📋 **GET** /api/restaurants/
>
> **Parámetros de búsqueda opcionales:**
> - **search** _(string)_ → Buscar por nombre
> - **cuisine** _(string)_ → Filtrar por tipo de cocina
>
> **Respuesta exitosa** ✅ ==200==
> - **restaurants** → lista de restaurantes, cada uno con:
>   - **id** → identificador único
>   - **name** → nombre del restaurante (ej: =="The Golden Fork"==)
>   - **cuisine** → tipo de cocina (ej: =="Italian"==)
>   - **location** → zona (ej: =="Downtown"==)
>   - **rating** → puntuación (ej: ==4.8==)
>   - **price_range** → rango de precio (ej: =="$$"==)
>   - **image_url** → URL de la imagen
>   - **distance** → distancia en km
> - **total** → número total de resultados

> [!example] 🔍 **GET** /api/restaurants/{id}/
>
> **Respuesta exitosa** ✅ ==200==
> - **id**, **name**, **cuisine**, **description**, **address**
> - **lat** / **lng** → coordenadas GPS
> - **rating** → puntuación promedio
> - **reviews_count** → número de reseñas
> - **menuItems** → lista de platos, cada uno con ==id==, ==name== y ==price==

> [!example] 🍳 **GET** /api/restaurants/cuisines/
>
> **Respuesta exitosa** ✅ ==200==
> - Devuelve una lista de strings con los tipos de cocina disponibles
> - Ejemplo: =="Italian"==, =="Japanese"==, =="Steakhouse"==, =="Fusion"==, =="Healthy"==, =="French"==

---

## 📅 Reservas

> [!abstract] Endpoints de Reservas
>
> | Método | Endpoint | Auth | Descripción |
> |--------|----------|------|-------------|
> | **POST** | /api/reservations/ | ✅ | Crear reserva |
> | **GET** | /api/reservations/my/ | ✅ | Mis reservas |
> | **DELETE** | /api/reservations/{id}/ | ✅ | Cancelar reserva |

> [!example] ➕ **POST** /api/reservations/
>
> **Header requerido:** ==Authorization: Bearer \<token\>==
>
> **Enviar:**
> - **restaurantId** → ID del restaurante
> - **date** → fecha en formato ==YYYY-MM-DD==
> - **time** → hora en formato ==HH:MM==
> - **guests** → número de comensales
> - **seatIds** _(opcional)_ → lista de IDs de asientos seleccionados
>
> **Respuesta exitosa** ✅ ==201==
> - **id** → ID de la reserva creada
> - **restaurant** → objeto con ==id== y ==name==
> - **date**, **time**, **guests**
> - **status** → =="confirmed"==
> - **created_at** → fecha y hora de creación

> [!info] 💺 Sobre seatIds
> Si se omite ==seatIds==, la reserva se crea sin asientos asignados. Ver [[Reservation System]] para el flujo completo.

> [!warning] Errores al crear reserva
> - ==400== → Asientos ya ocupados o cantidad de comensales inválida
> - ==401== → Usuario no autenticado

> [!example] 📄 **GET** /api/reservations/my/
>
> **Respuesta exitosa** ✅ ==200==
> - Lista de reservas del usuario autenticado
> - Cada reserva incluye: ==id==, ==restaurant==, ==date==, ==time==, ==guests==, ==status==

> [!example] ❌ **DELETE** /api/reservations/{id}/
>
> **Respuesta exitosa** ✅ ==200==
> - **message** → =="Reservation cancelled"==

> [!warning] ⚠️ Cancelación
> En realidad cambia el ==status== a =="cancelled"==, no borra el registro de la base de datos.

---

## 🏢 Planos de Piso

> [!abstract] Endpoints de Floor Plans
>
> | Método | Endpoint | Auth | Descripción |
> |--------|----------|------|-------------|
> | **GET** | /api/restaurants/{id}/floor-plan/ | ❌ | Obtener plano |
> | **GET** | /api/restaurants/{id}/availability/ | ❌ | Disponibilidad de asientos |
> | **PUT** | /api/restaurants/{id}/floor-plan/edit/ | ✅ | Guardar plano |

> [!example] 📐 **GET** /api/restaurants/{id}/availability/
>
> **Parámetros requeridos:**
> - **date** _(string)_ → formato ==YYYY-MM-DD==
> - **time** _(string)_ → formato ==HH:MM==
>
> **Respuesta exitosa** ✅ ==200==
> - **seats** → lista de asientos, cada uno con:
>   - **id** → identificador del asiento
>   - **label** → etiqueta (ej: =="T1-A"==)
>   - **tableLabel** → mesa a la que pertenece (ej: =="T1"==)
>   - **isOccupied** → ==true== o ==false==

> [!example] ✏️ **PUT** /api/restaurants/{id}/floor-plan/edit/
>
> **Enviar:**
> - **width** → ancho del plano (ej: ==1000==)
> - **height** → alto del plano (ej: ==700==)
> - **backgroundColor** → color de fondo (ej: =="#F8F9FA"==)
> - **tables** → lista de mesas, cada una con:
>   - **label** → etiqueta de la mesa
>   - **shape** → =="round"==, =="square"== o =="rectangular"==
>   - **x**, **y** → posición en el plano
>   - **width**, **height** → dimensiones
>   - **rotation** → ángulo de rotación
>   - **capacity** / **min_capacity** → capacidad máxima y mínima

---

## 🤖 Chat IA

> [!abstract] Endpoint del Chatbot
>
> | Método | Endpoint | Auth | Descripción |
> |--------|----------|------|-------------|
> | **POST** | /api/chat/ | ❌ | Enviar mensaje al chatbot |

> [!example] 💬 **POST** /api/chat/
>
> **Enviar:**
> - **message** → texto del usuario (ej: =="¿Qué restaurante japonés me recomiendas?"==)
> - **history** _(opcional)_ → lista de mensajes previos con ==role== y ==content==
> - **lat** / **lng** _(opcional)_ → coordenadas GPS del usuario
>
> **Respuesta exitosa** ✅ ==200==
> - **reply** → respuesta generada por el asistente IA

> [!info] 📌 Notas
> - El historial se limita a las ==últimas 10 interacciones==
> - ==lat== y ==lng== son opcionales, mejoran las recomendaciones por cercanía
> - Ver [[AI Chat Integration]] para detalles de implementación

---

## 🔗 Links Relacionados

- [[Authentication]] — Cómo funciona el sistema JWT
- [[Models]] — Modelos detrás de cada endpoint
- [[AI Chat Integration]] — Detalle de la integración con Claude
- [[Reservation System]] — Flujo completo de reservas
