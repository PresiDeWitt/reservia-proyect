# Frontend Testing - Vitest + Testing Library

[[Home|<- Volver al Home]]

---

## Objetivo

Definir y ejecutar una suite de pruebas frontend separada en `frontend/tests`, cubriendo:

- Unit tests de componentes y contexto.
- Flow tests de paginas y navegacion.
- API wrapper tests de clientes frontend.

## Stack de testing usado

- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `jsdom`
- `@vitest/coverage-v8`

## Estructura creada

```text
frontend/
  tests/
    setup.ts
    api/
      restaurants.api.test.ts
      services.api.test.ts
    unit/
      AuthContext.test.tsx
      CategoryCard.test.tsx
      RestaurantCard.test.tsx
    flow/
      Header.flow.test.tsx
      Home.flow.test.tsx
      MyBookings.flow.test.tsx
```

## Configuracion aplicada

### 1) Scripts en package.json

Se anadieron scripts:

- `test`: `vitest`
- `test:run`: `vitest run`
- `test:coverage`: `vitest run --coverage`

Archivo:

- `frontend/package.json`

### 2) Config de Vitest en Vite

Se anadio bloque `test` en:

- `frontend/vite.config.ts`

Configuracion principal:

- `environment: 'jsdom'`
- `setupFiles: './tests/setup.ts'`
- `include: ['tests/**/*.{test,spec}.{ts,tsx}']`
- `css: true`
- `clearMocks: true`
- `restoreMocks: true`

### 3) Setup global de tests

Archivo:

- `frontend/tests/setup.ts`

Incluye:

- `@testing-library/jest-dom/vitest`
- limpieza automatica (`cleanup`, `clearAllMocks`, `localStorage.clear`)
- mocks de browser APIs (`scrollIntoView`, `matchMedia`)
- mock de `react-i18next`
- mock de `framer-motion` para reducir flakiness en jsdom

## Cobertura funcional por tipo

### Unit

- `CategoryCard`: render, click, estado activo.
- `RestaurantCard`: datos visibles, enlaces esperados, acciones visibles.
- `AuthContext`: estado inicial, hidratacion desde localStorage, login, logout.

### Flow

- `Home`: carga de resultados, estado sin resultados, filtro por categoria.
- `Header`: apertura de modal login, estado autenticado, submit de busqueda con navegacion.
- `MyBookings`: vista anonima, listado autenticado, cancelacion con actualizacion de estado.

### API wrappers

- `restaurantsApi`: query string, detalle y cocinas.
- `authApi`: login y register.
- `reservationsApi`: create, myReservations y cancel.

## Integracion CI/CD

Se actualizo workflow:

- `.github/workflows/ci-lint-unit-sast.yml`

Nuevo job:

- `frontend-unit-tests`

Paso principal:

- `npm run test:run`

## Comandos de ejecucion

Desde `frontend`:

```powershell
npm ci
npm run test:run
```

Modo watch:

```powershell
npm run test
```

Con coverage:

```powershell
npm run test:coverage
```

## Nota de mantenimiento

Si se anaden nuevos componentes/paginas:

1. Crear pruebas en `frontend/tests/unit` o `frontend/tests/flow` segun corresponda.
2. Mockear APIs externas en `frontend/tests/setup.ts` o por archivo de test.
3. Mantener un criterio estable de datos de prueba y assertions sobre comportamiento observable.

## Links Relacionados

- [[Seguimiento Fase 2 - Ejecucion y Pruebas]]
- [[Resultados de tests - 2026-04-20]]
