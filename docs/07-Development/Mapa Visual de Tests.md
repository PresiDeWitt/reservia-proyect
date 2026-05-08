# 🧪 Mapa Visual de Tests

[[Home|← Volver al Home]]

---

> [!success] ✅ Suite completa — 68/68 tests pasando
> Última ejecución: **2026-04-20** · Sin fallos · Sin regresiones

---

## 📊 Resumen global

> [!abstract] Totales
> | | Backend | Frontend | Total |
> |---|---|---|---|
> | 📁 Archivos | 8 | 8 | **16** |
> | 🧪 Tests | 40 | 28 | **68** |
> | ✅ Pasando | 40 | 28 | **68** |
> | ❌ Fallos | 0 | 0 | **0** |

```
BACKEND  ████████████████████████████████████████  40/40
FRONTEND ████████████████████████████  28/28
TOTAL    ██████████████████████████████████████████████████████████████████  68/68
```

---

## 🗂️ Árbol de archivos

```
reservia-proyect/
│
├── backend/tests/
│   ├── 🔐 test_auth_api.py           → 6 tests
│   ├── 🍽️  test_restaurants_api.py    → 7 tests
│   ├── 📅 test_reservations_api.py   → 8 tests
│   ├── 🛡️  test_security_throttling.py → 2 tests
│   ├── 🧱 test_models_unit.py        → 6 tests
│   ├── 📦 test_serializers_unit.py   → 5 tests
│   ├── 💨 test_smoke_system.py       → 4 tests
│   └── 🤖 test_chat_api.py           → 2 tests
│
└── frontend/tests/
    ├── unit/
    │   ├── 🔐 AuthContext.test.tsx    → 4 tests
    │   ├── 🏷️  CategoryCard.test.tsx  → 3 tests
    │   └── 🃏 RestaurantCard.test.tsx → 3 tests
    ├── flow/
    │   ├── 🏠 Home.flow.test.tsx      → 3 tests
    │   ├── 🔝 Header.flow.test.tsx    → 3 tests
    │   └── 📋 MyBookings.flow.test.tsx → 3 tests
    └── api/
        ├── 🍽️  restaurants.api.test.ts → 4 tests
        └── ⚙️  services.api.test.ts    → 5 tests
```

---

## 🎨 Frontend — 28 tests

### 🔵 Unit Tests (10 tests)

> [!info] AuthContext.test.tsx — 4 tests
> | ✅ | Test | Descripción |
> |---|---|---|
> | ✅ | `arranca sin sesion por defecto` | Estado inicial `isAuthenticated = false`, email `none` |
> | ✅ | `hidrata sesion almacenada` | Lee `reservia_token` y `reservia_user` del localStorage al montar |
> | ✅ | `login guarda token y usuario` | Escribe claves en localStorage y cambia estado a autenticado |
> | ✅ | `logout limpia la sesion` | Borra localStorage, vuelve a `isAuthenticated = false` |

> [!tip] CategoryCard.test.tsx — 3 tests
> | ✅ | Test | Descripción |
> |---|---|---|
> | ✅ | `renderiza nombre e imagen` | Botón con texto correcto y accesibilidad ARIA |
> | ✅ | `dispara onClick al pulsar` | Callback llamado exactamente 1 vez |
> | ✅ | `aplica estilos activo` | Clase `text-primary` presente cuando `active=true` |

> [!example] RestaurantCard.test.tsx — 3 tests
> | ✅ | Test | Descripción |
> |---|---|---|
> | ✅ | `muestra informacion principal` | Nombre, cocina, ubicacion, distancia, rating, rango de precio |
> | ✅ | `expone enlaces al id correcto` | href `/restaurant/42` en nombre y botón "Book Now" |
> | ✅ | `renderiza acciones esperadas` | Botones Menu y Favorito accesibles en DOM |

---

### 🟣 Flow Tests (9 tests)

> [!abstract] Home.flow.test.tsx — 3 tests
> | ✅ | Test | Descripción |
> |---|---|---|
> | ✅ | `carga restaurantes y muestra resultados` | API `list` llamada, tarjeta del restaurante visible |
> | ✅ | `estado sin resultados` | Texto `noResults` visible, botón `clearFilters` presente |
> | ✅ | `aplica filtro por categoria` | API re-llamada con `cuisine: 'Italian'` tras click |

