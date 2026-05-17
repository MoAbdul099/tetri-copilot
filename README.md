# Tetri Copilot

AI-First Lightweight SME Operating Assistant.

Built for SMEs, freelancers, and small operational teams across Georgia, UAE, Saudi Arabia, and Qatar.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Frontend | React + Vite + Tailwind CSS |
| Auth | Clerk |
| Billing | Stripe |
| AI | OpenAI |
| Storage | Cloudflare R2 |
| Email | Resend |
| Frontend Hosting | Cloudflare Pages |
| Backend Hosting | Ubuntu VPS + PM2 + Nginx |

---

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- A [Clerk](https://clerk.com) account (free tier works)

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/tetri-copilot.git
cd tetri-copilot
npm install
```

### 2. Backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set these required values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/tetri_copilot_db
CLERK_SECRET_KEY=sk_test_...         # from Clerk Dashboard → API Keys
CLERK_PUBLISHABLE_KEY=pk_test_...    # from Clerk Dashboard → API Keys
CORS_ORIGIN=http://localhost:5173
```

> **Note:** If your database password contains special characters like `@` or `#`, URL-encode them:
> `@` → `%40`, `#` → `%23`
> Example: `password123@#` → `password123%40%23`

### 3. Frontend environment

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...    # same key as backend
```

### 4. Clerk account setup

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create an application
2. Under **API Keys**, copy your `Publishable key` and `Secret key`
3. Under **Paths**, configure:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`
4. Under **Allowed redirect URLs** (for production), add your Cloudflare Pages domain

### 5. Database setup

Create the database:

```sql
CREATE DATABASE tetri_copilot_db;
```

Run Prisma migrations (from the repo root):

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

Or using the local Prisma binary:

```bash
node_modules/.bin/prisma migrate dev
```

### 6. Start development servers

Backend:
```bash
npm run dev:backend
```

Frontend (new terminal):
```bash
npm run dev:frontend
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

---

## User Flows (Slice 1)

### New User Sign Up

1. Visit `http://localhost:5173` — redirects to `/dashboard`
2. Not signed in → redirects to `/sign-in`
3. Click "Sign up" → goes to `/sign-up`
4. Complete Clerk sign-up (email + password or social)
5. Redirected to `/dashboard` → `ProtectedLayout` calls `GET /api/v1/auth/me`
6. Local user created in DB + no workspace found → redirects to `/onboarding`
7. Enter workspace/business name → submits `POST /api/v1/workspaces/bootstrap`
8. Workspace created, owner role assigned → redirects to `/dashboard`

### Returning User Sign In

1. Visit any protected route
2. Not signed in → redirects to `/sign-in`
3. Complete Clerk sign-in
4. Redirected to `/dashboard` → `GET /api/v1/auth/me` syncs user
5. Workspace found → dashboard loads

### Sign Out

- Click "Sign out" button on dashboard or onboarding page
- Clerk session cleared → redirected to `/sign-in`

---

## API Reference

Base URL: `/api/v1`

All protected endpoints require:
```
Authorization: Bearer <clerk-session-token>
```

### Health Check

```
GET /api/v1/health
```

### Authentication

```
GET /api/v1/auth/me
```

**Protected.** Creates or updates local user record from Clerk, returns user profile and workspace membership.

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Jane Smith",
      "status": "active",
      "isPlatformAdmin": false
    },
    "workspace": {
      "id": "uuid",
      "name": "Acme Consulting",
      "role": "owner"
    }
  },
  "message": "User profile retrieved"
}
```

If user has no workspace yet, `workspace` is `null`.

### Workspace Bootstrap

```
POST /api/v1/workspaces/bootstrap
```

**Protected.** Creates initial workspace and assigns the caller as owner. Idempotent — returns existing workspace if already bootstrapped.

Request body:
```json
{ "name": "Acme Consulting" }
```

Response (201 on create, 200 if already existed):
```json
{
  "success": true,
  "data": {
    "workspace": { "id": "uuid", "name": "Acme Consulting", ... },
    "membership": { "role": "owner", "status": "active" }
  },
  "message": "Workspace created successfully"
}
```

---

## Testing Instructions (Slice 1)

### Authentication tests

| Test | Steps | Expected |
|---|---|---|
| Sign up | Visit `/sign-up`, create account | Redirected through onboarding to dashboard |
| Sign in | Sign out, visit `/sign-in`, sign in | Dashboard loads with workspace |
| Protected route (unauthenticated) | Clear session, visit `/dashboard` directly | Redirected to `/sign-in` |
| Onboarding skip | Sign up, skip onboarding URL | Stays on `/onboarding` until workspace created |
| Double bootstrap | Call `POST /api/v1/workspaces/bootstrap` twice | Returns 200 with existing workspace |

### API tests (Postman / Thunder Client)

```
# 401 — no token
GET http://localhost:5000/api/v1/auth/me

