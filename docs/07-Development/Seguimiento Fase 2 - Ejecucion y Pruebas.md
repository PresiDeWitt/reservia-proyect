# SEGUIMIENTO FASE 2: EJECUCION DEL PROYECTO Y PRUEBAS

## 0) Contexto operativo del proyecto

- Proyecto: ReserVia, plataforma web de reservas de restaurantes con funcionalidades de autenticacion JWT, exploracion, reservas y asistente IA.
- Stack actual:
  - Frontend: React 19 + TypeScript + Vite + Tailwind CSS.
  - Backend: Django 4.2 + Django REST Framework + SimpleJWT.
  - IA: Anthropic Claude API.
  - Datos: PostgreSQL en produccion (Railway) y SQLite en desarrollo local.
  - Infraestructura: Docker/Docker Compose para entorno local y Railway para despliegue cloud.
- Objetivo de Fase 2:
  - Ejecutar despliegues controlados y repetibles.
  - Validar calidad funcional y no funcional con cobertura integral.
  - Monitorizar el sistema y el proceso con KPIs accionables.

## 1) Modulo 1: Plan de intervencion y puesta en funcionamiento

### 1.1 Plan de despliegue (Rollout Plan)

### Estrategia seleccionada

Se define una estrategia Canary por entorno (staging -> produccion) con despliegue progresivo por trafico y validacion por compuertas de calidad.

Razon:
- Reduce riesgo frente a despliegue directo.
- Es mas simple de operar que Blue-Green en un stack inicial de Railway.
- Permite rollback rapido sin corte global del servicio.

### Flujo operativo

1. Pre-despliegue (T-2 dias a T-2 horas)
- Congelar scope (solo fixes criticos despues del code freeze).
- Verificar trazabilidad completa requisito -> caso de prueba -> evidencia.
- Ejecutar pipeline completo en rama release:
  - Lint + analisis estatico.
  - Unit + Integration + API/Component tests.
  - E2E smoke en staging.
  - SAST/DAST baseline.
  - Build de imagen Docker con version semantica (x.y.z+commit).
- Confirmar readiness checklist:
  - Variables de entorno y secretos actualizados.
  - Migraciones reversibles verificadas.
  - Backups validados.
  - Runbook de incidente disponible.

2. Despliegue en staging (T-2 horas)
- Desplegar imagen candidata en staging.
- Ejecutar smoke tests:
  - Login/registro.
  - Consulta de restaurantes.
  - Creacion y cancelacion de reserva.
  - Flujo de chat IA.
- Ejecutar pruebas de performance baseline y seguridad rapida (DAST light).
- Aprobar gate de salida a produccion por PM + Tech Lead + QA Lead.

3. Despliegue canary en produccion (T0)
- Paso 1: 10% del trafico durante 30 minutos.
- Paso 2: 30% del trafico durante 60 minutos.
- Paso 3: 100% del trafico si no se exceden umbrales SLO.
- Monitorear en cada fase:
  - Error rate API (5xx).
  - P95 de latencia en endpoints criticos.
  - Conversion de reserva.
  - Errores frontend por release.

4. Post-despliegue (T+0 a T+24 horas)
- Hypercare activo (guardia tecnica + QA).
- Comparativa de KPIs pre vs post release.
- Reporte de release con hallazgos, incidentes y acciones correctivas.

### Compuertas de calidad (Release Gates)

- Cobertura minima unit test backend >= 80%.
- Cobertura minima unit/component frontend >= 75%.
- 0 defectos criticos abiertos.
- E2E smoke critico 100% verde.
- Vulnerabilidades High/Critical abiertas = 0 (SAST/DAST).
- Regresion funcional critico/core >= 95% de casos en verde.

### 1.2 Plan de reversión (Rollback Plan)

### Criterios de activacion de rollback

Activar rollback inmediato si ocurre cualquiera de estos eventos:
- Error rate 5xx > 2% sostenido por 5 min.
- P95 de endpoints criticos aumenta > 40% vs baseline por 10 min.
- Fallos de autenticacion JWT > 5% en 10 min.
- Incidente de seguridad explotable en produccion.

### Pasos de rollback

