Read:
- CLAUDE.md
- docs/branding.md
- BRD
- SRS
- SAL
- Prisma schema
- SQL schema


Implement Slice 4.1 — Plans Catalog & Subscription Foundation.


Objective:
Implement the foundational subscription and plans architecture for Tetri Copilot.


This slice should establish:
- plans catalog
- workspace subscription foundation
- current subscription retrieval
- plan comparison UI
- subscription status foundation
- feature/limits metadata foundation
- reusable billing/subscription shared UI components
- subscription activity logging
- billing-ready architecture foundation


Important:
This slice is ONLY the foundation.


Do NOT implement:
- Stripe checkout
- payment processing
- real billing workflows
- invoices module
- AI functionality
- upgrade/downgrade flows
- cancel subscription flow
- advanced billing events
- admin panel
- usage tracking logic
- notifications related to billing


Those belong to later slices.


Dependencies:
- Slice 1 Authentication & Workspace Bootstrap
- Slice 2 Workspace & Company Setup
- Slice 3 Workspace User Management & Roles


Primary Goal:
Prepare the platform for future:
- billing
- AI usage limits
- feature gating
- subscription lifecycle management


while providing a fully branded and reusable subscription UI foundation.


--------------------------------------------------
BACKEND REQUIREMENTS
--------------------------------------------------


Implement backend foundation for:


1. Plans Catalog
2. Workspace Current Subscription
3. Plan Features Metadata
4. Plan Limits Metadata
5. Subscription Status Foundation
6. Subscription Activity Logging
7. Feature Access Foundation


--------------------------------------------------
PLANS REQUIREMENTS
--------------------------------------------------


Implement plans retrieval system.


Suggested plans:
- Free
- Starter
- Professional
- Business


Each plan should support:
- name
- slug
- description
- active/inactive status
- display order
- monthly price placeholder
- yearly price placeholder
- recommended/highlighted flag
- public visibility
- features metadata
- limits metadata


Plan features should support examples like:
- AI Assistant
- OCR
- Expense Tracking
- Compliance Reminders
- Dashboard Reporting


Limits examples:
- max users
- max storage
- max invoices
- max expenses
- future AI limits


Do not hardcode plan features in frontend.


Plans and feature metadata must come dynamically from backend/database.


--------------------------------------------------
WORKSPACE SUBSCRIPTION REQUIREMENTS
--------------------------------------------------


Implement:
- retrieve current workspace subscription
- retrieve current plan
- retrieve subscription status


Subscription statuses may include:
- active
- trialing
- suspended
- cancelled
- expired


Do not implement real billing logic yet.


Only implement the architecture foundation.


--------------------------------------------------
FEATURE ACCESS FOUNDATION
--------------------------------------------------


Implement reusable feature-access utilities/foundation.


Examples:
- hasFeature()
- hasLimit()
- canAccessFeature()


This should prepare future slices for:
- AI limits
- invoice limits
- storage limits
- user limits


Do not implement actual blocking logic everywhere yet.
Only establish the reusable architecture foundation.


--------------------------------------------------
ACTIVITY LOGGING
--------------------------------------------------


Log:
- subscription assignment
- plan changes if applicable
- subscription status changes


Use existing activity log patterns.


--------------------------------------------------
BACKEND ARCHITECTURE RULES
--------------------------------------------------


Use:
- service layer architecture
- centralized validation
- centralized error handling
- reusable repositories/access layers
- thin controllers


Suggested modules:
- src/modules/plans/
- src/modules/subscriptions/
- src/modules/feature-access/


Preserve:
- workspace isolation
- multi-tenant architecture
- role validation


--------------------------------------------------
DATABASE REQUIREMENTS
--------------------------------------------------


Follow:
- Prisma schema
- SQL schema


Relevant tables may include:
- plans
- subscriptions
- workspace_subscriptions
- subscription_items
- plan_features
- usage_limits
- activity_logs


Use:
- UUID IDs
- Prisma migrations
- workspace isolation


Before creating new tables:
- inspect existing schema carefully
- reuse existing structures where appropriate


--------------------------------------------------
API REQUIREMENTS
--------------------------------------------------


Use:
- REST API
- /api/v1


Suggested endpoints:


Plans:
- GET /api/v1/plans
- GET /api/v1/plans/:slug


