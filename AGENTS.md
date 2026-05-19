# AGENTS

## Project quick facts
- ReserVia is a restaurant reservation platform.
- Backend: Django 4.2 REST API in backend/.
- Frontend: React + TypeScript + Vite in frontend/.
- Dev DB: SQLite (db.sqlite3 or DB_PATH). Prod: PostgreSQL via DATABASE_URL.
- AI chat uses OpenRouter API (Gemma 3 free tier); requires OPENROUTER_API_KEY.

## Workflow constraints
- Do not touch the main branch without asking the user first.
- Follow repo workflow rules in CLAUDE.md (planning, docs, commits).

## Local dev (fast path)
Backend:
1) cd backend
2) python -m venv venv
3) venv\Scripts\activate  (Windows) or source venv/bin/activate
4) pip install -r requirements.txt
5) python manage.py migrate
6) python manage.py seed
7) python manage.py runserver

Frontend (new terminal):
1) cd frontend
2) npm install
3) npm run dev

Docker (full stack):
- docker compose up --build

## Tests
Backend:
- python manage.py test tests --verbosity 2

Frontend:
- npm run test:run
- npm run test
- npm run test:coverage

## Key docs (link, do not duplicate)
- README.md and SETUP.md for setup and commands.
- DESIGN.md for UI rules, tokens, and typography.
- docs/Home.md for the full documentation map.
- docs/02-Architecture/System Architecture.md and docs/02-Architecture/Project Structure.md for architecture.
- docs/06-Deployment/Environment Variables.md for env vars.
- docs/07-Development/Local Setup.md for detailed local steps.
- docs/08-Troubleshooting/Index.md for troubleshooting history.
