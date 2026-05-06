# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ReserVia** is a restaurant reservation platform with:

- **Backend**: Django 4.2 REST API with JWT auth and Anthropic AI chatbot
- **Frontend**: React native + TypeScript + Vite + Tailwind CSS v4 + React Router v7
- **DB**: SQLite (file-based, configurable path via `DB_PATH` env var)

## Development Commands

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py seed          # Populate with sample data
python manage.py runserver     # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
npm run build   # tsc -b && vite build
npm run lint    # eslint
```

Frontend proxies `/api` to `http://localhost:8000` via Vite config.

### Docker (full stack)

```bash
docker compose up --build   # http://localhost
```

## Architecture

### Backend (`backend/`)

- `api/models.py` — Three models: `Restaurant`, `MenuItem`, `Reservation`
- `api/views.py` — All API logic (auth, restaurants, reservations, AI chat)
- `api/serializers.py` — DRF serializers
- `api/urls.py` — All routes under `/api/`
- `reservia/settings.py` — Config via env vars: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `DB_PATH`, `ANTHROPIC_API_KEY`

**API endpoints:**

- `POST /api/auth/register/` and `POST /api/auth/login/` — JWT auth
- `GET /api/restaurants/` — List with `?search=`, `?cuisine=` filters
- `GET /api/restaurants/<id>/` — Detail with menu items
- `GET /api/restaurants/cuisines/` — Distinct cuisine list
- `POST /api/chat/` — AI chatbot (requires `ANTHROPIC_API_KEY`)
- `POST /api/reservations/` — Create reservation (auth required)
- `GET /api/reservations/my/` — User's reservations (auth required)
- `DELETE /api/reservations/<id>/` — Cancel reservation (auth required)

### Frontend (`frontend/src/`)

- `api/client.ts` — Axios base client, attaches JWT token from localStorage
- `api/` — Per-resource modules: `auth.ts`, `restaurants.ts`, `reservations.ts`, `chat.ts`
- `context/AuthContext.tsx` — Global auth state (user, login, logout)
- `pages/` — `Home.tsx`, `RestaurantDetails.tsx`, `MapExplorer.tsx`, `MyBookings.tsx`, `NotFound.tsx`
- `components/` — `Header`, `Hero`, `RestaurantCard`, `CategoryCard`, `AuthModal`, `ChatBot`
- `i18n/` — i18next translations (ES/EN)

## Environment

Create `backend/.env` for local development:

```
ANTHROPIC_API_KEY=sk-ant-...
```

All other settings have development defaults. The chatbot is non-functional without the API key but the rest of the app works normally.

---

## Workflow Orchestration

### Planning

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions).
- If something goes wrong, STOP and replan immediately — do not keep forcing.
- Use plan mode for verification steps, not just building.
- Write detailed specs upfront to reduce ambiguity.

### Subagent Strategy

- Use subagents generously to keep the main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- For complex problems, allocate more compute via subagents.
- One focus per subagent for focused execution.

### Self-Improvement Loop

- After ANY user correction: update `tasks/lessons.md` with the pattern.
- Write rules for yourself that prevent the same mistake.
- Review lessons at session start for the relevant project.

### Verification Before Finishing

- Never mark a task complete without demonstrating it works.
- Compare behavior between main and your changes when relevant.
- Ask yourself: "Would a senior engineer approve this?"
- Run tests, check logs, demonstrate correctness.

### Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?".
- If a fix feels rushed: "Knowing everything I know now, implement the elegant solution."
- Skip this for simple, obvious fixes — do not over-engineer.

### Autonomous Error Correction

- When given an error report: just fix it. Do not ask for hand-holding.
- Point to logs, errors, failing tests and resolve them.
- Zero context-switching required from the user.

## Task Management

- **Plan first**: Write plan in `tasks/todo.md` with checkable items.
- **Verify plan**: Check before starting implementation.
- **Track progress**: Check off items as you go.
- **Document results**: Add a review section in `tasks/todo.md`.
- **Capture lessons**: Update `tasks/lessons.md` after corrections.

## Core Principles

- **Simplicity first**: Make each change as simple as possible. Minimal code impact.
- **No laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal impact**: Changes should only touch what is necessary. Avoid introducing bugs.

## Documentación de tareas

Al terminar cada tarea, crear un documento en `docs/` dentro de la subcarpeta correspondiente (ej. `docs/backend/`, `docs/frontend/`, `docs/infra/`, etc.) con:

- **Problema**: Qué se necesitaba resolver o implementar
- **Solución**: Qué se decidió hacer
- **Qué se hizo**: Cambios realizados (archivos, líneas, dependencias)
- **Cómo**: Enfoque técnico y pasos seguidos
- **Riesgos**: Posibles efectos secundarios, deuda técnica, o puntos a vigilar
- **Notas adicionales**: Cualquier otra info relevante

Formato del archivo: `docs/<carpeta>/YYYY-MM-DD-<nombre-descriptivo>.md`

## Como se trabaja

- no tocar nunca la rama main y siempre preguntame
- no planifiques todo el rato
- nunca añadir coautores en los commits (sin `Co-Authored-By`)
