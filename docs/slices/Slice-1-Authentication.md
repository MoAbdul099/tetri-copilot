# Slice 1 — Authentication & Workspace Bootstrap


## Objective


Implement the complete authentication and workspace bootstrap foundation for Tetri Copilot using Clerk for authentication/session management and the local PostgreSQL database for application-level user, workspace, and permission management.


This slice establishes:
- secure authentication
- local user synchronization
- owner role assignment
- workspace bootstrap flow
- protected frontend/backend routing
- multi-tenant workspace isolation foundation


This slice must be fully functional end-to-end before moving to the next slice.


---


# Scope


This slice includes:


- Clerk authentication integration
- Sign up
- Sign in
- Forgot password / reset password
- Logout
- Session handling
- Protected frontend routes
- Protected backend routes
- Backend Clerk JWT/session verification
- Local users table synchronization
- Workspace bootstrap flow
- Owner role assignment
- Workspace membership initialization
- Basic protected dashboard placeholder
- Initial onboarding redirect flow
- Activity logging for important auth events where applicable


This slice uses:
- React + Vite
- Tailwind CSS
- shadcn/ui
- Express.js
- PostgreSQL
- Prisma ORM
- Clerk authentication


For MVP:
- Clerk prebuilt authentication UI may be used
- Clerk branding/logo may remain temporarily


---


# Backend Requirements


## Authentication


Implement:
- Clerk backend SDK integration
- JWT/session verification middleware
- Protected API middleware
- Current authenticated user endpoint


## Local User Sync


When a user authenticates successfully:
- create or update local user record
- sync:
  - clerk_user_id
  - email
  - full_name
  - status
  - last_login_at


## Workspace Bootstrap


When a user signs up for the first time:
- create local user
- create workspace
- create workspace membership
- assign owner role automatically


## Backend Structure


Follow backend feature structure:


src/modules/auth/
  auth.routes.js
  auth.controller.js
  auth.service.js
  auth.repository.js
  auth.validation.js


src/modules/users/
src/modules/workspaces/


## API Requirements


Use:
- REST API
- /api/v1


Use centralized:
- error handling
- validation
- auth middleware


Controllers must remain thin.


Business logic belongs in services.


Database access belongs in repositories or controlled Prisma access layer.


---


# Frontend Requirements


## Authentication UI


Use:
- Clerk authentication flow
- Tetri-compatible branding/theme where possible


Implement:
- sign in page
- sign up page
- forgot password flow
- reset password flow


## App Structure


Create:
- protected layout
- authenticated dashboard placeholder
- onboarding redirect flow
- route guards


## UI Technology


Use:
- React
- Tailwind CSS
- shadcn/ui


## UX Requirements


Include:
- loading states
- error states
- success states
- redirect handling
- session persistence


---


# Database Requirements


Follow:
- uploaded Prisma schema
- uploaded SQL schema


Relevant tables:
- users
- workspaces
- workspace_members
- invitations
- activity_logs


## Required User Sync Fields


Sync:
- clerk_user_id
- email
- full_name
- status
- preferred_language_id if applicable
- last_login_at


## Workspace Bootstrap Rules


On first signup:
- create workspace
- create workspace member entry
- assign owner role


Use:
- workspace_id isolation
- UUID IDs
- Prisma migrations


---


# API Endpoints


## Authentication


### GET
/api/v1/auth/me


Returns:
- authenticated user
- workspace membership
- role


---


## Workspace Bootstrap


### POST
/api/v1/workspaces/bootstrap


Creates:
- initial workspace
- owner membership


---


## Health Check


### GET
/api/v1/health


Returns API status.


---


# User Flows


## New User Signup Flow


1. User signs up with Clerk
2. Clerk authenticates user
3. Backend verifies Clerk session
4. Local user record created
5. Workspace created
6. Owner role assigned
7. Workspace membership created
8. User redirected to onboarding/dashboard


