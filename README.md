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

Edit `backend/.env` and set:
- `DATABASE_URL` — your local PostgreSQL connection string
- Other values as needed for the sprint you are working on

### 3. Frontend environment

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and set `VITE_API_BASE_URL` to your backend URL (default: `http://localhost:5000`).

### 4. Database setup

Create the database in PostgreSQL:

```sql
CREATE DATABASE tetri_copilot_db;
```

Run Prisma migrations:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start development servers

Backend:
```bash
npm run dev:backend
```

Frontend (new terminal):
```bash
npm run dev:frontend
```

The backend runs on `http://localhost:5000`.
The frontend runs on `http://localhost:5173`.

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

### Frontend (`cd frontend`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## API Reference

Base URL: `/api/v1`

### Health Check

```
GET /api/v1/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "0.1.0",
    "environment": "development",
    "timestamp": "2026-05-12T00:00:00.000Z",
    "services": {
      "database": {
        "status": "ok",
        "latencyMs": 4
      }
    }
  },
  "message": "Service is healthy"
}
```

---

## Project Structure

```
tetri-copilot/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Source of truth for DB schema
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js             # Env validation (Zod)
│   │   │   └── database.js        # Prisma client singleton
│   │   ├── lib/
│   │   │   └── prisma.js          # Re-exports Prisma client
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── notFound.js
│   │   │   └── requestLogger.js
│   │   ├── modules/
│   │   │   └── health/            # Vertical-slice feature module
│   │   │       ├── health.controller.js
│   │   │       └── health.routes.js
│   │   ├── utils/
│   │   │   └── response.js        # Standard response helpers
│   │   ├── app.js                 # Express app factory
│   │   └── server.js              # HTTP server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   └── status/
│   │   │       └── pages/
│   │   │           └── StatusPage.jsx
│   │   ├── lib/
│   │   │   └── api.js             # Axios instance
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
├── deploy/
│   ├── nginx/
│   │   └── tetri-copilot.conf
│   ├── pm2/
│   │   └── ecosystem.config.js
│   └── scripts/
│       ├── deploy-backend.sh
│       └── setup-vps.sh
├── docs/
│   ├── BRD-v2.1.md
│   ├── SRS-v2.0.md
│   └── database/
│       ├── schema_v2.prisma
│       └── schema_v2.sql
├── CLAUDE.md
├── .gitignore
├── package.json
└── README.md
```

---

## Development Milestones

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Foundation Setup | In Progress |
| Sprint 1 | Authentication & Roles (Clerk) | Pending |
| Sprint 2 | Company Setup & Localization | Pending |
| Sprint 3 | Dashboards & Reporting | Pending |
| Sprint 4 | Invoice Management | Pending |
| Sprint 5 | Expense Management | Pending |
| Sprint 6 | Compliance Reminder Engine | Pending |
| Sprint 7 | AI Features | Pending |
| Sprint 8 | Billing & Production Deployment | Pending |

---

## Deployment

### Backend (Ubuntu VPS)

See `deploy/scripts/deploy-backend.sh` for the deployment script.

```bash
# First-time setup
bash deploy/scripts/setup-vps.sh

# Deploy
bash deploy/scripts/deploy-backend.sh
```

### Frontend (Cloudflare Pages)

1. Connect the GitHub repo to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set root directory: `frontend`
5. Set environment variable: `VITE_API_BASE_URL=https://api.yourdomain.com`

### Nginx

Copy `deploy/nginx/tetri-copilot.conf` to `/etc/nginx/sites-available/` and enable it.

---

## Environment Variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | `development`, `production`, `test` (default: `development`) |
| `PORT` | No | HTTP port (default: `5000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CORS_ORIGIN` | No | Allowed frontend origin (default: `http://localhost:5173`) |
| `CLERK_SECRET_KEY` | Sprint 1 | Clerk backend secret |
| `STRIPE_SECRET_KEY` | Sprint 8 | Stripe secret key |
| `OPENAI_API_KEY` | Sprint 7 | OpenAI API key |
| `RESEND_API_KEY` | Sprint 6 | Resend email API key |
| `R2_ACCESS_KEY_ID` | Sprint 5 | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Sprint 5 | Cloudflare R2 secret |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL |

---

## Source of Truth

Before implementing any feature, read:

1. `docs/BRD-v2.1.md` — Business requirements
2. `docs/SRS-v2.0.md` — Functional specifications
3. `docs/database/schema_v2.prisma` — Database schema
4. `backend/prisma/schema.prisma` — Active Prisma schema