# 401 — invalid token
GET http://localhost:5000/api/v1/auth/me
Authorization: Bearer not_a_real_token

# 400 — empty workspace name (with valid token)
POST http://localhost:5000/api/v1/workspaces/bootstrap
Authorization: Bearer <valid-token>
Body: { "name": "" }

# 200 — health check (no auth needed)
GET http://localhost:5000/api/v1/health
```

To get a valid token for API testing: open browser DevTools on your signed-in frontend, run:
```js
window.Clerk.session.getToken().then(console.log)
```

### Database verification (Prisma Studio)

```bash
cd backend && npx prisma studio
```

Check after sign-up:
- `users` table: new row with `clerk_user_id` set
- `workspaces` table: new row with your workspace name
- `workspace_members` table: row linking user → workspace with `role: owner`
- `activity_logs` table: `user.signup` and `workspace.created` entries

---

## Available Scripts

### Root

| Script | Description |
|---|---|
| `npm run dev:backend` | Start backend in development mode |
| `npm run dev:frontend` | Start frontend in development mode |

### Backend (`cd backend`)

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start in production mode |
| `npm run db:generate` | Run `prisma generate` |
| `npm run db:migrate:dev` | Run `prisma migrate dev` |
| `npm run db:migrate:deploy` | Run `prisma migrate deploy` (production) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed reference data (languages, currencies, country profiles) |

### Frontend (`cd frontend`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Project Structure

```
tetri-copilot/
├── backend/
│   ├── prisma/
│   │   ├── migrations/                # Auto-generated migration files
│   │   └── schema.prisma              # Source of truth for DB schema
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                 # Env validation (Zod)
│   │   │   └── database.js            # Prisma client singleton
│   │   ├── lib/
│   │   │   └── prisma.js              # Re-exports Prisma client
│   │   ├── middleware/
│   │   │   ├── errorHandler.js        # Centralized error handler (ZodError aware)
│   │   │   ├── notFound.js
│   │   │   ├── requestLogger.js
│   │   │   └── requireAuth.js         # Clerk JWT verification + protect middleware
│   │   ├── modules/
│   │   │   ├── auth/                  # GET /api/v1/auth/me
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.repository.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.validation.js
│   │   │   ├── health/                # GET /api/v1/health
│   │   │   │   ├── health.controller.js
│   │   │   │   └── health.routes.js
│   │   │   └── workspaces/            # POST /api/v1/workspaces/bootstrap
│   │   │       ├── workspaces.controller.js
│   │   │       ├── workspaces.repository.js
│   │   │       ├── workspaces.routes.js
│   │   │       ├── workspaces.service.js
│   │   │       └── workspaces.validation.js
│   │   ├── utils/
│   │   │   └── response.js            # Standard response helpers
│   │   ├── app.js                     # Express app factory
│   │   └── server.js                  # HTTP server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── ProtectedLayout.jsx  # Auth + workspace guard
│   │   │   └── ui/
│   │   │       └── LoadingSpinner.jsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── SignInPage.jsx
│   │   │   │   │   └── SignUpPage.jsx
│   │   │   │   └── services/
│   │   │   │       └── authService.js   # GET /api/v1/auth/me
│   │   │   ├── dashboard/
│   │   │   │   └── pages/
│   │   │   │       └── DashboardPage.jsx  # Placeholder dashboard
│   │   │   └── onboarding/
│   │   │       ├── pages/
│   │   │       │   └── OnboardingPage.jsx  # Workspace setup form
│   │   │       └── services/
│   │   │           └── onboardingService.js
│   │   ├── lib/
│   │   │   └── api.js                 # Axios + Clerk token interceptor
│   │   ├── App.jsx                    # Routing + ClerkApiSync
│   │   ├── index.css
│   │   └── main.jsx                   # ClerkProvider wrapper
│   ├── .env.example
│   ├── index.html
│   └── package.json
├── deploy/
├── docs/
├── CLAUDE.md
├── package.json
└── README.md
```

---

## Deployment Notes (Slice 1)

### Backend (Ubuntu VPS)

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run database migrations
cd backend
node ../node_modules/.bin/prisma migrate deploy

# Restart PM2
pm2 restart tetri-copilot-api
```

