---
tags:
  - reservia
  - troubleshooting
  - auth
  - frontend
  - backend
---

# 🔐 Rediseño de Login/Registro & Fix del Proxy

[[Home|← Volver al Home]]

> [!abstract] 📝 Resumen
> Sesión de trabajo en la rama `feature/frontend2` para rediseñar el modal de
> autenticación con estética editorial, ampliar los campos de registro
> (`last_name` + `phone`), y resolver un bug de proxy que impedía completar el
> registro desde el frontend.

**Fecha**: 2026-04-15
**Rama**: `feature/frontend2`
**Commit**: `2dd945b` — "login actualizado"

---

## 🎯 Objetivos de la Sesión

> [!tip] ✅ Alcance
>
> 1. Rediseñar el `AuthModal` con un lenguaje visual distintivo (editorial warm
>    hospitality) manteniendo la paleta existente.
> 2. Login = solo email + contraseña.
> 3. Registro = nombre, apellidos, teléfono, email, contraseña.
> 4. Documentar el sistema de diseño resultante en `DESIGN.md`.
> 5. Dejar backend y frontend funcionales y commiteados.

---

## 🎨 Parte 1 — Rediseño del AuthModal

### Decisiones de diseño

> [!info] 🧭 Dirección estética
> **Editorial warm hospitality**. Dos paneles: izquierdo oscuro (`bg-navy`)
> con grano y resplandor naranja + titular serif con acento itálico; derecho
> cream con formulario de labels flotantes.
>
> La paleta se mantuvo **intacta** (naranja `#f97415`, navy `#0F172A`, cream
> `#f8f7f5`). Se añadió la tipografía **Fraunces** como display editorial
> junto a Inter como fuente de trabajo.

### Archivos tocados

| Archivo                                  | Cambio                                          |
|------------------------------------------|-------------------------------------------------|
| `frontend/index.html`                    | Import de Fraunces (variable + italic + SOFT)   |
| `frontend/src/index.css`                 | Token `--font-editorial`, keyframes, `.auth-grain`, `.auth-rise` |
| `frontend/src/components/AuthModal.tsx`  | Reescritura completa del modal con split layout |
| `frontend/src/api/auth.ts`               | Firma de `register` con `last_name` y `phone`   |
| `frontend/src/i18n/{en,es}.json`         | Nuevas claves `lastNamePlaceholder`, `phonePlaceholder` |
| `DESIGN.md` *(raíz)*                     | Sistema de diseño completo (tokens, reglas, anti-patrones) |

> [!note] 🧩 Componente interno
> Se añadió un helper `FloatField` local dentro del propio `AuthModal.tsx`
> con label flotante, icono coloreado según foco, underline de gradiente,
> slot `trailing` para el botón de mostrar/ocultar contraseña.

---

## 🗄️ Parte 2 — Ampliación del Backend (nuevos campos)

El `User` de Django ya tenía `first_name` y `last_name`, pero no había sitio
para el teléfono. Se tomó la decisión de **no migrar a un User custom** para
mantener el alcance mínimo — en su lugar, se creó un modelo auxiliar.

### Modelo nuevo

```python
# backend/api/models.py
class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    phone = models.CharField(max_length=30, blank=True)
```

### Serializer actualizado

```python
# backend/api/serializers.py
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=30)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password', 'phone']
```

Al crear el usuario, se instancia un `UserProfile` asociado con el teléfono.

### Migración

> [!success] ✅ Aplicada
> `api/migrations/0002_userprofile.py` — generada con `makemigrations` y
> aplicada con `migrate`. No rompe datos existentes porque es un modelo
> nuevo con `OneToOne` nullable a nivel de inserción.

---

## 🐛 Parte 3 — El bug del proxy (y cómo nos despistó)

> [!warning] 🚨 Síntoma
> Desde el navegador, pulsar **Registrarse** devolvía `404 Not Found` sobre
> `/api/auth/register/`. Desde `curl http://127.0.0.1:8000/...` funcionaba
> perfectamente y devolvía un JWT válido.

### Investigación

```bash
$ lsof -i :8000 | grep LISTEN
Python     4245 fran    4u  IPv4  TCP localhost:irdmi (LISTEN)
com.docke 39167 fran  164u  IPv6  TCP *:irdmi (LISTEN)   # 👀
```

Había **dos procesos** escuchando en el puerto 8000:

- **Django (runserver)** → IPv4 `127.0.0.1:8000` ✅
- **Un contenedor Docker olvidado** → IPv6 `[::1]:8000` ❌

### Causa raíz

