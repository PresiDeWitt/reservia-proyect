# Fix ESLint no-unused-vars (CI lint en rojo)

## Problema

El job de CI `frontend-lint` ejecuta `pnpm build && pnpm lint`. El lint fallaba con 4 errores de `@typescript-eslint/no-unused-vars` por parámetros intencionadamente sin usar, prefijados con `_`, en shims de compatibilidad:

- `src/api/ownerProfile.ts:12` — `_email` en `getOwnerProfile(_email)` (ahora la identidad viene del JWT vía `ownerApi`, pero se mantiene la firma).
- `src/api/roles.ts:7,9` — `_email`/`_role` en `getRole`/`setRole` (no-ops; los roles los determina el backend).

Como `eslint .` devuelve código de salida 1 cuando hay errores, el job de lint quedaba en rojo y bloqueaba el pipeline.

## Solución

Honrar la convención `_`-prefijo para identificadores intencionadamente sin usar en la configuración de ESLint, en lugar de eliminar parámetros (lo que rompería el type-check en cada llamada y la utilidad de compatibilidad). Los nombres sin prefijo siguen reportándose como error.

## Qué Se Hizo

- `frontend/eslint.config.js`: se añadió la regla `@typescript-eslint/no-unused-vars` con `argsIgnorePattern`, `varsIgnorePattern` y `caughtErrorsIgnorePattern` en `^_`.
- `frontend/tests/setup.ts`: se eliminó la directiva `// eslint-disable-next-line @typescript-eslint/no-unused-vars` (línea 34), redundante tras el cambio (la regla ya exime `_callback`/`_options`).

No se modificaron las firmas de `ownerProfile.ts` ni `roles.ts`.

## Cómo

1. `npm run lint` → identificados 4 errores + 1 warning.
2. Verificado que los `_email`/`_role` son shims de compatibilidad cuyas firmas deben preservarse (las elimina romperían las llamadas tipadas).
3. Añadida la regla en la config de ESLint (enfoque de raíz: la regla no respetaba `^_`, no era código incorrecto).
4. Re-ejecutado lint → la directiva en `setup.ts` quedó "unused"; se eliminó.
5. Verificación final: `npm run lint` → 0 errores (exit 0); `npm run build` OK; `npm run test:run` → 28/28; backend `manage.py test` → 146/146.

## Riesgos

- Bajo. La regla sigue marcando como error cualquier variable/parámetro sin usar que **no** lleve el prefijo `_`, así que no se debilita la detección real.
- Queda 1 warning preexistente intencional en `ChatBot.tsx:193` (`react-hooks/exhaustive-deps` en un `useEffect` de montaje); los warnings no rompen el CI y se dejó sin tocar para no introducir un re-disparo del efecto.

## Notas Adicionales

- La convención `_` ya se usaba en el código (`_callback`/`_options` en `tests/setup.ts`), pero el autor había tenido que silenciar la regla manualmente; este cambio generaliza esa intención.
- En el mismo trabajo se destrackeó un `.pyc` que se había colado en git pese a estar en `.gitignore` (`backend/api/management/commands/__pycache__/__init__.cpython-314.pyc`).
