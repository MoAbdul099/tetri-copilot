# Slice 4.2 — Workspace Current Plan & Usage Summary


## Objective


Implement the workspace subscription visibility and usage summary foundation for Tetri Copilot.


This slice establishes:
- current workspace subscription visibility
- current plan summary
- usage summary dashboard
- workspace limits visibility
- feature availability visibility
- reusable usage/limits UI components
- branded billing/usage experience
- future AI/billing readiness foundation


This slice provides visibility into:
- what plan the workspace is using
- what features are available
- what limits exist
- how much of those limits are consumed


This slice does NOT implement:
- Stripe payments
- real billing workflows
- upgrade/downgrade flows
- cancel subscription flows
- AI usage logic
- invoice billing
- payment collection


Those belong to later slices.


---


# Scope


This slice includes:


- Current workspace plan retrieval
- Current subscription status visibility
- Workspace usage summary
- Plan limits visibility
- Usage progress indicators
- Feature availability summary
- Billing/usage dashboard cards
- Usage warning foundation
- Reusable usage/limits shared components
- Branded subscription/usage UI
- Shared layout/component reuse
- Usage-ready architecture foundation


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
- docs/branding.md
- shared layout/components


---


# Branding Requirements


Before implementing frontend UI, read:


- docs/branding.md


All subscription and usage UI must follow Tetri Copilot branding.


The UI should feel:
- modern
- enterprise-ready
- fintech SaaS
- AI-native
- operationally efficient
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
- random hardcoded colors
- inconsistent spacing
- cluttered usage dashboards
- duplicated component styling
- overly complex charts


---


# Shared Layout & Component Rules


Before creating new components:
1. Reuse existing shared layout/components whenever possible.
2. Create new shared components only if there is clear reuse value.
3. Avoid premature abstraction.


Reuse or create where appropriate:


- AppShell
- PageHeader
- SectionHeader
- BillingLayout
- UsageCard
- UsageProgressCard
- PlanCard
- StatusBadge
- EmptyState
- LoadingState
- FeatureList
- LimitProgressBar
- InfoCard


Use shadcn/ui as the primary UI foundation.


Avoid:
- duplicated usage card designs
- duplicated progress bar implementations
- duplicated subscription badge styling
- isolated styling systems


---


# Backend Requirements


## Workspace Subscription Retrieval


Implement:
- retrieve current workspace subscription
- retrieve current plan
- retrieve current subscription status
- retrieve plan features metadata
- retrieve plan limits metadata


Use:
- workspace_subscriptions
- subscriptions
- plans
- plan_features
- usage_limits


---


## Usage Summary Foundation


Implement usage summary retrieval for:


- users count
- storage usage placeholder
- invoices usage placeholder
- expenses usage placeholder
- AI usage placeholder
- feature availability summary


Important:
This slice only provides visibility foundation.


Do NOT implement actual AI logic or real billing enforcement yet.


---


## Feature Availability Summary


Implement:
- available features retrieval
- enabled/disabled feature visibility
- reusable feature access helper foundation


Examples:
- hasFeature()
- getUsageSummary()
- getWorkspaceLimits()


---


## Usage Warning Foundation


Implement:
- nearing-limit warnings foundation
- limit threshold calculations foundation
- warning status preparation


Do NOT implement actual blocking logic yet.


---


# Backend Structure


Use:


src/modules/subscriptions/
src/modules/usage/
src/modules/feature-access/


Follow:
- service layer architecture
- centralized validation
- centralized error handling
- workspace isolation
- reusable feature access utilities


Controllers must remain thin.


Business logic belongs in services.


Repositories/control layers manage Prisma access.


---


# Frontend Requirements


## Current Plan UI


Implement:
- current plan card
- current subscription status badge
- plan description
- current limits summary
- plan features summary


---


## Usage Summary UI


Implement:
- users usage
- storage usage placeholder
- invoices usage placeholder
- expenses usage placeholder
- AI usage placeholder


Include:
- usage counts
- usage progress bars
- limit indicators
- nearing-limit warnings foundation


---


## Feature Visibility UI


Implement:
- enabled features list
- unavailable features display foundation
- future upgrade prompts foundation


Do NOT implement real upgrade flow yet.


---


## Billing/Usage Dashboard


Implement:
- branded usage overview cards
- limits overview cards
- usage status badges
- subscription summary area
- clean responsive layout


---


# Branded UI Requirements


## Layout


Subscription/usage screens should:
- use existing AppShell/shared layouts
- feel enterprise-grade
- feel operationally clear
- use spacious layouts
- use clean data hierarchy


Use:
- clean cards
- lightweight progress indicators
- clear typography
- readable spacing


---


## Components


Use shadcn/ui components for:
- cards
- progress bars
- alerts
- badges
- tabs
- buttons
- dialogs
- tooltips


---


## Usage Cards


Usage cards should include:
- current usage
- usage limit
- usage percentage
- clear labels
- clean visual hierarchy


Cards should use:
- white background
- #e2e8f0 border
- 16px radius
- minimal shadow
- soft spacing


---


## Progress Indicators