1. Congelar despliegues y notificar incidente (canal incident-response).
2. Redirigir trafico a version estable previa.
3. Revertir release en Railway a build anterior estable.
4. Revertir migraciones solo si son incompatibles y se valida backup.
5. Ejecutar smoke de estabilidad en version rollback.
6. Emitir informe PIR (Post Incident Review): causa raiz, impacto, CAPA.

### Preparacion obligatoria para rollback seguro

- Mantener al menos 2 imagenes estables etiquetadas.
- Migraciones DB con estrategia expand-contract:
  - Expand: agregar campos/tablas compatibles.
  - Deploy app dual-read/dual-write (si aplica).
  - Contract: eliminar estructuras antiguas en release posterior.
- Backup automatico previo a migraciones con prueba de restauracion.

### 1.3 Documentacion asociada

1. Manual tecnico
- Arquitectura, diagramas, modulos, contratos API, decisiones ADR.

2. Manual de usuario
- Flujos de uso para clientes y administradores.

3. Guia de instalacion/operacion
- Variables de entorno, despliegue Docker/Railway, comandos de arranque.

4. Release notes
- Cambios funcionales, fixes, breaking changes, scripts de migracion.

5. Runbook de incidentes
- Alertas, severidades, pasos de mitigacion, responsables y escalado.

6. Matriz de trazabilidad
- Mapeo requisito -> casos de prueba -> evidencia -> estado.

---

## 2) Modulo 2: Estrategia integral de pruebas (testing exhaustivo)

### 2.1 Piramide de pruebas y politica de calidad

- Base: Unit tests (rapidos, alta cobertura).
- Medio: Integration/API/Component.
- Cima: E2E/UAT (menos volumen, mayor criticidad).

Objetivo de balance recomendado:
- 65% unit.
- 25% integracion/API/component.
- 10% E2E/UAT.

### 2.2 Tabla maestra de estrategia de pruebas