Subscription:
- GET /api/v1/subscription/current


Feature Access:
- GET /api/v1/subscription/features


Use standardized API responses.


--------------------------------------------------
FRONTEND REQUIREMENTS
--------------------------------------------------


Implement:
1. Plans Catalog Page
2. Current Subscription Card
3. Plan Comparison UI
4. Plan Features Display
5. Subscription Status Display
6. Usage Limits Placeholder UI
7. Shared Billing/Subscription Components


--------------------------------------------------
PLANS UI REQUIREMENTS
--------------------------------------------------


Create fully branded pricing cards using:
- shadcn/ui
- Tailwind CSS
- Tetri branding


Include:
- plan name
- pricing placeholders
- features list
- limits list
- highlighted/recommended plan styling
- current plan indicator


Use reusable shared components.


--------------------------------------------------
CURRENT SUBSCRIPTION UI
--------------------------------------------------


Implement:
- current plan card
- subscription status badge
- plan details
- usage placeholder summary


Do NOT implement:
- real billing portal
- real cancellation flow
- real upgrade flow


Only foundation placeholders.


--------------------------------------------------
SHARED COMPONENT REQUIREMENTS
--------------------------------------------------


If reusable patterns are discovered, create shared components such as:
- PricingCard
- PlanComparisonTable
- SubscriptionCard
- UsageCard
- BillingLayout
- StatusBadge
- SectionHeader


Important:
Only create reusable components where there is clear reuse value.
Avoid overengineering.


--------------------------------------------------
BRANDING REQUIREMENTS
--------------------------------------------------


Follow docs/branding.md strictly.


Use:
- Tailwind CSS
- shadcn/ui
- Lucide React
- Manrope font
- centralized theme tokens


Use Tetri colors:
- Primary Blue: #1447e6
- Secondary Blue: #155dfc
- Primary Text: #0f172b
- Secondary Text: #4a5565
- Soft Background: #f8fafc
- Border Gray: #e2e8f0


UI should feel:
- modern
- fintech SaaS
- enterprise-ready
- AI-native
- clean
- operationally efficient


Avoid:
- hardcoded random colors
- duplicated styles
- cluttered pricing cards
- inconsistent spacing


--------------------------------------------------
VALIDATION REQUIREMENTS
--------------------------------------------------


Validate:
- workspace membership
- plan existence
- subscription state validity
- plan visibility
- feature metadata structure
- limits metadata structure


--------------------------------------------------
SECURITY REQUIREMENTS
--------------------------------------------------


Always:
- enforce workspace isolation
- validate authenticated user
- validate workspace membership
- protect subscription APIs


Never:
- expose cross-workspace subscription data
- trust frontend validation alone


--------------------------------------------------
TESTING REQUIREMENTS
--------------------------------------------------


Add tests or testing instructions for:
- plans retrieval
- current subscription retrieval
- plan comparison rendering
- workspace isolation
- feature metadata retrieval
- subscription status rendering
- activity logging


UI testing:
- pricing cards visibility
- responsive layout
- active/current plan indicators
- branded colors/states
- loading/error/empty states


--------------------------------------------------
DEPLOYMENT REQUIREMENTS
--------------------------------------------------


Document:
- required environment variables
- future billing integration points
- future Stripe-ready areas


Do not add real payment secrets yet unless already required.


--------------------------------------------------
MANUALS & DOCUMENTATION
--------------------------------------------------


Update:
- README
- subscription foundation guide
- plans architecture notes
- future billing integration notes


--------------------------------------------------
IMPLEMENTATION BEHAVIOR
--------------------------------------------------


Before editing files:
1. Inspect the current backend/frontend structure.
2. Review existing shared layouts/components.
3. Inspect existing plans/subscription schema.
4. Identify affected files/modules/pages/routes.
5. Explain the implementation plan first.
6. Explain any schema assumptions or missing requirements.
7. Wait for approval before editing files.


After implementation:
1. List changed files.
2. Explain backend architecture changes.
3. Explain frontend/shared component changes.
4. Explain subscription foundation architecture.
5. Explain reusable shared components created.
6. Explain testing steps.
7. Explain future readiness for:
   - billing
   - AI limits
   - upgrade/downgrade flows
8. Mention any remaining risks or future improvements.