Progress indicators should:
- use Tetri branding colors
- clearly show usage percentage
- support warning/destructive states later


Suggested states:
- normal
- warning
- critical


---


## Buttons


Primary button:
- background: #1447e6
- hover: #155dfc
- text: #ffffff


Secondary button:
- white/transparent background
- border: #cbd5e1
- text: #0f172b


---


## Typography


Use:
- Manrope
- concise labels
- readable summaries
- clean hierarchy


---


## Icons


Use:
- Lucide React
- #1447e6 for primary usage visuals
- #64748b for neutral informational visuals


---


## UX Requirements


Include:
- loading states
- error states
- empty states
- responsive layout
- accessible contrast
- clean progress feedback
- warning states foundation


---


# Database Requirements


Follow:
- Prisma schema
- SQL schema


Relevant tables may include:
- plans
- subscriptions
- workspace_subscriptions
- plan_features
- usage_limits
- usage_logs
- ai_usage_logs
- activity_logs


Use:
- workspace_id isolation
- UUID IDs
- Prisma migrations


---


# Usage Rules


Usage summaries should:
- be workspace-specific
- respect subscription plan
- prepare future feature enforcement
- support future AI usage logic
- support future invoice/expense/storage limits


---


# API Endpoints


## Current Subscription


### GET
/api/v1/subscription/current


---


## Usage Summary


### GET
/api/v1/usage/summary


---


## Features Summary


### GET
/api/v1/subscription/features


---


# User Flows


## Current Plan View Flow


1. User opens subscription/usage page.
2. System retrieves current workspace subscription.
3. Current plan details are displayed.
4. Current subscription status is displayed.
5. Usage summaries are displayed.


---


## Usage Summary Flow


1. User opens usage overview.
2. Usage counts are retrieved.
3. Usage percentages are calculated.
4. Progress indicators are shown.
5. Near-limit warning foundation is prepared.


---


# Business Rules


## Workspace Rules


- Every workspace should have one active/current subscription.
- Usage summaries must remain workspace-isolated.
- Feature visibility must depend on plan metadata.


---


## Usage Rules


Usage should prepare future support for:
- AI limits
- storage limits
- invoices limits
- expenses limits
- users limits


This slice only establishes visibility foundation.


---


## Feature Rules


Features should:
- come dynamically from backend
- not be hardcoded in frontend
- support future feature gating


---


# Validation Rules


Validate:
- workspace membership
- active subscription existence
- plan existence
- feature metadata structure
- usage limits structure


Validate:
- all API payloads
- workspace isolation


---


# Security Rules


## Required


- Enforce workspace isolation
- Protect usage/subscription APIs
- Validate authenticated user
- Validate workspace membership
- Validate plan visibility


## Forbidden


- Cross-workspace usage visibility
- Hardcoded feature assumptions
- Exposing internal billing logic
- Trusting frontend-only validation


---


# Activity Logging


Create activity logs where appropriate for:
- subscription retrieval events if needed
- usage warning events foundation
- subscription visibility actions if useful


Avoid excessive logging.


---


# Environment Variables


## Backend


Required:
- DATABASE_URL
- CLERK_SECRET_KEY
- FRONTEND_URL


Optional future variables:
- AI provider keys
- Stripe keys
- storage provider variables


Do not require unused secrets yet.


---


## Frontend


Required:
- VITE_API_BASE_URL
- VITE_CLERK_PUBLISHABLE_KEY


Document all setup steps.


---


# Testing Requirements


Add tests or testing instructions for:


## Subscription


- current subscription retrieval
- current plan rendering
- subscription status rendering


---


## Usage Summary


- usage summary retrieval
- usage percentage calculations
- usage progress rendering
- warning threshold preparation


---


## Feature Summary


- feature visibility rendering
- plan-based feature retrieval


---


## Branding/UI


- usage cards follow branding
- progress bars follow branding
- responsive layout works
- loading/error/empty states work
- Tetri colors render correctly


---


## Shared Components


- shared layouts/components are reused
- duplicated usage/progress styling is avoided


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
- current subscription guide
- usage summary guide
- feature visibility guide


Document:
- current plan visibility
- usage dashboard
- limits overview
- future billing readiness


---


# Suggested Future Enhancements


Possible future additions:
- real AI usage tracking
- storage analytics
- invoice/expense analytics
- billing history
- advanced usage charts
- upgrade prompts
- usage notifications
- plan recommendation engine


Do not implement unless explicitly approved.


---


# Out of Scope


Do not implement:
- Stripe checkout
- payment processing
- billing portal
- upgrade/downgrade flows
- cancel subscription flow
- invoices module
- expenses module
- AI chat
- AI processing
- AI categorization
- advanced analytics
- admin panel


These belong to later slices.


---


# Completion Criteria


This slice is complete only when:


- current workspace subscription retrieval works
- current plan visibility works
- usage summary works
- feature visibility works
- usage progress indicators work
- shared layouts/components are reused appropriately
- Tetri branding is applied consistently
- UI follows docs/branding.md, Tailwind, and shadcn/ui conventions
- workspace isolation works
- usage foundation is ready for future billing/AI features
- tests/testing instructions are added
- README/manuals are updated