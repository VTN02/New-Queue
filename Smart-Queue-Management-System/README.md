# Smart Queue Management System

A full MERN-stack queue management application with **complete authentication, registration, admin approval, role-based access control, and user dashboards**.

## Features

- **Auth & accounts**
  - Register with full name, email, phone, password (bcrypt hashed)
  - Admin approval workflow: every new account starts as `Pending`
  - Login with `Pending` / `Rejected` / `Inactive` status messages
  - JWT sessions (7-day expiry) + logout
  - Role-based access control (`Admin` / `User`) enforced on **both** frontend and backend
- **Queue**
  - Join queue with service type (auto-linked to your account)
  - Queue status with people ahead and estimated wait
  - Live queue dashboard for admins (call next / complete / reset)
- **User dashboard**
  - Current queue number, position, estimated wait, completed count
  - Quick actions: join queue, queue status, history, profile
  - Queue history table
  - Profile management (name & phone; role is never editable)
- **Admin panel**
  - Dashboard with user + queue statistics
  - Pending approvals (approve / reject with optional reason)
  - User management with search, filters, details, deactivate, delete
  - Queue operations and settings
- Input validation, toasts, loading states, empty states, confirmation dialogs, responsive UI

## Requirements

- Node.js 18+
- MongoDB local or MongoDB Atlas

## Setup

### 1. Backend
```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

`npm run seed` inserts sample queue data and **creates the default admin**:

| Field | Value |
| ----- | ----- |
| Email | `admin@queueflow.com` |
| Password | `admin` |
| Role | `Admin` |

> ⚠️ Change the admin password and `JWT_SECRET` in `server/.env` before going live.

### 2. Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Environment variables (`server/.env`)

```
PORT=5000
MONGO_URI=...                      # MongoDB connection string
CLIENT_URL=http://localhost:5173   # CORS origin
JWT_SECRET=...                     # long random secret for signing JWTs
JWT_EXPIRES_IN=7d
DEFAULT_ADMIN_EMAIL=admin@queueflow.com
DEFAULT_ADMIN_PASSWORD=admin
```

Frontend API URL defaults to `http://localhost:5000/api`; override with `VITE_API_URL` in a `client/.env` file.

## Workflow

```
Register → Pending → Admin approves at /admin/pending-users → Login → Role-based dashboard → Queue features
```

## API

### Authentication
- `POST /api/auth/register` — create account (status `Pending`)
- `POST /api/auth/login` — JWT login (`Pending`/`Rejected`/`Inactive` blocked with clear messages)
- `POST /api/auth/logout`
- `GET /api/auth/me` — current user (protected)

### Users (protected — `User` role)
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/users/dashboard` — current queue, position, ETA, completed count
- `GET /api/users/queue-history`

### Admin (protected — `Admin` role)
- `GET /api/admin/users` — optional `?search=&status=&role=`
- `GET /api/admin/users/pending`
- `PUT /api/admin/users/:id/approve`
- `PUT /api/admin/users/:id/reject`  — body `{ reason }`
- `PUT /api/admin/users/:id/deactivate`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/stats`

### Queue
- `POST /api/queue/join` (authenticated user)
- `GET /api/queue/status/:queueNumber`
- `GET /api/queue/summary` (public live info)
- `GET /api/queue` (public board)
- `GET /api/queue/dashboard` (admin)
- `POST /api/queue/next` (admin)
- `PUT /api/queue/:id/complete` (admin)
- `DELETE /api/queue/reset` (admin)

## Security notes

- Passwords are stored as **bcrypt hashes only** — never plain text.
- The backend verifies JWT, account status and role on every protected route; the frontend never decides authorization.
- A user can never approve themselves, change their role, or call admin APIs.
- `DELETE /api/queue/reset` and user deletions require a confirmation dialog in the UI.
