# Slice 4.3 — Upgrade / Downgrade / Cancel Plan


## Objective


Implement the workspace subscription change management flows for Tetri Copilot.


This slice establishes:
- upgrade plan flow
- downgrade plan flow
- cancel subscription flow
- plan switching UX
- subscription state transition handling
- confirmation and warning flows
- billing-ready subscription lifecycle foundation
- branded subscription management experience


This slice provides the operational subscription management foundation required before full payment automation and advanced billing workflows.


---


# Scope


This slice includes:


- Upgrade plan flow
- Downgrade plan flow
- Cancel subscription flow
- Plan switching confirmation dialogs
- Subscription state transition handling
- Current plan replacement flow
- Plan eligibility validation
- Subscription lifecycle activity logging
- Branded subscription management UI
- Reusable billing/subscription shared components
- Shared layout/component reuse


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
- Slice 3 Workspace User Management & Roles
- Slice 4.1 Plans Catalog & Subscription Foundation
- Slice 4.2 Workspace Current Plan & Usage Summary
- docs/branding.md
- shared layout/components


---


# Important Scope Notes


This slice manages subscription transitions and UX foundation.


This slice does NOT implement:
- real Stripe checkout
- real recurring payment automation
- webhook billing automation
- invoice payment collection
- tax calculations
- advanced billing portal
- refunds
- prorated billing calculations
- advanced subscription scheduling
- AI billing


Those belong to future billing slices.


This slice should remain:
- billing-ready
- provider-agnostic where possible
- safe for future Stripe integration


---


# Branding Requirements


Before implementing frontend UI, read:


- docs/branding.md


All billing and subscription management UI must follow Tetri Copilot branding.


The UI should feel:
- modern
- enterprise-ready
- trustworthy
- fintech SaaS
- operationally clear
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
- confusing pricing layouts
- cluttered billing flows
- inconsistent confirmation dialogs
- duplicated component styling
- random hardcoded colors


---


# Shared Layout & Component Rules


Before creating new components:
1. Reuse existing shared layout/components whenever possible.
2. Create new shared components only if there is clear reuse value.
3. Avoid overengineering.


Reuse or create where appropriate:


- BillingLayout
- PricingCard
- PlanComparisonTable
- SubscriptionCard
- StatusBadge
- ConfirmationDialog
- UpgradePlanDialog
- CancelPlanDialog
- WarningCard
- InfoCard
- LoadingState
- EmptyState


Use shadcn/ui as the primary UI foundation.


Avoid:
- duplicated pricing cards
- duplicated modal flows
- duplicated subscription badge styling
- isolated styling systems


---


# Backend Requirements


## Plan Change Management


Implement:
- upgrade plan logic foundation
- downgrade plan logic foundation
- cancel subscription logic foundation
- current subscription replacement
- subscription status updates


Use:
- workspace_subscriptions
- subscriptions
- plans
- subscription_items


---


## Subscription Transition Rules


Implement:
- valid plan transition validation
- active subscription validation
- workspace ownership validation
- transition logging


Supported transitions:
- Free → Starter
- Starter → Professional
- Professional → Business
- Business → Professional
- Professional → Starter
- Starter → Free if allowed


Implement:
- downgrade validation foundation
- future usage-limit enforcement preparation


---


## Cancel Subscription Flow


Implement:
- cancel request
- subscription cancellation state
- cancelled subscription visibility
- future reactivation foundation


Do NOT implement:
- refunds
- real billing provider cancellation
- webhook automation


---


## Usage Compatibility Validation


Implement foundation for:
- downgrade eligibility checks
- limit conflict warnings
- future over-limit validation


Examples:
- too many users for lower plan
- too much storage for lower plan
- future invoice count conflicts


This slice only prepares the architecture foundation.


---


## Activity Logging


Log:
- plan upgrades
- plan downgrades
- cancellation requests
- subscription status changes
- subscription reactivation foundation if applicable