El `vite.config.ts` tenía el proxy apuntando a `localhost:8000`:

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:8000', changeOrigin: true },
  },
}
```

Node resuelve `localhost` preferentemente como **IPv6** (`::1`) en macOS,
así que el proxy de Vite enviaba las peticiones al **contenedor Docker
obsoleto** — un backend fantasma con otro API que devolvía `404` en las rutas
del proyecto real.

### Solución

> [!success] 🛠️ Fix
> Cambiar el target del proxy a la IP literal IPv4:
>
> ```ts
> target: 'http://127.0.0.1:8000',
> ```
>
> Tras reiniciar Vite, `curl http://localhost:5173/api/auth/register/` devuelve
> el JWT correctamente.

### Alternativas descartadas

| Alternativa                                  | Por qué no                                         |
|----------------------------------------------|----------------------------------------------------|
| Parar el contenedor Docker viejo             | El usuario puede querer mantenerlo para otro proyecto. El fix del proxy es más duradero. |
| Arrancar Django con `runserver 0.0.0.0:8000` | No resuelve el problema: el proxy seguiría yendo al contenedor en IPv6. |
| Usar `127.0.0.1` en vez de `localhost` en todos los fetch del cliente | El cliente ya usa rutas relativas `/api/...` que pasan por el proxy. Arreglar el proxy cubre todo de una vez. |

---

## ⚠️ Riesgos y Deuda Técnica

> [!danger] 🔴 A revisar antes de prod
>
> 1. **Proxy hardcodeado a 127.0.0.1**: está bien para local; en Docker/Railway
>    el backend se llama a través del nombre de servicio (`backend:8000`) y la
>    configuración de `docker-compose.yml` ya lo maneja. Verificar que el build
>    de prod no dependa del `vite.config.ts`.
> 2. **`phone` sin validación de formato**: actualmente es un `CharField(30)`
>    libre. Si se va a usar para notificaciones, habrá que validar formato
>    E.164 y probablemente añadir verificación por SMS.
> 3. **`UserProfile` sin migración de datos**: los usuarios creados **antes**
>    de esta migración no tienen `profile`. Si algún endpoint futuro hace
>    `user.profile.phone` sin `hasattr`/`try`, romperá. Mitigación: data
>    migration que cree un `UserProfile` vacío para cada usuario existente.
> 4. **`db.sqlite3` versionado**: el commit incluye la base de datos SQLite
>    con datos de seed. En una rama colaborativa esto genera conflictos cada
>    vez que alguien crea un usuario. Considerar añadirlo al `.gitignore` y
>    regenerarlo vía `python manage.py seed`.
> 5. **Sin recuperación de contraseña**: el flujo "¿Olvidaste tu contraseña?"
>    se eliminó del modal por decisión explícita del usuario. Si se añade en
>    el futuro, necesitará endpoint `/auth/password-reset/` + envío de email.

---

## 🧪 Verificación

> [!example] ✅ Cómo comprobar que todo funciona
>
> 1. **Backend**:
>    ```bash
>    cd backend && source venv/bin/activate && python manage.py runserver
>    ```
> 2. **Frontend**:
>    ```bash
>    cd frontend && npm run dev
>    ```
> 3. **Registro end-to-end**:
>    ```bash
>    curl -X POST http://localhost:5173/api/auth/register/ \
>         -H "Content-Type: application/json" \
>         -d '{"first_name":"Test","last_name":"User","phone":"600123123","email":"t@x.com","password":"123456"}'
>    ```
>    Debe devolver `{"token": "...", "refresh": "...", "user": {...}}`.
> 4. **UI**: abrir http://localhost:5173 → click en "Iniciar Sesión" → probar
>    pestañas Login/Registro, labels flotantes, toggle de contraseña, submit.

---

## 🧠 Lecciones Aprendidas

> [!quote] 💡 Take-aways
>
> - **`localhost` no es `127.0.0.1`**. En macOS y Node, `localhost` resuelve
>   antes a IPv6, lo que puede derivar el tráfico al proceso equivocado si
>   hay múltiples listeners en el mismo puerto.
> - **Verificar el proxy con `curl` contra la IP del backend directamente**
>   descarta en 10 segundos si el problema es del frontend, del proxy o del
>   backend. En esta sesión salvó ~20 minutos de depuración a ciegas.
> - **Una migración pequeña (`UserProfile`) suele ser preferible a extender
>   `AbstractUser`** en proyectos ya en marcha — menos riesgo, cero reescritura
>   de imports existentes.
> - **Separar el rediseño visual de los cambios de datos** en el mismo commit
>   funciona aquí porque el alcance es pequeño; en features más grandes
>   conviene dividir en commits separados para revisar por capas.

---

## 🔗 Referencias Cruzadas

- [[Authentication]] — Sistema JWT base
- [[API Endpoints]] — Endpoints REST del backend
- [[Components]] — Resto de componentes UI
- [[State Management]] — `AuthContext` que consume el modal
- [[Local Setup]] — Cómo arrancar local de cero
- `DESIGN.md` *(en la raíz del repo)* — Sistema de diseño completo