---


## Existing User Login Flow


1. User signs in
2. Clerk authenticates session
3. Backend verifies token/session
4. Local user updated
5. Workspace membership validated
6. User redirected to dashboard


---


## Protected Route Flow


1. Frontend checks auth state
2. Backend verifies Clerk session
3. Backend validates workspace membership
4. Request proceeds


---


# Business Rules


## Authentication Rules


- Clerk is source of truth for authentication identity.
- Local database stores application profile and relationships.
- Backend must never trust frontend auth state alone.


## Workspace Rules


- Every operational user belongs to at least one workspace.
- Workspace data must remain isolated.
- Cross-workspace access is forbidden.


## Owner Rules


The first workspace user:
- automatically receives owner role
- acts as workspace/company administrator


Owner can later:
- configure workspace
- configure company profile
- invite users
- activate/inactivate users
- manage workspace users


---


# Roles & Permissions


## owner


Full workspace permissions.


Can:
- manage workspace
- manage users
- configure settings
- access all workspace data


---


## user


Operational access.


Can:
- use allowed application features
- access permitted workspace data


Cannot:
- manage workspace ownership


---


## viewer


Read-only access.


Cannot:
- modify operational data


---


## platform admin


Separate from workspace roles.


Reserved for future platform/system administration.


---


# Validation Rules


Validate:
- authenticated session
- workspace membership
- owner role assignment
- duplicate user prevention
- duplicate workspace membership prevention


Validate all:
- API payloads
- request parameters
- route access


Use centralized validation approach.


---


# Security Rules


## Required


- Verify Clerk JWT/session on backend
- Use environment variables
- Enforce workspace isolation
- Enforce protected backend routes
- Use CORS restrictions
- Sanitize inputs
- Validate payloads


## Forbidden


- Hardcoded secrets
- Exposing stack traces
- Trusting frontend auth alone
- Cross-workspace access


---


# Environment Variables


## Backend


Required:
- DATABASE_URL
- CLERK_SECRET_KEY
- CLERK_PUBLISHABLE_KEY
- CLERK_JWT_KEY
- FRONTEND_URL
- PORT


## Frontend


Required:
- VITE_CLERK_PUBLISHABLE_KEY
- VITE_API_BASE_URL


Document all environment setup steps.


---


# Testing Requirements


Add tests or testing instructions for:


## Authentication


- sign up
- sign in
- forgot password
- logout


## Authorization


- protected routes
- unauthorized access
- invalid token handling


## Workspace Bootstrap


- owner role assignment
- workspace creation
- workspace membership creation


## Multi-Tenant Isolation


- validate workspace filtering basics


---


# Deployment Notes


## Backend


Deploy using:
- Ubuntu VPS
- PM2
- Nginx reverse proxy


Run:
- Prisma migrations
- environment validation


## Frontend


Deploy to:
- Cloudflare Pages


Configure:
- Clerk frontend settings
- environment variables
- API base URL


---


# Manual/Help Updates


Update:
- README.md
- user manual
- admin onboarding guide


Document:
- signup flow
- login flow
- password reset flow
- workspace onboarding
- logout flow


---


# Suggested Future Enhancements


Possible future additions:
- MFA
- social login
- invite-based onboarding
- email verification enforcement
- session management dashboard
- audit trail enhancements


Do not implement these unless explicitly approved.


---


# Out of Scope


Do not implement:
- billing
- Stripe subscriptions
- invoices
- expenses
- AI chat
- AI usage limits
- compliance features
- document generation
- notifications
- advanced RBAC permissions
- admin control panel


These belong to later slices.


---


# Completion Criteria


This slice is complete only when:


- authentication works end-to-end
- backend auth protection works
- frontend route protection works
- local users sync works
- owner role assignment works
- workspace bootstrap works
- protected dashboard is accessible
- environment setup is documented
- tests/testing instructions are added
- README/manuals are updated