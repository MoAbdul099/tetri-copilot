# Tetri Copilot - Claude Code Instructions

## Product Scope

This repository is for Tetri Copilot only.

Tetri Copilot is an AI-first lightweight SME operating assistant for:
- AI business assistance
- accounting and invoice guidance
- expense categorization
- compliance guidance
- document generation
- reminders and notifications
- workspace-based business operations

Do not build Tetri Books, payroll, HR, inventory, full ERP, or unrelated modules unless explicitly requested.

---

## Source of Truth

Before implementing any feature, read:

- docs/BRD-v2.1.md
- docs/SRS-v2.0.md
- docs/database/schema.sql
- backend/prisma/schema.prisma

If requirements conflict:
1. BRD defines business intent.
2. SRS defines functional behavior.
4. Prisma/schema.sql define database implementation.

Do not invent business rules.

---

## Development Method

Use vertical-slice development.

Every feature must include:

1. Database / Prisma changes
2. Backend API
3. Controller
4. Service
5. Repository if needed
6. Validation
7. Middleware and permissions
8. Frontend page/components
9. API integration
10. Loading/error states
11. Tests
12. Deployment notes
13. User/admin manual updates

Do not build backend-only features unless explicitly requested.

---

## Tech Stack

Backend:
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL on Ubuntu VPS

Frontend:
- React
- Vite
- Tailwind CSS
- shadcn/ui
- Cloudflare Pages

Authentication:
- Clerk is the source of truth for authentication identity.
- Local users table stores application profile and internal references.

Billing:
- Stripe is the source of truth for payments/subscriptions.
- Local subscriptions table stores synced subscription state for feature gating.

Storage:
- Cloudflare R2 for files and attachments.

AI:
- AI provider should be abstracted.
- AI usage must be checked before every AI request.
- AI usage must be logged.

Deployment:
- Backend: Ubuntu VPS + PM2 + Nginx
- Database: PostgreSQL on Ubuntu VPS
- Frontend: Cloudflare Pages

Email Services and Templates
- Resend
- React Email

AI Provider:
- OpenAI APIs

Analytics:
- PostHog

Error Monitoring:
- Sentry

Forms & Validation:
- React Hook Form + Zod

PDF Generation:
- React PDF


---

## Multi-Tenant Rules

The system is workspace-based.

All tenant-owned data must be filtered by workspace_id.

Never expose cross-workspace data.

Always validate:
- authenticated user
- workspace membership
- role permissions
- subscription limits
- AI usage limits

---

## Backend Module Structure

Each backend feature should follow this structure:

src/modules/[feature]/
  [feature].routes.js
  [feature].controller.js
  [feature].service.js
  [feature].repository.js
  [feature].validation.js
  [feature].constants.js
  [feature].test.js

Controllers must stay thin.
Business logic belongs in services.
Database access belongs in repositories or controlled Prisma service functions.

---

## Frontend Feature Structure

Each frontend feature should follow this structure:

src/features/[feature]/
  pages/
  components/
  hooks/
  services/
  schemas/
  utils/

Each feature must include:
- API service
- page/component
- form validation
- loading state
- error state
- empty state
- success feedback

---

## API Standards

Use REST API under:

/api/v1

Standard success response:

{
  "success": true,
  "data": {},
  "message": ""
}

Standard error response:

{
  "success": false,
  "error": "",
  "details": []
}

Never expose stack traces to frontend.

---

## Database Rules

Use Prisma migrations from:

backend/prisma

Rules:
- Use UUID primary keys.
- Use workspace_id for tenant-owned tables.
- Preserve auditability.
- Do not delete sensitive business records without approval.
- Use soft status changes where applicable.
- Keep schema aligned with uploaded Prisma and SQL schema.

---

## AI Rules

Before every AI request:
1. Validate user authentication.
2. Validate workspace membership.
3. Validate subscription plan.
4. Validate monthly AI request limit.
5. Log request status in ai_usage_logs.

AI requests must support:
- chat
- document_generation
- expense_categorization
- compliance_guidance
- invoice_guidance

Never hardcode AI provider logic directly inside controllers.

---

## Logging Rules

Create activity logs for important user actions.

Create audit logs for admin/system-sensitive changes.

Never log:
- passwords
- JWTs
- Clerk secrets
- Stripe secrets
- AI provider keys
- sensitive financial details

---

## Security Rules

Always:
- validate input
- sanitize payloads
- enforce workspace isolation
- enforce role permissions
- use environment variables
- protect backend with CORS rules
- never trust frontend-only validation

---

## Deployment Rules

Backend:
- deploy to Ubuntu VPS
- run with PM2
- expose through Nginx reverse proxy
- use environment variables
- run prisma migrate deploy before production start

Frontend:
- deploy to Cloudflare Pages
- use VITE_API_BASE_URL
- never expose backend secrets

Database:
- PostgreSQL on Ubuntu VPS
- protect with firewall
- use strong credentials
- apply backups

---

## Feature Completion Definition

A feature is complete only when:

- backend works
- frontend works
- database changes are migrated
- validation is implemented
- permissions are enforced
- tests or test instructions are added
- activity/audit logging is considered
- deployment impact is documented
- user/admin manual is updated

---

## Implementation Behavior

Before coding:
1. Read relevant docs.
2. Inspect existing code.
3. Explain implementation plan.
4. Identify backend, frontend, database, testing, and documentation impact.

After coding:
1. List changed files.
2. Explain what was implemented.
3. Explain how to test.
4. Explain how to deploy.
5. Explain any risks or pending items.

---

## Forbidden Actions

Do not:
- rewrite the full project without approval
- build unrelated Tetri products
- bypass workspace_id filtering
- skip AI usage limit checks
- hardcode secrets
- expose stack traces
- create backend-only features without UI
- create UI-only features without API
- change Prisma schema without explaining migration impact