---


# Backend Structure


Use:


src/modules/subscriptions/
src/modules/plans/
src/modules/billing/
src/modules/feature-access/


Follow:
- service layer architecture
- centralized validation
- centralized error handling
- reusable transition validation
- workspace isolation


Controllers must remain thin.


Business logic belongs in services.


Repositories/control layers manage Prisma access.


---


# Frontend Requirements


## Plan Upgrade UI


Implement:
- upgrade action
- upgrade confirmation dialog
- selected plan summary
- feature comparison summary
- plan transition visibility


---


## Plan Downgrade UI


Implement:
- downgrade action
- downgrade warnings
- usage compatibility warnings foundation
- downgrade confirmation dialog


Include:
- feature loss visibility
- future over-limit warning foundation


---


## Cancel Subscription UI


Implement:
- cancel subscription action
- cancellation warning dialog
- cancellation confirmation
- cancellation status visibility


Include:
- warning messaging
- reactivation placeholder foundation


---


## Current Plan Management UI


Implement:
- current plan card
- change plan actions
- subscription status badges
- future billing summary placeholders


---


## Plan Comparison UI


Implement:
- side-by-side plan comparison
- feature comparison
- limits comparison
- current plan indicator
- recommended plan styling if applicable


---


# Branded UI Requirements


## Layout


Subscription management screens should:
- use existing shared layouts/AppShell
- feel enterprise-grade
- use clean pricing layouts
- use spacious card-based UI
- maintain operational clarity


Use:
- branded pricing cards
- lightweight comparison tables
- clean dialog flows
- readable confirmation flows


---


## Components


Use shadcn/ui components for:
- dialogs
- cards
- alerts
- badges
- tabs
- buttons
- tables
- tooltips


---


## Confirmation Dialogs


Dialogs should:
- clearly explain action impact
- clearly explain downgrade/cancel implications
- support warning states
- support destructive states carefully


---


## Pricing Cards


Pricing cards should:
- use Tetri branding
- clearly show current plan
- clearly show recommended plans
- maintain consistent spacing


Cards should use:
- white background
- #e2e8f0 border
- 16px radius
- minimal shadow


---


## Buttons


Primary button:
- background: #1447e6
- hover: #155dfc
- text: #ffffff


Danger/destructive actions:
- use destructive variants carefully
- require confirmation dialogs


---


## Typography


Use:
- Manrope
- concise upgrade/downgrade messaging
- readable comparison layouts
- clean hierarchy


---


## Icons


Use:
- Lucide React
- #1447e6 for positive actions
- warning/destructive colors carefully
- #64748b for neutral informational actions


---


## UX Requirements


Include:
- loading states
- error states
- success states
- confirmation dialogs
- responsive layout
- accessible contrast
- safe destructive action handling


---


# Database Requirements


Follow:
- Prisma schema
- SQL schema


Relevant tables may include:
- plans
- subscriptions
- workspace_subscriptions
- subscription_items
- activity_logs
- billing_events


Use:
- workspace_id isolation
- UUID IDs
- Prisma migrations


---


# Subscription Rules


## Upgrade Rules


- Workspace must have valid active subscription.
- Workspace owner must initiate upgrade.
- Upgrade transitions must be valid.
- Future billing integration should remain possible.


---


## Downgrade Rules


- Downgrade compatibility validation must exist.
- Future usage-limit enforcement foundation must exist.
- Downgrade warnings should be shown clearly.


---


## Cancellation Rules


- Workspace owner must confirm cancellation.
- Cancelled status must be visible.
- Future reactivation should remain possible.


---


# API Endpoints


## Upgrade Plan


### PATCH
/api/v1/subscription/upgrade


---


## Downgrade Plan


### PATCH
/api/v1/subscription/downgrade


---


## Cancel Subscription


### PATCH
/api/v1/subscription/cancel


---


## Subscription Status


### GET
/api/v1/subscription/current


---