| Tipo de prueba | Herramienta recomendada | Objetivo | Entorno de ejecucion | Ejemplo conceptual | Metrica de exito |
|---|---|---|---|---|---|
| Unit Testing Backend | pytest + pytest-django + coverage.py | Validar logica aislada de serializers, servicios y utilidades | CI + local | Calculo de disponibilidad de reserva para franja horaria | >= 80% cobertura backend y 0 fallos |
| Unit Testing Frontend | Vitest + Testing Library | Validar componentes y hooks de forma aislada | CI + local | Componente de tarjeta muestra estado y CTA correcto | >= 75% cobertura frontend critica |
| Integracion Backend | pytest-django con DB temporal | Validar integracion entre capa API, ORM y autenticacion | CI + staging | Crear reserva via endpoint y verificar persistencia | 100% casos criticos en verde |
| API Testing | Postman/Newman o Schemathesis | Validar contratos, codigos HTTP y schema de respuestas | CI + staging | Endpoint /api/restaurants devuelve estructura acordada | 0 regresiones de contrato |
| Pruebas de Componentes UI | Playwright Component Testing (opcional) | Validar UI con estado realista y eventos | CI + local | Modal auth maneja errores y estados loading | 100% rutas UI criticas cubiertas |
| System Testing | Playwright + datos seed | Validar sistema completo con servicios integrados | Staging pre-release | Usuario registra, busca, reserva, consulta historial | Escenarios core aprobados >= 95% |
| Regression Testing | Suite automatizada + smoke manual dirigido | Detectar efectos colaterales tras cambios | CI por PR + nightly | Cambios en auth no rompen flujo de reservas | 0 defectos criticos escapados |
| E2E | Playwright Cypress (elegir uno) | Validar journeys end-to-end de negocio | Staging y canary | Journey completo desde home hasta confirmacion reserva | Flakiness < 2%, pass rate >= 98% |
| UAT Alpha | Sesiones con stakeholders internos | Validar ajuste a requisitos y reglas de negocio | Entorno UAT | Dueño de producto valida historias prioritarias | Sign-off funcional obtenido |
| UAT Beta | Grupo piloto externo controlado | Validar valor, usabilidad y estabilidad real | Produccion limitada | 20-50 usuarios reales prueban reservas reales | Satisfaccion >= 4/5 y sin bloqueantes |
| Performance (Load) | k6 | Medir comportamiento bajo carga esperada | Staging replicado | 200 usuarios concurrentes en busqueda y reserva | P95 < 400 ms, error < 1% |
| Performance (Stress) | k6 | Encontrar punto de degradacion y limite operativo | Staging | Incremento hasta saturar CPU/DB | Documentar umbral y margen |
| Performance (Spike) | k6 | Validar picos abruptos de trafico | Staging | Pico x5 en 60 segundos por promocion | Recuperacion < 5 min |
| Performance (Volume) | scripts SQL + k6 | Validar grandes volumenes de datos | Staging con dataset grande | Consultas con 1M reservas historicas | Query P95 dentro de SLO |
| Seguridad SAST | Semgrep/Bandit + ESLint Security + SonarQube | Detectar vulnerabilidades en codigo | CI por PR | Detectar uso inseguro de input en backend | 0 High/Critical abiertas |
| Seguridad DAST | OWASP ZAP baseline/full | Detectar vulnerabilidades en runtime | Staging | Escaneo sobre endpoints publicos y auth | 0 High/Critical abiertas |
| Seguridad Pentest | OWASP ASVS checklist + testing manual | Hallar fallos logicos y de autorizacion | Pre-produccion | Intento de acceso a reservas de otro usuario | 0 bypass de autorizacion |
| SQL Injection/XSS/CSRF | pruebas dirigidas automatizadas + manual | Validar proteccion contra ataques comunes | Staging | Payload en campos de busqueda/chat | 0 ejecuciones o filtraciones |
| Usabilidad/UX | pruebas moderadas + heatmaps + encuestas SUS | Mejorar conversion y claridad de flujo | Beta/UAT | Medir abandono en checkout reserva | SUS >= 75 y drop-off en descenso |
| Accesibilidad WCAG | axe-core + Lighthouse + auditoria manual | Cumplir WCAG 2.1 AA | CI + QA manual | Navegacion por teclado en modal y menus | 0 issues criticos AA |
| Compatibilidad Browser/Device | Playwright matrix + BrowserStack | Garantizar comportamiento consistente | CI cloud + manual | Chrome/Firefox/Safari + movil | >= 95% casos sin desviaciones |
| Tolerancia a fallos | Chaos testing ligero + pruebas de reinicio | Verificar resiliencia y recuperacion | Staging controlado | Caida de DB temporal y reconexion | MTTR dentro de objetivo |
| Disaster Recovery | drills de backup/restore | Validar continuidad ante desastre | Entorno DR | Restaurar backup y levantar servicio | RTO/RPO cumplidos |

### 2.3 Detalle por bloque funcional

### A) Funcionales

1. Unit testing
- Backend: reglas de validacion de reservas, serializers, permisos de acceso.
- Frontend: estado de autenticacion, render condicional, validacion de formularios.

2. Integracion
- API + DB + JWT + permisos por rol.
- Integracion de chat IA con manejo de timeout y errores de proveedor.

3. API/component
- Contract testing de endpoints (status code, payload, errores).
- Component tests de AuthModal, Header, ChatBot y formularios de reserva.

4. Sistema, regresion y E2E
- Sistema: validacion de flujo completo con seed estable.
- Regresion: suite por dominios (Auth, Discovery, Booking, Chat).
- E2E: happy path + caminos alternos + casos de error controlado.

5. UAT (Alpha/Beta)
- Alpha interno contra criterios de aceptacion.
- Beta limitada para detectar friccion UX y errores de entorno real.

### B) No funcionales

1. Rendimiento
- Definir SLO inicial:
  - API lectura P95 <= 400 ms.
  - API escritura P95 <= 700 ms.
  - Error rate <= 1%.
- Escenarios: carga nominal, estres, picos y volumen historico.

2. Seguridad
- Shift-left en PR (SAST + dependencias).
- DAST en staging y antes de release.
- Pentest trimestral y antes de hitos mayores.
- Casos minimos obligatorios:
  - Broken access control.
  - JWT tampering.
  - SQLi, XSS almacenado/reflejado, CSRF.
  - Secrets exposure y misconfiguracion CORS.

3. UX/Accesibilidad/Compatibilidad
- UX: medir tiempo de tarea y tasa de error de usuario.
- WCAG: contraste, foco visible, labels, orden de tabulacion.
- Compatibilidad: matriz navegadores y moviles reales.

