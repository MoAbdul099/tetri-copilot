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
- branded member management experience
- branded role and invitation management UI
- reusable member-management layout/components


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
- Branded member management dashboard
- Branded invitations and role management UI
- Reuse of shared layout/components
- Creation of reusable components only where clear reuse exists


This slice uses:
- React + Vite
- Tailwind CSS
- shadcn/ui
- Lucide React
- Express.js
- PostgreSQL
- Prisma ORM
- Clerk authentication


This slice depends on:
- Slice 1 Authentication & Workspace Bootstrap
- Slice 2 Workspace & Company Setup
- docs/branding.md
- existing shared layout/components


---


# Branding Requirements


Before implementing frontend UI, read:


- docs/branding.md


All user management and role management UI must follow Tetri Copilot branding.


The UI should feel:
- modern
- intelligent
- trustworthy
- enterprise-ready
- operationally efficient
- AI-native
- clean and minimal


Use:
- Primary Blue: #1447e6
- Secondary Blue: #155dfc
- Primary Text: #0f172b
- Secondary Text: #4a5565
- Soft Background: #f8fafc
- Border Gray: #e2e8f0
- Manrope font
- Tailwind CSS
- shadcn/ui
- Lucide React


Avoid:
- inconsistent spacing
- random hardcoded colors
- cluttered management screens
- excessive shadows
- noisy admin layouts
- decorative UI patterns
- duplicated component styling


Branding assets:
- frontend/public/logo.svg
- frontend/public/logo-light.svg
- frontend/public/logo-dark.svg


---


# Shared Layout & Component Rules


Before creating new frontend components:
1. Check existing shared layout/components.
2. Reuse existing shared components where appropriate.
3. Create new shared components only if there is clear reuse value.
4. Avoid premature overengineering.


Reuse or create where appropriate:


- AppShell
- PageHeader
- SectionHeader
- SettingsCard
- DataTable
- StatusBadge
- EmptyState
- LoadingState
- ConfirmationDialog
- FormCard
- InviteUserDialog
- RoleBadge
- MemberStatusBadge


Use shadcn/ui as the primary UI component foundation.


Avoid:
- duplicated layouts
- duplicated table implementations
- duplicated modal implementations
- duplicated badge styling
- isolated styling systems


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
- owner permission validation


Create reusable middleware:
- requireAuth
- requireWorkspace
- requireRole
- requireOwner where appropriate


## Backend Structure


Use:


src/modules/members/
src/modules/invitations/
src/modules/roles/


Follow:
- service layer architecture
- centralized validation
- centralized error handling
- workspace isolation
- role-based access control


Controllers must remain thin.


Business logic belongs in services.


Repositories/control layers manage Prisma access.


---


# Frontend Requirements


## Workspace Members UI


Implement:
- workspace users list
- member details display
- member status badges
- role badges
- member actions menu
- search/filter foundation if useful
- empty state when no members exist


## Invitation UI


Implement:
- invite user modal/page
- invitation status display
- resend invitation action
- cancel invitation action
- pending invitation list if applicable


## Role Management UI


Implement:
- role selection dropdown
- role update flow
- permission-aware actions
- confirmation where role change is sensitive


## User Status Management UI


Implement:
- activate user action
- inactivate user action
- confirmation dialog for inactivation
- clear status feedback


## Role-Based UI Protection


Implement:
- owner-only actions
- viewer restrictions
- conditional UI rendering
- disabled states where user lacks permission


---


# Branded UI Requirements


## Layout


Workspace user management screens should:
- use the existing app layout/shell
- feel enterprise-grade
- use spacious layouts
- use clean data hierarchy
- use modern SaaS admin patterns
- maintain operational clarity


Use:
- clean table layouts
- modern filters/search areas if applicable
- minimal separators
- clear role/status visibility


## Components


Use shadcn/ui components for:
- tables
- dialogs
- dropdown menus
- badges
- forms
- selects
- alerts
- buttons
- cards
- tabs


## Cards


Cards should use:
- white background
- #e2e8f0 border
- 16px radius
- minimal shadow
- soft spacing


## Buttons


Primary button:
- background: #1447e6
- hover: #155dfc
- text: #ffffff
- radius: 12px


Secondary button:
- transparent or white background
- border: #cbd5e1
- text: #0f172b


Danger actions:
- use destructive variants carefully
- require confirmation dialogs


## Status Badges


Use:
- Success for active users
- Warning for pending invitations
- Neutral for viewers
- Error/destructive for inactive users where appropriate


Badges should:
- remain minimal
- use accessible contrast
- follow branding colors


## Typography


Use:
- Manrope
- concise labels
- readable table content
- consistent hierarchy


