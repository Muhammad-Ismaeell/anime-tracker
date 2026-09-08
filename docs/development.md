# Development Guide

## Prerequisites

- Python 3.11+
- Node.js with npm
- Git

## Backend

```bash
cd backend
python -m venv venv
```

Activate the environment and install development dependencies:

```bash
python -m pip install -r requirements-dev.txt
```

Create `.env` from `.env.example`, then run:

```bash
python manage.py migrate
python manage.py runserver
```

Run tests:

```bash
pytest -q
```

## Frontend

```bash
cd anime-frontend
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run build
```

## Environment configuration

Never commit `.env` files. Use the checked-in example files as templates.

Backend configuration is controlled through environment variables for secrets, database connection, authentication, CORS/CSRF, email and Cloudinary.

Frontend configuration uses Vite variables for the API URL, media URL and Google client ID.

## API documentation

After starting Django, open:

```text
http://127.0.0.1:8000/api/docs/
```

The OpenAPI schema is available at:

```text
http://127.0.0.1:8000/api/schema/
```

## Docker

For the backend image:

```bash
cd backend
docker build -t anime-tracker-backend .
docker run --env-file .env -p 8000:8000 anime-tracker-backend
```

`docker-compose.yml` is intended for local development and runs Django's development server with automatic migration setup.

## Database migrations

Each Django app owns its migrations. When model changes are made:

```bash
python manage.py makemigrations
python manage.py migrate
```

Do not edit an already-applied migration just to make it look cleaner; create a new migration for subsequent schema changes.

## Before opening a pull request

1. Run backend tests.
2. Run frontend lint and build.
3. Verify no `.env`, database files, uploaded media or generated static files are tracked.
4. Check the API for regressions in authentication and major anime endpoints.
5. Keep documentation aligned with actual behavior.