> [!abstract] Header.flow.test.tsx — 3 tests
> | ✅ | Test | Descripción |
> |---|---|---|
> | ✅ | `abre modal en modo no autenticado` | Modal aparece tras click en "Sign In" |
> | ✅ | `muestra perfil si hay sesion` | Link MyBookings + ProfileMenu presentes |
> | ✅ | `navega con query search` | URL cambia a `/?search=sushi` al enviar formulario |

> [!abstract] MyBookings.flow.test.tsx — 3 tests
> | ✅ | Test | Descripción |
> |---|---|---|
> | ✅ | `mensaje de login sin sesion` | "Sign in to see your bookings." sin llamar API |
> | ✅ | `lista reservas autenticado` | Nombre restaurante visible, badge `confirmed` |
> | ✅ | `cancelar reserva actualiza estado` | `cancel(10)` llamado, badge → `cancelled`, botón desaparece |

---

### 🟢 API Wrapper Tests (9 tests)

> [!tip] restaurants.api.test.ts — 4 tests
> | ✅ | Test | Endpoint verificado |
> |---|---|---|
> | ✅ | `construye query string` | `GET /restaurants/?search=sushi&cuisine=Japanese` |
> | ✅ | `sin filtros usa endpoint base` | `GET /restaurants/` |
> | ✅ | `detalle por id` | `GET /restaurants/21/` |
> | ✅ | `listado de cocinas` | `GET /restaurants/cuisines/` |

> [!tip] services.api.test.ts — 5 tests
> | ✅ | Test | Endpoint verificado |
> |---|---|---|
> | ✅ | `authApi.register` | `POST /auth/register/` con payload completo |
> | ✅ | `authApi.login` | `POST /auth/login/` con email y password |
> | ✅ | `reservationsApi.create` | `POST /reservations/` con restaurantId, fecha, hora, comensales |
> | ✅ | `reservationsApi.myReservations` | `GET /reservations/my/` |
> | ✅ | `reservationsApi.cancel` | `DELETE /reservations/77/` |

---

## 🐍 Backend — 40 tests

### 🔐 Auth API — 6 tests

> [!danger] test_auth_api.py
> | ✅ | Test | Valida |
> |---|---|---|
> | ✅ | `register_creates_tokens_and_user_payload` | **201** · campos `token`, `refresh`, `user.email` |
> | ✅ | `register_rejects_duplicate_email` | **400** · campo `email` en errores |
> | ✅ | `register_rejects_short_password` | **400** · campo `password` en errores |
> | ✅ | `login_returns_jwt_tokens` | **200** · tokens JWT + `user.id` correcto |
> | ✅ | `login_rejects_invalid_credentials` | **401** · mensaje `Invalid email or password` |
> | ✅ | `token_refresh_returns_new_access_token` | **200** · campo `access` nuevo |

---

### 🍽️ Restaurants API — 7 tests

> [!info] test_restaurants_api.py
> | ✅ | Test | Valida |
> |---|---|---|
> | ✅ | `list_returns_total_and_sorted_by_rating` | **200** · orden descendente por rating |
> | ✅ | `list_search_matches_name_cuisine_or_location` | Búsqueda en nombre, cocina y ubicación |
> | ✅ | `list_cuisine_filter_is_case_insensitive` | `?cuisine=jApAnEsE` → 1 resultado |
> | ✅ | `cuisines_endpoint_returns_unique_sorted_values` | Lista única ordenada alfabéticamente |
> | ✅ | `restaurant_detail_includes_menu_items` | Array `menuItems` presente en detalle |
> | ✅ | `restaurant_detail_returns_404_for_unknown_id` | **404** para id inexistente |
> | ✅ | `list_schema_contains_expected_keys` | 11 campos requeridos presentes en cada ítem |

---

### 📅 Reservations API — 8 tests

> [!warning] test_reservations_api.py
> | ✅ | Test | Valida |
> |---|---|---|
> | ✅ | `create_requires_authentication` | **401** sin token |
> | ✅ | `create_success` | **201** · reserva guardada con user y restaurant correctos |
> | ✅ | `create_rejects_guest_limits` | **400** con guests=0 y guests=21 |
> | ✅ | `my_reservations_requires_authentication` | **401** sin token |
> | ✅ | `my_reservations_only_returns_current_user` | Solo devuelve reservas del user activo *(IDOR check)* |
> | ✅ | `cancel_marks_status_cancelled` | **200** · status en BD → `cancelled` |
> | ✅ | `cancel_other_user_returns_404` | **404** al cancelar reserva ajena *(IDOR check)* |
> | ✅ | `cancel_not_found_returns_404` | **404** para id inexistente |

