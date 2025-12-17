# Notes App (React + Django REST Framework)

A full-stack Notes app with a React (Vite) frontend and a Django REST Framework backend. It uses JWT authentication (access + refresh tokens), protected routes, and basic CRUD for personal notes.

## Live Demo

- Frontend: https://notes-app-jade-nine-93.vercel.app
- Backend: https://django-react-project-8yjd.onrender.com

---

## Project Overview

This app lets users:

- Register an account
- Log in to receive JWT tokens
- Create and view their own notes
- Delete notes

All note endpoints are protected—users must be authenticated to read/write data.

---

## Features

- **Authentication**: JWT login with access & refresh tokens
- **Notes CRUD**: Create notes, list notes, delete notes
- **Protected routes**: Frontend route-guard checks token expiry and refreshes tokens when needed
- **Per-user data isolation**: Notes are tied to the authenticated user

---

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios
- **Backend**: Django, Django REST Framework
- **Authentication**: `djangorestframework-simplejwt` (JWT access/refresh)
- **Deployment**:
  - Backend: Render (Gunicorn via `Procfile`)
  - Frontend: Vercel (SPA rewrites via `vercel.json`)

---

## Project Architecture

High-level flow:

1. User registers or logs in from the React app.
2. Backend returns JWT tokens (`access`, `refresh`).
3. Frontend stores tokens in `localStorage`.
4. Axios interceptor automatically attaches `Authorization: Bearer <access>` to API calls.
5. Protected routes check token expiration. If expired, the app calls the refresh endpoint to get a new access token.
6. Notes endpoints require authentication and only return notes belonging to the current user.

---

## Folder Structure

```
.
├─ backend/
│  ├─ manage.py
│  ├─ requirements.txt
│  ├─ Procfile
│  ├─ db.sqlite3
│  ├─ backend/
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  └─ wsgi.py
│  └─ api/
│     ├─ models.py
│     ├─ serializers.py
│     ├─ views.py
│     ├─ urls.py
│     └─ migrations/
└─ frontend/
   ├─ package.json
   ├─ vite.config.js
   ├─ vercel.json
   ├─ .env
   └─ src/
      ├─ api.js
      ├─ constants.js
      ├─ components/
      │  ├─ Form.jsx
      │  ├─ ProtectedRoute.jsx
      │  └─ Notes.jsx
      └─ pages/
         ├─ Login.jsx
         ├─ Register.jsx
         └─ Home.jsx
```

---

## Authentication Flow (JWT)

- **Register**: `POST /api/user/register/`
- **Login**: `POST /api/token/` → returns `{ access, refresh }`
- **Refresh**: `POST /api/token/refresh/` → returns new `{ access }`

Frontend behavior:

- Access token is used for API calls.
- Refresh token is used only when the access token is expired.
- Protected pages use a route guard to:
  - check for an access token
  - decode expiry time
  - refresh if needed
  - otherwise redirect to `/login`

---

## API Communication (Axios)

The frontend uses a centralized Axios instance in `frontend/src/api.js`:

- **`baseURL`** comes from `VITE_API_URL`
- A request interceptor reads the access token from `localStorage`
- If present, it adds:

```http
Authorization: Bearer <access_token>
```

---

## Backend API Endpoints

Routes exposed by this project:

- **Health**: `GET /` → “Backend is live”
- **Register**: `POST /api/user/register/`
- **Token**: `POST /api/token/`
- **Refresh**: `POST /api/token/refresh/`
- **Notes list/create**: `GET /api/notes/`, `POST /api/notes/`
- **Delete note**: `DELETE /api/notes/delete/<id>/`

---

## Environment Variables

### Frontend (Vite)

Set in Vercel (recommended) or in `frontend/.env` locally. This should point to your backend base URL:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

### Backend (Django)

This project reads `DEBUG` from the environment.

Recommended env vars (especially for deployment):

```bash
DEBUG=False
# Recommended: move SECRET_KEY to env instead of hardcoding
DJANGO_SECRET_KEY=change-me
```

If deploying to a hosted frontend domain, configure trusted origins/CORS appropriately.

---

## Local Setup Instructions

### 1) Backend (Django)

From the repository root:

```bash
# create and activate venv (Windows PowerShell)
py -m venv env
& ".\env\Scripts\Activate.ps1"

cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

### 2) Frontend (React)

In a second terminal:

```bash
cd frontend
npm install

# set API URL for local dev
# (Windows PowerShell)
$env:VITE_API_URL="http://127.0.0.1:8000"

npm run dev
```

Frontend runs at: `http://127.0.0.1:5173`

---

## Deployment

### Backend on Render

- Uses Gunicorn. On Render, bind to the provided `$PORT`:

```text
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

- Ensure Render environment variables are set (at minimum `DEBUG=False`).
- Note: this project currently defaults to SQLite (good for demos; for production you’d typically switch to Postgres).

Health/readiness:

- `GET /` returns “Backend is live” (200 OK). This can be used for Render readiness/health checks.

### Frontend on Vercel

- Deploy `frontend/` as the project root on Vercel.
- Set `VITE_API_URL` in Vercel environment variables to your Render backend URL.
- SPA routing is handled by `frontend/vercel.json` rewrites.

---

## Cold Start Behavior (Free Tier)

If the backend is hosted on a free tier platform (e.g., Render free service), it may sleep during inactivity. The **first request after idle** can take longer (often several seconds) while the server wakes up.

In practice on Render free tier, the first request can take around **~30–50 seconds** after a period of inactivity.

Expected behavior:

- First API call may feel slow
- Subsequent calls become fast once the service is warm

---

## Known Limitations (Free Tier)

- **Cold starts**: the backend may sleep and delay the first request.
- **SQLite**: the backend uses SQLite by default (fine for learning/demos; not ideal for serious production use).
- **Demo tradeoffs**: some settings are intentionally relaxed to keep development simple.

---

## Error Handling & Expected Behavior

- **Empty credentials**: browser validation prevents submitting empty fields
- **Wrong username/password**: backend returns **401 Unauthorized**
- **Missing/expired access token**:
  - protected routes redirect to `/login`
  - API calls may fail with **401**
  - the app attempts token refresh when it detects expiry
- **404 Not Found**: typically means the frontend is calling an endpoint that doesn’t exist on the backend

---

## Security Considerations

- **JWT expiration + refresh**:
  - Access tokens expire and are checked client-side.
  - When expired, the app uses the refresh token to get a new access token (`/api/token/refresh/`).
  - If refresh fails, the user is redirected to `/login`.
- **JWT storage**: tokens are stored in `localStorage` (simple for student projects; more exposed to XSS than HttpOnly cookies).
- **CORS**:
  - The backend currently allows all origins (`CORS_ALLOW_ALL_ORIGINS = True`). This keeps setup easy, but you should restrict this for real production apps.
- **CSRF / trusted origins**:
  - JWT auth via `Authorization` headers generally doesn’t rely on CSRF tokens like cookie-based auth.
  - The backend configuration includes `CSRF_TRUSTED_ORIGINS` for the deployed frontend domain (Vercel).
- **Secret management**:
  - Avoid hardcoding Django `SECRET_KEY` in production—use environment variables.

---

## Resume Summary

- Built and deployed a full-stack Notes app (React + Vite, Django REST Framework) with JWT auth (access/refresh), protected routes, and authenticated CRUD APIs; hosted frontend on Vercel and backend on Render.