4. Resiliencia y DR
- Simular caida de servicios dependientes (DB/API externa IA).
- Validar circuit breaker, retries y mensajes degradados.
- Ensayar restore de backup en ventana definida.

### 2.4 Matriz de trazabilidad (RTM)

### Estructura recomendada

| ID requisito | Historia/Feature | Riesgo | Casos de prueba vinculados | Tipo(s) | Evidencia CI/CD | Estado | Defectos asociados |
|---|---|---|---|---|---|---|---|
| REQ-AUTH-001 | Login con JWT | Alto | TC-UT-AUTH-01, TC-INT-AUTH-02, TC-E2E-AUTH-01 | Unit, Integracion, E2E | Build #123, reporte Playwright | Pass | BUG-45 |
| REQ-BOOK-010 | Crear reserva | Alto | TC-UT-BOOK-03, TC-API-BOOK-04, TC-E2E-BOOK-01 | Unit, API, E2E | Build #123, Newman report | Pass | - |
| REQ-CHAT-020 | Chat IA contextual | Medio | TC-INT-CHAT-01, TC-SYS-CHAT-01 | Integracion, Sistema | Build #123, logs QA | Pass | BUG-52 |

### Reglas de gobierno de trazabilidad

- Ningun requisito sin al menos 1 caso de prueba funcional.
- Requisitos de alto riesgo: minimo 1 prueba automatizada + 1 evidencia E2E o integracion.
- Cierre de historia en Jira solo con evidencia de test enlazada.

---

## 3) Modulo 3: Procedimientos para seguimiento y control

### 3.1 KPIs y variables de control

| KPI / Variable | Definicion | Meta objetivo Fase 2 | Fuente / Herramienta | Frecuencia |
|---|---|---|---|---|
| Cobertura backend | % lineas cubiertas por tests backend | >= 80% | coverage.py + CI | Por PR |
| Cobertura frontend | % lineas/branches criticas cubiertas | >= 75% | Vitest coverage | Por PR |
| Pass rate CI | % pipelines exitosas | >= 95% | GitHub Actions | Diario |
| Defect leakage | Defectos detectados en prod / total defectos | <= 10% | Jira + Sentry | Semanal |
| MTTD | Tiempo medio de deteccion de incidente | < 10 min | Datadog/Grafana/Sentry | Semanal |
| MTTR | Tiempo medio de recuperacion | < 30 min | Incident log | Semanal |
| MTBF | Tiempo medio entre fallos | Tendencia creciente | Ops dashboard | Mensual |
| P95 latencia API | Percentil 95 por endpoint critico | <= 400-700 ms segun endpoint | APM (Datadog/New Relic) | Continuo |
| Error rate API | % respuestas 5xx/total | <= 1% | APM + logs | Continuo |
| Tasa de regresion | % fallos en suite regresion | <= 5% | Playwright/Newman | Por release |
| Vulnerabilidades abiertas High/Critical | Conteo por release | 0 | SonarQube/Semgrep/ZAP | Por PR y pre-release |
| Crash-free sessions frontend | % sesiones sin error no controlado | >= 99.5% | Sentry | Diario |
| Exito de despliegue | Releases sin rollback | >= 95% | Pipeline + release logs | Mensual |

### 3.2 Justificacion de KPIs

- Cobertura + pass rate: miden disciplina tecnica y reducen riesgo de regresion.
- Defect leakage: evalua eficacia del testing antes de produccion.
- MTTD/MTTR/MTBF: miden madurez operativa y resiliencia.
- Latencia/error rate: conectan calidad tecnica con experiencia de usuario.
- Vulnerabilidades: aseguran cumplimiento de seguridad por defecto.
- Crash-free sessions: indicador directo de calidad percibida en frontend.
- Exito de despliegue: valida robustez del proceso de release.

### 3.3 Instrumentos y configuracion en CI/CD

### Herramientas recomendadas

- Gestion: Jira (historias, bugs, UAT sign-off).
- Calidad de codigo: SonarQube + coverage reports.
- SAST: Semgrep/Bandit/ESLint Security.
- DAST: OWASP ZAP.
- E2E y regresion: Playwright.
- API testing: Newman/Schemathesis.
- Performance: k6.
- Observabilidad: Sentry + Datadog/Grafana + logs centralizados.

