# Slice 3 — Workspace User Management & Roles


## Objective


Implement the complete workspace-level user management and role management foundation for Tetri Copilot.


This slice establishes:
- workspace member management
- invitation flow
- role assignment
- role-based access control foundation
- workspace user activation/inactivation
- workspace permission enforcement
- workspace-level operational administration


This slice must provide the multi-user operational foundation required for all future business modules.


---


# Scope


This slice includes:


- Workspace members list
- Invite workspace users
- Invitation acceptance flow foundation
- User activation/inactivation
- Role assignment and updates
- Workspace member removal rules
- Role-based backend authorization middleware
- Role-based frontend route protection
- Role-based UI visibility foundation
- Workspace member status management
- Invitation lifecycle handling
- Workspace member activity logging


This slice uses:
- React + Vite
- Tailwind CSS
- shadcn/ui
- Express.js
- PostgreSQL
- Prisma ORM
- Clerk authentication


This slice depends on:
- Slice 1 Authentication & Workspace Bootstrap
- Slice 2 Workspace & Company Setup


---


# Backend Requirements


## Workspace Member Management


Implement:
- list workspace members
- retrieve member details
- update member role
- activate member
- inactivate member
- remove member if allowed


Use:
- workspace_members
- users


## Invitation Management


Implement:
- create invitation
- list invitations
- cancel invitation
- resend invitation foundation
- invitation validation logic


Use:
- invitations


Email sending implementation may be mocked or simplified if email provider is not ready.


## Authorization Middleware


Implement:
- role-based backend middleware
- workspace membership validation
- owner/admin permission validation


Create reusable middleware:
- requireAuth
- requireWorkspace
- requireRole


## Backend Structure


Use:


src/modules/members/
src/modules/invitations/
src/modules/roles/


Follow:
- service layer architecture
- centralized validation
- centralized error handling


Controllers must remain thin.


Business logic belongs in services.


---


# Frontend Requirements


## Workspace Members UI


Implement:
- workspace users list
- member details display
- member status badges
- role badges
- member actions menu


## Invitation UI


Implement:
- invite user modal/page
- invitation status display
- resend invitation action
- cancel invitation action


## Role Management UI


Implement:
- role selection dropdown
- role update flow
- permission-aware actions


## User Status Management UI


Implement:
- activate user action
- inactivate user action


## Role-Based UI Protection


Implement:
- owner-only actions
- admin-only actions if applicable
- viewer restrictions
- conditional UI rendering


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
- confirmation dialogs
- empty states
- validation feedback


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
- audit_logs


## Workspace Member Rules


Every member:
- belongs to workspace
- has role
- has status


## Invitation Rules


Invitation:
- must belong to workspace
- must have unique token
- must expire
- must track acceptance status


Use:
- workspace_id isolation
- UUID IDs
- Prisma migrations


---


# API Endpoints


## Workspace Members


### GET
/api/v1/members


### GET
/api/v1/members/:id


### PATCH
/api/v1/members/:id/role


### PATCH
/api/v1/members/:id/status


### DELETE
/api/v1/members/:id


---


## Invitations


### GET
/api/v1/invitations


### POST
/api/v1/invitations


### PATCH
/api/v1/invitations/:id/resend


### PATCH
/api/v1/invitations/:id/cancel


---


## Invitation Acceptance


### POST
/api/v1/invitations/accept


---


# User Flows


## Invite User Flow


1. Owner/admin opens members page
2. Clicks invite user
3. Enters email and role
4. Invitation created
5. Invitation status shown
6. Invitation available for acceptance flow


---


## Accept Invitation Flow


1. User receives invitation
2. User authenticates/signs up
3. Invitation token validated
4. Workspace membership created
5. User redirected to workspace dashboard


---


## Update Role Flow


1. Owner/admin opens member actions
2. Changes member role
3. Backend validates permissions
4. Role updated successfully


---


## Activate/Inactivate User Flow


1. Owner/admin changes user status
2. Backend validates permissions
3. Workspace membership updated
4. User access updated accordingly


---


# Business Rules


## Workspace Ownership Rules


- Workspace must always have at least one owner.
- Owner cannot remove themselves if they are the only owner.
- Owner role has highest workspace-level authority.


## Invitation Rules


- Invitations must expire.
- Duplicate active invitations should be prevented.
- Invitations are workspace-specific.


## User Status Rules


Inactive users:
- cannot access workspace
- should retain historical references


## Role Rules


Only owner/admin can:
- invite users
- change roles
- activate/inactivate users


Viewer:
- read-only access


User:
- operational access


Owner:
- full workspace access


---


# Roles & Permissions


## owner


Can:
- manage workspace
- manage users
- assign roles
- activate/inactivate users
- invite users
- remove users
- manage workspace settings


Cannot:
- remove last owner


---


## user


Can:
- access operational features
- access permitted data


Cannot:
- manage users
- manage workspace settings


---


## viewer


Can:
- view permitted data


Cannot:
- modify operational data
- manage users


---


## platform admin


Reserved for future platform-level administration.


Separate from workspace ownership.


---


# Validation Rules


Validate:
- authenticated session
- workspace membership
- owner/admin permissions
- duplicate invitations
- invitation expiry
- role transitions
- invalid role assignments
- self-removal restrictions


Validate:
- all API payloads
- route access
- member actions


---


# Security Rules


## Required


- Enforce workspace isolation
- Enforce role validation
- Protect member management APIs
- Validate invitation ownership
- Validate invitation tokens
- Sanitize inputs
- Validate payloads


## Forbidden


- Cross-workspace member access
- Unauthorized role escalation
- Removing last owner
- Exposing stack traces
- Hardcoded permissions


---


# Environment Variables


## Backend


Required:
- DATABASE_URL
- CLERK_SECRET_KEY
- FRONTEND_URL


Optional if email implemented:
- SMTP credentials
- email provider keys


## Frontend


Required:
- VITE_API_BASE_URL
- VITE_CLERK_PUBLISHABLE_KEY


Document all setup steps.


---


# Testing Requirements


Add tests or testing instructions for:


## Members


- list members
- update role
- activate member
- inactivate member
- remove member


## Invitations


- create invitation
- cancel invitation
- resend invitation
- accept invitation
- expired invitation validation


## Authorization


- owner-only actions
- unauthorized access
- invalid role actions


## Multi-Tenant Isolation


- workspace filtering validation
- cross-workspace access prevention


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
- workspace member management guide
- invitation guide
- role management guide


Document:
- invite user flow
- accept invitation flow
- role assignment flow
- activate/inactivate user flow


---


# Suggested Future Enhancements


Possible future additions:
- granular RBAC permissions
- department/team permissions
- audit trail viewer
- invitation email templates
- MFA enforcement
- session/device management
- workspace switching


Do not implement unless explicitly approved.


---


# Out of Scope


Do not implement:
- subscriptions/billing
- Stripe
- invoices
- expenses
- AI chat
- AI usage tracking
- compliance reminders
- notifications
- document generation
- advanced platform admin panel
- granular permission matrix


These belong to later slices.


---


# Completion Criteria


This slice is complete only when:


- workspace member management works end-to-end
- invitations work
- invitation acceptance works
- role assignment works
- role-based backend authorization works
- role-based frontend protection works
- activation/inactivation works
- workspace isolation works
- environment setup is documented
- tests/testing instructions are added
- README/manuals are updated