Required environment variables on VPS (add to `.env` or PM2 ecosystem config):
```
DATABASE_URL=...
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CORS_ORIGIN=https://your-frontend.pages.dev
NODE_ENV=production
PORT=5000
```

### Frontend (Cloudflare Pages)

Set these environment variables in Cloudflare Pages dashboard:

```
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

Build settings:
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `frontend`

Also in Clerk Dashboard → your app:
- Add your Cloudflare Pages domain to **Allowed redirect URLs**
- Set **After sign-in/sign-up URL** to `https://your-app.pages.dev/dashboard`

---

## Environment Variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | `development` / `production` (default: `development`) |
| `PORT` | No | HTTP port (default: `5000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (URL-encode special chars in password) |
| `CORS_ORIGIN` | No | Allowed frontend origin (default: `http://localhost:5173`) |
| `CLERK_SECRET_KEY` | Yes | Clerk backend secret key |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `STRIPE_SECRET_KEY` | Sprint 8 | Stripe secret key |
| `OPENAI_API_KEY` | Sprint 7 | OpenAI API key |
| `RESEND_API_KEY` | Sprint 6 | Resend email API key |
| `R2_ACCESS_KEY_ID` | Sprint 5 | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Sprint 5 | Cloudflare R2 secret |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |

---

## Development Milestones

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Foundation Setup | Done |
| Slice 1 | Authentication & Workspace Bootstrap | Done |
| Slice 2 | Workspace & Company Setup | Done |
| Slice 3 | Workspace User Management & Roles | Pending |
| Sprint 3 | Dashboards & Reporting | Pending |
| Sprint 4 | Invoice Management | Pending |
| Sprint 5 | Expense Management | Pending |
| Sprint 6 | Compliance Reminder Engine | Pending |
| Sprint 7 | AI Features | Pending |
| Sprint 8 | Billing & Production Deployment | Pending |

---

## Slice 2 — Workspace & Company Setup

### New endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/workspaces/current` | any member | Get current workspace with localization |
| PATCH | `/api/v1/workspaces/current` | owner | Update workspace name / localization defaults |
| GET | `/api/v1/company` | any member | Get company profile |
| PATCH | `/api/v1/company` | owner | Upsert company profile |
| GET | `/api/v1/settings` | any member | Get workspace preferences |
| PATCH | `/api/v1/settings` | owner | Upsert workspace preferences |
| GET | `/api/v1/countries` | any member | List active country profiles |
| GET | `/api/v1/languages` | any member | List languages |
| GET | `/api/v1/currencies` | any member | List currencies |
| GET | `/api/v1/members` | any member | List members and pending invitations |
| POST | `/api/v1/members/invite` | owner | Invite user by email |
| PATCH | `/api/v1/members/:id/status` | owner | Activate or deactivate a member |

### Seed reference data

```bash
cd backend && npm run db:seed
```

Inserts: English / Arabic / Georgian languages; USD / AED / SAR / QAR / GEL currencies; country profiles for UAE, Saudi Arabia, Qatar, and Georgia.

### Setup wizard flow

1. New user completes onboarding → workspace created → redirected to `/setup`
2. **Step 1 — Company Profile:** fill company name and optional fields → PATCH `/api/v1/company`
3. **Step 2 — Localization:** select country (auto-fills currency + language) → PATCH `/api/v1/workspaces/current`
4. **Step 3 — Preferences:** invoice prefix, due days, tax rate, notifications → PATCH `/api/v1/settings` → redirect to `/dashboard`

### Slice 2 testing scenarios

| # | Test | Expected |
|---|------|----------|
| 1 | Complete 3-step setup wizard | Redirect to `/dashboard`, setupComplete = true |
| 2 | Navigate to `/setup` after completion | Redirect to `/dashboard` |
| 3 | Edit company name in Settings → Company tab | Persists on reload |
| 4 | Change country in Localization tab | Currency + language auto-fill |
| 5 | Owner changes invoice prefix | Persists on reload |
| 6 | Owner invites member via Members tab | Appears in Pending Invitations |
| 7 | Owner deactivates a member | Status → Inactive |
| 8 | Non-owner views Settings | Read-only banner shown, fields disabled |
| 9 | PATCH `/api/v1/company` with non-owner token | 403 Forbidden |
| 10 | GET `/api/v1/company` from different workspace session | Returns that workspace's data only |

---

## Source of Truth

Before implementing any feature, read:

1. `docs/BRD-v2.1.md` — Business requirements
2. `docs/SRS-v2.0.md` — Functional specifications
3. `backend/prisma/schema.prisma` — Active Prisma schema
4. `docs/slices/` — Per-slice implementation specs
