---
tags:
  - reservia
  - troubleshooting
  - auth
  - frontend
---

# 🔑 Token Inválido Causa 401 en Endpoints Públicos

[[Home|← Volver al Home]]

> [!abstract] 📝 Resumen
> Un token JWT corrupto o expirado en localStorage provocaba errores ==401 Unauthorized== en endpoints públicos como ==/api/restaurants/== y ==/api/auth/register/==, dejando la app en blanco.

**Fecha**: 2026-04-16
**Rama**: `feature/frontend2`

---

## 🚨 Síntoma

> [!warning] Qué se veía
> - La web se quedaba en ==blanco total==
> - Consola mostraba:
>   - `SyntaxError: "undefined" is not valid JSON` en ==AuthContext.tsx:23==
>   - `401 Unauthorized` en ==/api/restaurants/== y ==/api/auth/register/==
> - No se podía ni cargar la home ni registrarse

---

## 🔍 Investigación

> [!info] Pistas encontradas
>
> 1. El error `JSON.parse("undefined")` indicaba que ==localStorage== tenía el string literal `"undefined"` en `reservia_user`
> 2. El ==client.ts== enviaba el token corrupto en **todas** las peticiones (línea 14: `Authorization: Bearer <token>`)
> 3. El backend rechazaba con 401 porque el JWT era inválido, incluso en endpoints con `permissions.AllowAny`

---

## 🎯 Causa Raíz

> [!danger] Dos problemas combinados
>
> **1. AuthContext no validaba datos de localStorage**
> - `JSON.parse(storedUser)` se ejecutaba sin comprobar si el valor era `"undefined"`
> - El crash en AuthProvider dejaba toda la app sin renderizar
>
> **2. Client enviaba tokens corruptos sin protección**
> - Si había un token en localStorage, se enviaba siempre
> - No había mecanismo para detectar un 401 y limpiar el token corrupto

---

## ✅ Solución

### AuthContext.tsx — Validación al cargar

> [!success] Fix aplicado
> Se añadió comprobación de `!== 'undefined'` para token y user, más un `else` que limpia localStorage si los valores son inválidos:
>
> ```typescript
> if (storedToken && storedUser && storedUser !== 'undefined' && storedToken !== 'undefined') {
>   try {
>     const parsed = JSON.parse(storedUser);
>     setToken(storedToken);
>     setUser(parsed);
>   } catch {
>     localStorage.removeItem('reservia_token');
>     localStorage.removeItem('reservia_user');
>   }
> } else {
>   localStorage.removeItem('reservia_token');
>   localStorage.removeItem('reservia_user');
> }
> ```

### client.ts — Auto-limpieza en 401

> [!success] Fix aplicado
> Si el backend devuelve ==401== y hay un token almacenado, se limpia localStorage y se recarga la página:
>
> ```typescript
> if (res.status === 401 && token) {
>   localStorage.removeItem('reservia_token');
>   localStorage.removeItem('reservia_user');
>   window.location.reload();
>   throw new Error('Session expired');
> }
> ```

### Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `frontend/src/context/AuthContext.tsx` | Validación de localStorage + limpieza de datos corruptos |
| `frontend/src/api/client.ts` | Auto-limpieza de token en respuestas 401 |

---

## ⚠️ Riesgos y Deuda Técnica

> [!warning] A tener en cuenta
>
> 1. **Reload en 401**: el `window.location.reload()` puede causar un loop si hay otro problema generando 401s continuos. En ese caso el usuario perdería el estado de la app repetidamente.
> 2. **No se valida expiración del JWT**: se podría decodificar el token y comprobar `exp` antes de enviarlo, evitando peticiones innecesarias con tokens expirados.

---

## 🧠 Lecciones Aprendidas

> [!quote] 💡 Take-aways
>
> - **Nunca confiar en localStorage** — siempre validar y parsear con try/catch antes de usar los datos.
> - **Un token corrupto afecta a TODA la app** — incluidos endpoints públicos, porque el client lo adjunta en todas las peticiones.
> - **Limpiar estado inválido al inicio** — si los datos de sesión no son válidos, es mejor borrarlos inmediatamente que dejar que propaguen errores.

---

## 🔗 Referencias Cruzadas

- [[Authentication]] — Sistema JWT base
- [[Auth Redesign & Proxy Fix]] — Problema anterior relacionado con auth
- [[Components]] — AuthModal y flujo de login
- [[State Management]] — AuthContext