# User Flows


## Upgrade Flow


1. User opens plans page.
2. User selects higher plan.
3. Plan comparison is shown.
4. Confirmation dialog appears.
5. Backend validates transition.
6. Subscription is updated.
7. UI refreshes current plan state.


---


## Downgrade Flow


1. User selects lower plan.
2. System validates downgrade eligibility foundation.
3. Warnings are displayed.
4. Confirmation dialog appears.
5. Subscription is updated.
6. UI refreshes current plan state.


---


## Cancel Flow


1. User clicks cancel subscription.
2. Warning dialog appears.
3. User confirms cancellation.
4. Subscription status updates.
5. UI shows cancellation state.


---


# Validation Rules


Validate:
- authenticated session
- workspace ownership
- active subscription existence
- valid plan transition
- downgrade eligibility foundation
- plan existence
- subscription state validity


Validate:
- all API payloads
- workspace isolation


---


# Security Rules


## Required


- Enforce workspace isolation
- Protect billing/subscription APIs
- Validate workspace ownership
- Validate subscription transitions
- Validate authenticated user


## Forbidden


- Cross-workspace subscription changes
- Invalid transition states
- Unauthorized cancellations
- Hardcoded billing assumptions
- Trusting frontend-only validation


---


# Activity & Audit Logging


Create activity logs for:
- plan upgrade
- plan downgrade
- cancellation request
- subscription status change


Create audit logs where appropriate for:
- sensitive billing/subscription actions
- destructive subscription actions


---


# Environment Variables


## Backend


Required:
- DATABASE_URL
- CLERK_SECRET_KEY
- FRONTEND_URL


Optional future billing variables:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET


Do not require real Stripe implementation yet unless necessary.


---


## Frontend


Required:
- VITE_API_BASE_URL
- VITE_CLERK_PUBLISHABLE_KEY


Document all setup steps.


---


# Testing Requirements


Add tests or testing instructions for:


## Upgrade Flow


- valid upgrade transition
- invalid upgrade transition
- subscription status update


---


## Downgrade Flow


- valid downgrade transition
- downgrade warning foundation
- downgrade eligibility foundation


---


## Cancel Flow


- cancellation confirmation
- cancellation state rendering
- cancellation activity logging


---


## Branding/UI


- pricing cards follow branding
- dialogs follow branding
- warning states render correctly
- responsive layout works
- Tetri colors render correctly


---


## Shared Components


- existing shared layouts/components are reused
- duplicated pricing/dialog styling is avoided


---


## Multi-Tenant Isolation


- workspace filtering validation
- cross-workspace prevention


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


---


## Frontend


Deploy to:
- Cloudflare Pages


Configure:
- API base URL
- branding assets
- font loading
- environment variables


---


# Manual/Help Updates


Update:
- README.md
- subscription management guide
- upgrade/downgrade guide
- cancellation flow guide


Document:
- upgrade flow
- downgrade flow
- cancellation flow
- future billing readiness


---


# Suggested Future Enhancements


Possible future additions:
- Stripe checkout
- billing portal
- prorated billing
- billing history
- invoice payments
- payment retries
- refunds
- subscription scheduling
- AI billing
- automatic renewal handling


Do not implement unless explicitly approved.


---


# Out of Scope


Do not implement:
- Stripe checkout
- payment collection
- webhook automation
- invoice billing
- tax calculations
- refunds
- AI billing
- AI functionality
- advanced billing analytics
- admin panel billing management


These belong to future slices.


---


# Completion Criteria


This slice is complete only when:


- upgrade flow works
- downgrade flow works
- cancellation flow works
- subscription state transitions work
- downgrade warning foundation exists
- shared layouts/components are reused appropriately
- Tetri branding is applied consistently
- UI follows docs/branding.md, Tailwind, and shadcn/ui conventions
- workspace isolation works
- future billing integration readiness is preserved
- tests/testing instructions are added
- README/manuals are updated