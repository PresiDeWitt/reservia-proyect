# Owner Reservation Attendance

- [x] Move ongoing work off `main` onto `owner-reservation-attendance`.
- [x] Expose reservation `note` and `occasion` in the owner reservations API.
- [x] Add owner PATCH endpoint for reservation attendance status.
- [x] Show note, occasion, and attendance actions in the owner dashboard.
- [x] Verify backend and frontend checks.

## Review

- Backend tests: `python backend/manage.py test tests --verbosity 2` passed, 65 tests.
- Frontend build: `npm run build` passed with existing chunk-size warnings.
- Frontend tests: `npm run test:run` passed, 28 tests.
- Migration check: `python backend/manage.py makemigrations --check --dry-run` reported no changes.