### Integracion minima en pipeline

1. PR Pipeline
- Lint + unit + integracion + SAST + quality gate.

2. Main/Release Pipeline
- Build Docker + push imagen + despliegue staging.
- E2E smoke + API contract + DAST baseline.
- Gate de aprobacion manual (PM + QA + Tech Lead).
- Canary en produccion + monitoreo SLO.

3. Nightly Pipeline
- Regresion completa + carga baseline + reporte de tendencias.

### Snippet ejemplo GitHub Actions (base)

```yaml
name: ci-cd-phase2

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Backend deps
        run: |
          pip install -r backend/requirements.txt
          pip install pytest pytest-django coverage bandit
      - name: Frontend deps
        run: |
          cd frontend
          npm ci
      - name: Backend tests
        run: |
          cd backend
          coverage run -m pytest
          coverage report --fail-under=80
      - name: Frontend tests
        run: |
          cd frontend
          npm run lint
      - name: SAST backend
        run: |
          bandit -r backend -q

  e2e-staging:
    if: github.ref == 'refs/heads/main'
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Playwright smoke
        run: echo "Ejecutar smoke E2E contra staging"

  performance-nightly:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: k6 baseline
        run: echo "Ejecutar k6 y publicar reporte"
```

### Snippet ejemplo de prueba de carga k6

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<400'],
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/restaurants/`);
  check(res, {
    'status 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

---

## 4) Plan de ejecucion de Fase 2 (roadmap operativo)

### Sprint 1 (Semana 1)
- Definir RTM y catalogo de casos de prueba.
- Montar pipeline PR con quality gates.
- Implementar unit tests minimos criticos (auth, reservas, chat).

### Sprint 2 (Semana 2)
- Integracion/API tests + E2E smoke.
- Activar SAST/DAST baseline.
- Dashboard inicial de observabilidad (errores + latencia + disponibilidad).

### Sprint 3 (Semana 3)
- Regresion automatizada por dominio.
- Performance baseline y tuning inicial.
- UAT alpha con stakeholders internos.

### Sprint 4 (Semana 4)
- Canary release controlado.
- UAT beta acotada.
- Cierre de Fase 2 con informe ejecutivo y backlog de mejoras Fase 3.

---

## 5) Criterios de salida de Fase 2 (Definition of Done)

Se considera Fase 2 completada cuando:
- Pipeline CI/CD estable y documentado.
- Coberturas minimas alcanzadas y sostenidas 2 semanas.
- Sin vulnerabilidades High/Critical abiertas.
- E2E smoke y regresion core en verde de forma repetible.
- KPIs operativos dentro de umbrales acordados.
- Documentacion de release, rollback, runbooks y RTM publicada.
- Aprobacion formal de PM, Arquitectura y QA.

## 6) Riesgos principales y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|---|---|---|---|
| Falta de cobertura en modulos criticos | Media | Alto | Priorizar tests por riesgo y bloquear merges sin cobertura minima |
| Flakiness en E2E | Alta | Medio | Datos semilla estables, retries controlados, aislar tests no deterministas |
| Regresiones por migraciones | Media | Alto | Expand-contract + backup + pruebas de migracion en staging |
| Incidentes por configuracion de entorno | Media | Alto | IaC/plantillas de variables y checklist pre-release |
| Vulnerabilidades por dependencias | Media | Alto | Escaneo continuo y politica de actualizacion mensual |

## 7) Gobernanza y RACI simplificado

- PM: priorizacion, aprobaciones de release, gestion de riesgos.
- Arquitecto: decisiones tecnicas, estandares, no funcionales y resiliencia.
- QA/SDET: estrategia de pruebas, automatizacion, calidad de evidencias.
- Dev Backend/Frontend: implementacion de tests y correccion de defectos.
- DevOps/Plataforma: CI/CD, observabilidad, rollout/rollback.

Frecuencia de control:
- Daily tecnico: estado de ejecucion y bloqueos.
- Semanal de calidad: KPIs, defectos, deuda tecnica y riesgos.
- Post-release review: resultados, incidentes y mejoras.
