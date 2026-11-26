# AuthFlow

AuthFlow is a full-stack authentication application with a React and TypeScript frontend and a FastAPI/PostgreSQL backend. It supports account registration, login, protected profile access, JWT-based authentication, and Argon2 password hashing.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [Authentication Flow](#authentication-flow)
- [Available Commands](#available-commands)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)

## Features

- User registration with username, email, and password validation
- Argon2 password hashing
- Login with JWT access tokens
- HTTP-only authentication cookie
- Protected profile endpoint
- PostgreSQL-backed user storage
- React Router navigation
- Responsive authentication and profile interfaces
- CORS configuration for local frontend/backend communication

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS 4
- Lucide React
- Oxlint

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Psycopg
- PyJWT
- Argon2
- Pydantic
- Uvicorn
- python-dotenv

## Project Structure

```text
user_auth_Sq1/
|-- README.md
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |   `-- axios.ts
|   |   |-- Router/
|   |   |   `-- route.tsx
|   |   |-- App.tsx
|   |   |-- Login.tsx
|   |   |-- Profile.tsx
|   |   |-- Register.tsx
|   |   |-- index.css
|   |   `-- main.tsx
|   |-- package.json
|   |-- vite.config.ts
|   `-- README.md
`-- user_auth_sq1/
    |-- requirements.txt
    `-- app/
        |-- database.py
        |-- jwt_handler.py
        |-- main.py
        |-- models.py
        `-- security.py
```

## Architecture

The frontend sends JSON requests to the FastAPI backend through Axios:

```text
Browser
  |
  | HTTP requests
  v
React/Vite on http://localhost:5173
  |
  | Axios, withCredentials: true
  v
FastAPI on http://localhost:8000
  |
  | SQLAlchemy / Psycopg
  v
PostgreSQL database
```

The login endpoint creates a signed JWT and stores it in an HTTP-only cookie. Subsequent requests send that cookie automatically, and the backend uses it to identify the current user.

## Prerequisites

Install the following tools before setup:

- Python 3.11 or newer
- Node.js 20 or newer
- npm
- PostgreSQL
- Git

Verify the installations:

```powershell
python --version
node --version
npm --version
psql --version
```

## Database Setup

Create a PostgreSQL database and user. Then create the application table:

```sql
CREATE TABLE IF NOT EXISTS user_table (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

The role column in PostgreSQL can also be defined as an enum, but the SQL above is compatible with the existing raw SQL queries in `app/main.py`.

> The current SQLAlchemy `User` model uses `password` instead of `password_hash`. Because the application routes use raw SQL, the table above should use `password_hash`. The model may need to be corrected before using SQLAlchemy ORM operations with this table.

## Backend Setup

Open a PowerShell terminal in the repository root.

### 1. Create a virtual environment

```powershell
python -m venv .venv
```

### 2. Activate the virtual environment

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, enable scripts for the current user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 3. Install dependencies

```powershell
python -m pip install --upgrade pip
python -m pip install -r .\user_auth_sq1\requirements.txt
```

### 4. Configure the environment

Create `user_auth_sq1/.env` using the names listed in [Environment Variables](#environment-variables).

### 5. Start the API

```powershell
cd .\user_auth_sq1
python -m uvicorn app.main:app --reload
```

The API will be available at:

- Base URL: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Frontend Setup

Open a second terminal from the repository root.

```powershell
cd .\frontend
npm install
npm run dev
```

The frontend will normally be available at `http://localhost:5173`.

## Environment Variables

Place the following values in `user_auth_sq1/.env`:

```dotenv
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name

JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Variable descriptions:

| Variable | Purpose |
|---|---|
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | PostgreSQL database name |
| `JWT_SECRET_KEY` | Secret used to sign and verify JWTs |
| `JWT_ALGORITHM` | JWT signing algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | JWT lifetime in minutes |

The `.env` file is ignored by Git. Never commit real database passwords or JWT secrets.

Generate a strong JWT secret in PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

## API Reference

All endpoints are available below `http://localhost:8000`.

### Register a user

```http
POST /api/register
Content-Type: application/json
```

Request body:

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securePassword123"
}
```

Validation rules:

- Username: 3 to 50 characters
- Email: valid email format
- Password: at least 8 characters in the frontend; the backend field should also enforce a maximum length for production use

Successful response:

```json
{
  "message": "User registered successfully",
  "username": "testuser",
  "email": "test@example.com",
  "password": "Argon2-hashed-password"
}
```

> For security, registration responses should not include the password hash. This is currently a known implementation issue.

### Login

```http
POST /api/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "test@example.com",
  "password": "securePassword123"
}
```

On success, the API sets an `access_token` HTTP-only cookie and returns:

```json
{
  "Message": "Login successful",
  "user_name": "testuser"
}
```

Invalid credentials return HTTP `401`.

### Get profile

```http
GET /api/profile
Cookie: access_token=<jwt>
```

Requires a valid `access_token` cookie. Successful response:

```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "role": "user",
  "created_at": "2026-01-01T12:00:00",
  "updated_at": "2026-01-01T12:00:00"
}
```

### Logout

The frontend calls:

```http
POST /api/logout
```

However, no `/api/logout` endpoint is currently implemented in `app/main.py`. Logout should be implemented by clearing the `access_token` cookie.

## Frontend Routes

| URL | Component | Purpose |
|---|---|---|
| `/` | `Login` | Default login page |
| `/login` | `Login` | User login |
| `/register` | `Register` | New account registration |
| `/profile` | `Profile` | Authenticated user profile |

The frontend Axios client uses:

- Base URL: `http://localhost:8000/api`
- Credentials: enabled
- Timeout: 5 seconds
- Content type: `application/json`

## Authentication Flow

1. A visitor registers through `/register`.
2. The backend hashes the password using Argon2.
3. The frontend navigates to `/login`.
4. The visitor submits email and password.
5. FastAPI verifies the password hash.
6. A signed JWT is created with the user ID as `sub`.
7. The backend stores the JWT in an HTTP-only cookie.
8. Profile requests include the cookie automatically.
9. FastAPI verifies the JWT, loads the matching database user, and returns profile data.

The access cookie is configured with:

- `httponly=True`
- `secure=False`
- `samesite="lax"`
- `path="/"`
- Maximum age: 30 minutes

The `secure=False` setting is appropriate only for local HTTP development. Production deployments should use HTTPS and set `secure=True`.

## Available Commands

### Frontend

Run from `frontend/`:

```powershell
npm run dev      # Start Vite development server
npm run build    # Type-check and build for production
npm run lint     # Run Oxlint
npm run preview  # Preview a production build
```

### Backend

Run from `user_auth_sq1/`:

```powershell
python -m uvicorn app.main:app --reload
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Development Notes

### CORS

The backend allows requests from:

```text
http://localhost:5173
```

If the frontend is opened through a different host or port, update the `allow_origins` list in `app/main.py`.

### Password Security

Passwords are hashed with Argon2 before database storage. Plain-text passwords are not stored by the registration endpoint.

### Database Session

`get_db()` opens a SQLAlchemy session for each request and closes it afterward. The login, registration, and profile routes execute raw SQL through that session.

### Known Items to Improve

The repository has several areas that should be addressed before production:

- Add a `/api/logout` endpoint that deletes the access cookie.
- Remove the password hash from the registration response.
- Add a maximum password length in `LoginRequest` and `RegisterRequest`.
- Align `app/models.py` with the `password_hash` database column.
- Add database migrations with Alembic or a managed schema setup.
- Add unique database constraint handling for duplicate usernames and emails.
- Add backend tests and frontend tests.
- Convert JWT exceptions into consistent HTTP `401` responses.
- Use environment-specific CORS origins and cookie settings.
- Add role-based authorization if admin routes are planned.

## Troubleshooting

### `ModuleNotFoundError: No module named app`

Make sure the terminal is inside `user_auth_sq1/` and run:

```powershell
cd .\user_auth_sq1
python -m uvicorn app.main:app --reload
```

### Database connection failure

Check:

- PostgreSQL is running.
- Database credentials are correct.
- `DB_HOST`, `DB_PORT`, and `DB_NAME` match the PostgreSQL setup.
- The `user_table` exists.

### CORS errors in the browser

Confirm the frontend is running on `http://localhost:5173` and that the backend CORS configuration allows that origin.

### Profile redirects to login

Verify that login succeeded and that the browser accepted the `access_token` cookie. API requests must retain credentials with `withCredentials: true`.

### Login or profile fails because of token configuration

Make sure `JWT_SECRET_KEY`, `JWT_ALGORITHM`, and `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` are defined in `user_auth_sq1/.env`.

### Port already in use

Start FastAPI on a different port:

```powershell
python -m uvicorn app.main:app --reload --port 8001
```

If you change the backend port, update the Axios `baseURL` in `frontend/src/api/axios.ts`.