---

### 🛡️ Security / Throttling — 2 tests

> [!bug] test_security_throttling.py
> | ✅ | Test | Valida |
> |---|---|---|
> | ✅ | `login_throttle_returns_429_after_limit` | Petición 1 ✅ · 2 ✅ · 3 → **429** |
> | ✅ | `chat_throttle_returns_429_after_limit` | Petición 1 ✅ · 2 ✅ · 3 → **429** |

---

### 🧱 Models Unit — 6 tests

> [!example] test_models_unit.py
> | ✅ | Test | Valida |
> |---|---|---|
> | ✅ | `restaurant_string_representation` | `str(restaurant)` → nombre del restaurante |
> | ✅ | `menu_item_string_representation` | `str(item)` → `Paella (La Terraza)` |
> | ✅ | `reservation_string_representation` | Contiene email del user y nombre del restaurante |
> | ✅ | `user_profile_string_representation` | `str(profile)` → `Profile<email>` |
> | ✅ | `restaurant_ordering_by_rating_desc` | QuerySet ordenado de mayor a menor rating |
> | ✅ | `reservation_default_status_and_ordering` | Status default `confirmed`, orden por fecha desc |

---

### 📦 Serializers Unit — 5 tests

> [!note] test_serializers_unit.py
> | ✅ | Test | Valida |
> |---|---|---|
> | ✅ | `register_creates_user_and_profile` | User con `username=email` · Profile con `phone` |
> | ✅ | `register_rejects_duplicate_email` | Segundo save mismo email → error en `email` |
> | ✅ | `reservation_validates_guest_range` | guests=0 ❌ · guests=21 ❌ · guests=4 ✅ |
> | ✅ | `restaurant_list_serializer_maps_fields` | Mapea `priceRange`, `image`, `reviewsCount`, `coords` |
> | ✅ | `restaurant_detail_serializer_includes_menu` | `menuItems` con 2 ítems y campo `description` |

---

### 💨 Smoke System — 4 tests

> [!success] test_smoke_system.py
> | ✅ | Test | Valida |
> |---|---|---|
> | ✅ | `public_endpoints_are_reachable` | **200** en `/restaurants/`, `/cuisines/`, `/restaurants/:id/` |
> | ✅ | `protected_endpoints_reject_anonymous` | **401** en `/reservations/my/` y `POST /reservations/` |
> | ✅ | `auth_register_then_login_smoke` | Flujo completo register → login → token recibido |
> | ✅ | `authenticated_user_can_create_and_read_smoke` | Crear reserva → leer reserva del mismo user |

---

### 🤖 Chat API — 2 tests

> [!quote] test_chat_api.py
> | ✅ | Test | Valida |
> |---|---|---|
> | ✅ | `chat_requires_message` | **400** con mensaje vacío, error `Message required` |
> | ✅ | `chat_returns_reply_when_configured` | **200** · mock OpenRouter · URL y `Authorization` correctos |

---

## 🔒 Mapa de cobertura de seguridad

> [!danger] Vectores de ataque cubiertos
> | 🚨 Vector | 🛡️ Tests que lo cubren |
> |---|---|
> | **IDOR en reservas** | `my_reservations_only_returns_current_user` · `cancel_other_user_returns_404` |
> | **Auth JWT** | `test_auth_api.py` completo · `AuthContext.test.tsx` |
> | **Fuerza bruta login** | `login_throttle_returns_429_after_limit` |
> | **Abuso chat** | `chat_throttle_returns_429_after_limit` |
> | **Endpoints públicos vs privados** | `public_endpoints_are_reachable` · `protected_endpoints_reject_anonymous` |
> | **Validación de entrada** | Serializers (guests range, password length, email duplicado) |
> | **Hardening HTTPS** | `python manage.py check --deploy` → 0 warnings |
> | **Dependencias** | `npm audit` → 0 vulnerabilidades |

---

## ▶️ Cómo ejecutar

> [!tip] Backend
> ```bash
> cd backend
> python manage.py test tests --verbosity 1
> ```

> [!tip] Frontend
> ```bash
> cd frontend
> npm run test:run        # una pasada completa
> npm run test            # modo watch
> npm run test:coverage   # con reporte de cobertura
> ```

---

## 🔗 Links relacionados

- [[Frontend Testing - Vitest + Testing Library]]
- [[Resultados de tests - 2026-04-20]]
- [[Seguimiento Fase 2 - Ejecucion y Pruebas]]
