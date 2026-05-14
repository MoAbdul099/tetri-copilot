# Slice 2 — Workspace & Company Setup


## Objective


Implement the complete workspace, company profile, and workspace configuration setup flow for Tetri Copilot.


This slice establishes:
- workspace onboarding completion
- company profile management
- workspace configuration management
- localization defaults
- workspace settings foundation
- workspace user management foundation


This slice must provide the operational workspace foundation required for all future modules.


---


# Scope


This slice includes:


- Workspace setup flow
- Company profile creation and management
- Workspace settings management
- Country profile selection
- Default currency selection
- Default language selection
- Tax configuration foundation
- Workspace profile editing
- Workspace member management foundation
- User invitation foundation
- Workspace activation/inactivation logic
- Workspace settings APIs
- Protected workspace settings pages
- File/logo upload foundation if applicable


This slice uses:
- React + Vite
- Tailwind CSS
- shadcn/ui
- Express.js
- PostgreSQL
- Prisma ORM


This slice depends on:
- Slice 1 Authentication & Workspace Bootstrap


---


# Backend Requirements


## Workspace Setup


Implement:
- workspace profile retrieval
- workspace profile update
- workspace settings retrieval
- workspace settings update


## Company Profile


Implement:
- company creation/update
- company retrieval
- logo upload reference handling if applicable


Use tables:
- companies
- company_settings
- workspaces


## Workspace Member Management


Implement foundation for:
- listing workspace users
- inviting users
- activating/inactivating users
- role retrieval


Do not implement advanced permissions yet.


## Country & Localization Setup


Implement:
- country profile retrieval
- currency retrieval
- language retrieval


Use:
- country_profiles
- currencies
- languages


## Backend Structure


Use:


src/modules/workspaces/
src/modules/companies/
src/modules/settings/
src/modules/members/


Follow:
- service layer architecture
- centralized validation
- centralized error handling


Controllers must remain thin.


---


# Frontend Requirements


## Workspace Setup Flow


Implement:
- onboarding/setup wizard or setup page
- workspace setup completion flow
- company profile setup UI
- workspace settings UI


## Company Profile UI


Implement:
- company name
- legal name
- email
- phone
- website
- address
- city
- postal code
- tax number
- registration number
- logo upload placeholder/foundation


## Workspace Settings UI


Implement:
- invoice prefix
- default invoice due days
- default tax rate
- reminder lead days
- notification settings


## Localization UI


Implement:
- country selection
- currency selection
- language selection


## Workspace Member UI


Implement:
- members list
- basic invitation UI
- activate/inactivate member actions


No advanced RBAC UI required yet.


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
- empty states
- validation feedback
- onboarding progress feedback if applicable


---


# Database Requirements


Follow:
- uploaded Prisma schema
- uploaded SQL schema


Relevant tables:
- workspaces
- companies
- company_settings
- workspace_members
- invitations
- languages
- currencies
- country_profiles
- country_profile_languages
- files


## Workspace Rules


Every workspace:
- must have owner
- should have company profile
- should have settings record
- should have localization defaults


## Company Rules


Each workspace:
- has one company profile
- has one company settings record


Use:
- workspace_id isolation
- UUID IDs
- Prisma migrations


---


# API Endpoints


## Workspace


### GET
/api/v1/workspaces/current


### PATCH
/api/v1/workspaces/current


---


## Company


### GET
/api/v1/company


### PATCH
/api/v1/company


---


## Workspace Settings


### GET
/api/v1/settings


### PATCH
/api/v1/settings


---


## Localization


### GET
/api/v1/countries


### GET
/api/v1/languages


### GET
/api/v1/currencies


---


## Members


### GET
/api/v1/members


### POST
/api/v1/members/invite


### PATCH
/api/v1/members/:id/status


---


# User Flows


## Workspace Setup Flow


1. Owner signs in
2. System detects incomplete workspace setup
3. User redirected to setup/onboarding
4. User completes:
   - company profile
   - localization
   - workspace settings
5. Setup marked completed
6. User redirected to dashboard


---


## Company Update Flow


1. Owner/admin opens settings
2. Updates company details
3. Backend validates ownership and workspace
4. Data saved successfully


---


## Member Invitation Flow


1. Owner/admin opens members page
2. Enters user email
3. Invitation created
4. Invitation flow stored for future onboarding


Email sending implementation may be deferred if not ready yet.


---


# Business Rules


## Workspace Rules


- Every workspace belongs to one owner.
- Workspace data must remain isolated.
- Only authorized members can access workspace settings.


## Company Rules


- Every workspace should maintain one company profile.
- Company profile acts as operational business identity.


## Localization Rules


Workspace must support:
- country-aware defaults
- language defaults
- currency defaults
- tax configuration defaults


## User Management Rules


Owner/admin can:
- invite users
- activate/inactivate users
- view workspace users


Viewer/user roles:
- cannot manage workspace configuration


---


# Roles & Permissions


## owner


Can:
- manage workspace
- manage company profile
- manage settings
- manage members
- invite users
- activate/inactivate users


---


## user


Operational access only.


Cannot:
- manage workspace settings
- manage members


---


## viewer


Read-only access.


Cannot:
- modify workspace configuration


---


## platform admin


Reserved for future platform/system management.


---


# Validation Rules


Validate:
- workspace ownership
- workspace membership
- role permissions
- company data inputs
- localization selections
- duplicate invitations


Validate:
- all API payloads
- file upload metadata if implemented


---


# Security Rules


## Required


- Enforce workspace isolation
- Validate owner/admin permissions
- Protect all settings APIs
- Validate uploaded files if upload exists
- Sanitize inputs
- Validate request payloads


## Forbidden


- Cross-workspace access
- Hardcoded configuration
- Exposing stack traces
- Public access to workspace settings


---


# Environment Variables


## Backend


Required:
- DATABASE_URL
- FRONTEND_URL
- CLERK_SECRET_KEY
- STORAGE_PROVIDER if applicable
- R2 credentials if applicable


## Frontend


Required:
- VITE_API_BASE_URL
- VITE_CLERK_PUBLISHABLE_KEY


Document all setup steps.


---


# Testing Requirements


Add tests or testing instructions for:


## Workspace


- workspace retrieval
- workspace update
- unauthorized access


## Company


- company profile creation
- company profile update
- validation errors


## Localization


- country retrieval
- currency retrieval
- language retrieval


## Members


- member listing
- invitation creation
- activation/inactivation


## Multi-Tenant Isolation


- workspace filtering validation


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
- API base URL
- Clerk settings
- environment variables


---


# Manual/Help Updates


Update:
- README.md
- workspace setup guide
- company setup guide
- localization setup guide
- workspace member management guide


Document:
- onboarding flow
- workspace setup
- company profile management
- settings management
- invitation flow


---


# Suggested Future Enhancements


Possible future additions:
- avatar/logo cropping
- advanced RBAC
- invitation email templates
- multi-workspace switching
- organization hierarchy
- custom branding per workspace
- audit trail for settings changes


Do not implement unless explicitly approved.


---


# Out of Scope


Do not implement:
- invoices
- expenses
- AI chat
- AI usage tracking
- subscriptions/billing
- Stripe
- compliance reminders
- notifications
- document generation
- advanced permission matrix
- admin control panel


These belong to later slices.


---


# Completion Criteria


This slice is complete only when:


- workspace setup works end-to-end
- company profile management works
- workspace settings work
- localization selection works
- workspace member management foundation works
- protected workspace settings routes work
- workspace isolation works
- onboarding completion flow works
- environment setup is documented
- tests/testing instructions are added
- README/manuals are updated