## Icons


Use:
- Lucide React
- minimal rounded icon style
- #1447e6 for primary actions
- #64748b for neutral actions


## UX Requirements


Include:
- loading states
- error states
- success states
- confirmation dialogs
- empty states
- validation feedback
- responsive layout
- accessible contrast


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
- belongs to one workspace
- has a role
- has a status
- must be isolated by workspace_id


## Invitation Rules


Invitation:
- must belong to a workspace
- must have a unique token
- must expire
- must track acceptance status
- must prevent duplicate active invitations


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


1. Owner opens members page.
2. Clicks invite user.
3. Enters email and role.
4. Backend validates role and duplicate invitation rules.
5. Invitation is created.
6. Invitation status is shown in UI.
7. Invitation is available for acceptance flow.


---


## Accept Invitation Flow


1. User receives invitation.
2. User authenticates/signs up through Clerk.
3. Invitation token is validated.
4. Workspace membership is created.
5. User is redirected to workspace dashboard.


---


## Update Role Flow


1. Owner opens member actions.
2. Changes member role.
3. Backend validates permissions and role transition.
4. Role is updated successfully.
5. UI refreshes member state.


---


## Activate/Inactivate User Flow


1. Owner changes user status.
2. Backend validates permissions.
3. Backend validates last-owner protection.
4. Workspace membership is updated.
5. User access updates accordingly.
6. UI shows success feedback.


---


# Business Rules


## Workspace Ownership Rules


- Workspace must always have at least one owner.
- Owner cannot remove themselves if they are the only owner.
- Owner cannot inactivate themselves if they are the only owner.
- Owner role has highest workspace-level authority.


## Invitation Rules


- Invitations must expire.
- Duplicate active invitations should be prevented.
- Invitations are workspace-specific.
- Invitation token must be validated before accepting.


## User Status Rules


Inactive users:
- cannot access workspace
- should retain historical references
- should not be deleted from historical activity logs


## Role Rules


Only owner can:
- invite users
- change roles
- activate/inactivate users
- remove users where allowed


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
- inactivate last owner


---


## user


Can:
- access operational features
- access permitted data


Cannot:
- manage users
- manage workspace settings
- assign roles


---


## viewer


Can:
- view permitted data


Cannot:
- modify operational data
- manage users
- manage workspace settings


---


## platform admin


Reserved for future platform-level administration.


Separate from workspace ownership.


---


# Validation Rules


Validate:
- authenticated session
- workspace membership
- owner permissions
- duplicate invitations
- invitation expiry
- role transitions
- invalid role assignments
- self-removal restrictions
- last-owner restrictions


Validate:
- all API payloads
- route access
- member actions


Required validations:
- invited email format must be valid
- invited role must exist and be allowed
- last owner cannot be removed/inactivated
- role downgrade rules must be enforced
- duplicate active invitation should be blocked
- invitation token must be valid and not expired


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
- Require confirmation for destructive actions
- Never trust frontend-only permissions


## Forbidden


- Cross-workspace member access
- Unauthorized role escalation
- Removing last owner
- Inactivating last owner
- Exposing stack traces
- Hardcoded permissions
- Trusting frontend-only permissions


---


# Activity & Audit Logging


Create activity logs for:
- invitation created
- invitation cancelled
- invitation resent
- invitation accepted
- member role updated
- member activated
- member inactivated
- member removed


Create audit logs where applicable for:
- role changes
- owner-level actions
- sensitive permission changes


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
- retrieve member details
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
- duplicate active invitation prevention


## Authorization


- owner-only actions
- unauthorized access
- invalid role actions
- viewer cannot manage users
- user cannot manage users


## Branding/UI


- member management screens follow branding
- tables/cards follow branding
- role/status badges follow branding
- dialogs follow branding
- responsive layout works
- confirmation dialogs work properly


## Shared Components


- existing shared layout is reused
- no duplicated table/dialog/badge styling
- new shared components are justified and documented


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
- Prisma migrations if required
- environment validation


## Frontend


Deploy to:
- Cloudflare Pages


Configure:
- API base URL
- Clerk settings
- environment variables
- branding assets
- font loading


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
- member removal restrictions
- last-owner protection


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
- advanced role analytics
- branded invitation emails


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
- last-owner protection works
- workspace isolation works
- activity/audit logging is considered or implemented where applicable
- Tetri branding is applied consistently across Slice 3 frontend screens
- UI follows docs/branding.md, Tailwind, and shadcn/ui conventions
- shared layouts/components are reused where appropriate
- no duplicated table/dialog/badge styling is introduced unnecessarily
- environment setup is documented
- tests/testing instructions are added
- README/manuals are updated