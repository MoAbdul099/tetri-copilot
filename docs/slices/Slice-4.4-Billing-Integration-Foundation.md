# Slice 4.4 — Billing Integration Foundation (Stripe-ready)


## Objective


Implement the billing integration foundation for Tetri Copilot with a Stripe-ready architecture.


This slice establishes:
- billing provider abstraction
- Stripe-ready configuration foundation
- checkout session foundation
- billing portal foundation
- webhook processing foundation
- billing event logging
- subscription synchronization architecture
- branded billing management UI foundation
- safe future payment automation readiness


This slice prepares Tetri Copilot for real subscription billing while keeping the implementation controlled, testable, and extendable.


---


# Scope


This slice includes:


- Billing provider abstraction
- Stripe-ready service layer
- Stripe checkout session foundation
- Stripe customer mapping foundation
- Stripe subscription sync foundation
- Stripe webhook endpoint foundation
- Billing event logging
- Billing portal link foundation
- Billing environment configuration
- Billing status sync preparation
- Branded billing integration UI
- Billing readiness documentation
- Shared billing layout/component reuse


This slice uses:
- React + Vite
- Tailwind CSS
- shadcn/ui
- Lucide React
- Express.js
- PostgreSQL
- Prisma ORM
- Clerk authentication
- Stripe-ready backend architecture


This slice depends on:
- Slice 1 Authentication & Workspace Bootstrap
- Slice 2 Workspace & Company Setup
- Slice 3 Workspace User Management & Roles
- Slice 4.1 Plans Catalog & Subscription Foundation
- Slice 4.2 Workspace Current Plan & Usage Summary
- Slice 4.3 Upgrade / Downgrade / Cancel Plan
- docs/branding.md
- shared layout/components


---


# Important Scope Notes


This slice is a billing integration foundation.


It should be Stripe-ready, but it should avoid overbuilding advanced billing behavior.


This slice may implement:
- test-mode checkout session creation
- test-mode billing portal session creation
- webhook endpoint foundation
- billing event storage
- subscription sync foundation


This slice should NOT implement:
- complex tax handling
- invoice PDF generation
- refunds
- coupon management
- metered billing
- advanced proration logic
- revenue reporting
- advanced billing analytics
- multi-provider billing
- admin billing management


Those belong to later slices.


---


# Branding Requirements


Before implementing frontend UI, read:


- docs/branding.md


All billing and payment-related UI must follow Tetri Copilot branding.


The UI should feel:
- trustworthy
- secure
- modern
- enterprise-ready
- fintech SaaS
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
- cluttered billing screens
- confusing payment states
- unbranded payment flows
- random hardcoded colors
- duplicated component styling


---


# Shared Layout & Component Rules


Before creating new components:
1. Reuse existing shared layouts/components whenever possible.
2. Create new shared components only if there is clear reuse value.
3. Avoid overengineering.


Reuse or create where appropriate:


- BillingLayout
- SubscriptionCard
- PricingCard
- StatusBadge
- ConfirmationDialog
- InfoCard
- WarningCard
- BillingActionCard
- BillingEventList
- LoadingState
- EmptyState


Use shadcn/ui as the primary UI foundation.


Avoid:
- duplicated billing cards
- duplicated status badges
- duplicated dialog styling
- isolated styling systems


---


# Backend Requirements


## Billing Provider Abstraction


Implement a provider abstraction layer so Stripe is not hardcoded across controllers.


Suggested structure:
- billing.provider.js
- stripe.provider.js
- billing.service.js
- billing.controller.js
- billing.routes.js
- billing.validation.js


The system should allow future replacement or extension of billing provider logic.


---


## Stripe Configuration Foundation


Implement environment-driven Stripe configuration.


Required backend environment variables:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_SUCCESS_URL
- STRIPE_CANCEL_URL
- FRONTEND_URL


Do not hardcode Stripe keys, URLs, or price IDs.


---


## Stripe Customer Mapping Foundation


Implement foundation to link:
- workspace
- subscription
- Stripe customer ID
- Stripe subscription ID


Use existing schema where available.


Expected existing fields may include:
- subscriptions.stripe_customer_id
- subscriptions.stripe_subscription_id


Before adding schema changes:
- inspect existing Prisma schema
- reuse existing fields where possible
- explain any required migration first


---


## Checkout Session Foundation


Implement backend foundation for creating Stripe checkout sessions.


Suggested endpoint:
- POST /api/v1/billing/checkout-session


Expected behavior:
1. Validate authenticated user.
2. Validate workspace membership.
3. Validate owner permission.
4. Validate selected plan.
5. Create or reuse Stripe customer.
6. Create checkout session in test mode.
7. Return checkout URL to frontend.


Do not place Stripe logic in controller.


---


## Billing Portal Foundation


Implement backend foundation for creating billing portal sessions.


Suggested endpoint:
- POST /api/v1/billing/portal-session


Expected behavior:
1. Validate authenticated user.
2. Validate workspace membership.
3. Validate owner permission.
4. Validate existing Stripe customer ID.
5. Create billing portal session.
6. Return portal URL to frontend.


---


## Webhook Foundation


Implement Stripe webhook endpoint foundation.


Suggested endpoint:
- POST /api/v1/billing/webhook


Webhook must:
- verify Stripe signature
- use raw body parsing where required
- store billing event records
- prepare subscription sync logic
- avoid duplicate processing where possible


Supported event foundation:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed


Do not implement over-complex business logic yet.


---


## Billing Event Logging


Store billing provider events.


Use:
- billing_events table if available
- activity_logs where appropriate
- audit_logs for sensitive billing changes where appropriate


Billing event should capture:
- workspace_id if known
- subscription_id if known
- event_type
- provider
- provider_event_id
- payload
- created_at


---


## Subscription Sync Foundation


Prepare sync logic for:
- Stripe subscription status
- current period start
- current period end
- cancel_at_period_end
- Stripe customer ID
- Stripe subscription ID


Do not overcomplicate proration or multi-product logic.


---


# Backend Structure


Use:


src/modules/billing/
src/modules/subscriptions/
src/modules/plans/


Suggested billing module files:


src/modules/billing/billing.routes.js
src/modules/billing/billing.controller.js
src/modules/billing/billing.service.js
src/modules/billing/billing.validation.js
src/modules/billing/providers/stripe.provider.js
src/modules/billing/providers/billing.provider.js
src/modules/billing/billing.repository.js
src/modules/billing/billing.constants.js


Follow:
- service layer architecture
- centralized validation
- centralized error handling
- workspace isolation
- role-based access control
- provider abstraction


Controllers must remain thin.


Business logic belongs in services.


Repositories/control layers manage Prisma access.


---


# Frontend Requirements


## Billing Actions UI


Implement:
- checkout action button
- billing portal action button
- billing status display
- payment setup status
- billing integration status


---


## Checkout Flow UI


Implement:
- selected plan checkout action
- loading state while creating checkout session
- error state if checkout session fails
- redirect to Stripe checkout URL


Do not build custom credit-card forms.


Payments should be handled by Stripe-hosted checkout.


---


## Billing Portal UI


Implement:
- manage billing button
- loading state while creating billing portal session
- error state if portal session fails
- redirect to Stripe billing portal URL


---


## Billing Events UI Foundation


Optional but recommended:
- basic billing events list
- recent billing sync status
- payment status messages


Keep it simple.


---


## Billing Status UI


Display:
- current subscription status
- current plan
- next renewal date if available
- cancellation status if available
- payment issue warning if available


---


# Branded UI Requirements


## Layout


Billing screens should:
- use existing AppShell/shared layouts
- feel secure and trustworthy
- use clean payment action areas
- use clear status messaging
- avoid clutter


---


## Components


Use shadcn/ui components for:
- cards
- buttons
- alerts
- badges
- dialogs
- tables if billing events are shown


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


Danger/destructive billing actions:
- use destructive styling carefully
- require confirmation where needed


---


## Alerts


Use alerts for:
- payment failed
- past due status
- cancellation pending
- billing setup missing
- webhook sync issue if visible


---


## Typography


Use:
- Manrope
- concise payment messaging
- clear user-facing billing descriptions
- simple subscription status language


---


## Icons


Use:
- Lucide React
- secure/payment-related icons where useful
- neutral icons for status and events


---


## UX Requirements


Include:
- loading states
- error states
- success states
- responsive layout
- accessible contrast
- safe redirect handling


---


# Database Requirements


Follow:
- Prisma schema
- SQL schema


Relevant tables may include:
- plans
- subscriptions
- billing_events
- activity_logs
- audit_logs
- workspaces
- workspace_members


Use:
- workspace_id isolation
- UUID IDs
- Prisma migrations only if required


Do not create unnecessary tables if the existing schema already supports the needed foundation.


---


# Billing Rules


## Owner Permission Rule


Only workspace owner can:
- start checkout
- access billing portal
- manage billing actions


Users/viewers cannot manage billing.


---


## Provider Rule


Stripe should be used through a provider abstraction layer.


Controllers should not call Stripe SDK directly.


---


## Checkout Rule


Checkout session must:
- validate plan
- validate workspace
- validate owner permission
- use environment URLs
- return Stripe-hosted checkout URL


---


## Webhook Rule


Webhook endpoint must:
- verify Stripe signature
- store event payload
- avoid duplicate event processing where possible
- update subscription state only through controlled service logic


---


# API Endpoints


## Checkout Session


### POST
/api/v1/billing/checkout-session


Expected payload:
- plan_id or plan_code
- billing_interval if supported


Returns:
- checkout_url


---


## Billing Portal Session


### POST
/api/v1/billing/portal-session


Returns:
- portal_url


---


## Billing Events


### GET
/api/v1/billing/events


Returns:
- recent billing events for current workspace


---


## Webhook


### POST
/api/v1/billing/webhook


Receives:
- Stripe webhook events


Important:
- must support raw body parsing for signature verification


---


# User Flows


## Checkout Flow


1. Owner opens plans/subscription page.
2. Owner selects plan.
3. Owner clicks checkout/subscribe.
4. Backend validates owner and workspace.
5. Backend creates Stripe checkout session.
6. Frontend redirects to Stripe checkout.
7. Stripe handles payment.
8. Webhook receives event.
9. Subscription sync foundation updates local records.


---


## Billing Portal Flow


1. Owner opens billing page.
2. Owner clicks manage billing.
3. Backend validates owner and Stripe customer.
4. Backend creates billing portal session.
5. Frontend redirects to Stripe billing portal.


---


## Webhook Sync Flow


1. Stripe sends event.
2. Backend verifies signature.
3. Backend stores billing event.
4. Backend syncs subscription fields where supported.
5. Activity/audit logs are created where appropriate.


---


# Validation Rules


Validate:
- authenticated session
- workspace ownership
- plan existence
- plan is active
- Stripe customer ID existence where required
- Stripe webhook signature
- event type support


Validate:
- all API payloads
- workspace isolation


---


# Security Rules


## Required


- Enforce workspace isolation
- Enforce owner-only billing actions
- Verify Stripe webhook signatures
- Use raw body for webhook verification
- Use environment variables for secrets
- Never expose Stripe secret keys to frontend
- Never trust frontend price or amount values


## Forbidden


- Cross-workspace billing access
- Frontend-supplied price trust
- Hardcoded Stripe secrets
- Hardcoded success/cancel URLs
- Unverified webhook processing
- Custom card storage
- Logging full sensitive payment data


---


# Activity & Audit Logging


Create activity logs for:
- checkout session created
- billing portal session created
- webhook received
- subscription synced
- payment failed
- payment succeeded


Create audit logs where appropriate for:
- subscription status changes
- billing customer linkage
- cancellation/payment status changes


Avoid logging:
- payment card details
- secret keys
- sensitive Stripe data not needed for operations


---


# Environment Variables


## Backend


Required:
- DATABASE_URL
- CLERK_SECRET_KEY
- FRONTEND_URL
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_SUCCESS_URL
- STRIPE_CANCEL_URL


Optional:
- STRIPE_PORTAL_RETURN_URL
- STRIPE_API_VERSION


## Frontend


Required:
- VITE_API_BASE_URL
- VITE_CLERK_PUBLISHABLE_KEY


No Stripe secret keys should exist in frontend env.


---


# Testing Requirements


Add tests or testing instructions for:


## Checkout


- owner can create checkout session
- non-owner cannot create checkout session
- invalid plan is rejected
- checkout URL is returned


---


## Billing Portal


- owner can create portal session
- non-owner cannot create portal session
- missing Stripe customer is handled gracefully


---


## Webhooks


- valid webhook signature is accepted
- invalid webhook signature is rejected
- billing event is stored
- supported subscription events are handled


---


## Subscription Sync


- Stripe customer ID is stored
- Stripe subscription ID is stored
- subscription status is updated
- current period fields are updated where available


---


## Branding/UI


- billing screens follow branding
- checkout and portal buttons follow branding
- alerts and status badges follow branding
- responsive layout works


---


## Multi-Tenant Isolation


- workspace filtering validation
- cross-workspace billing access prevention


---


# Deployment Notes


## Backend


Deploy using:
- Ubuntu VPS
- PM2
- Nginx reverse proxy


Required deployment tasks:
- add Stripe environment variables
- configure webhook endpoint URL
- ensure raw body parsing works for webhook route
- run Prisma migrations if required
- validate production/staging Stripe mode


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


## Stripe Dashboard Setup


Document:
- test mode setup
- products/prices setup
- webhook endpoint setup
- webhook events to enable
- success URL
- cancel URL
- billing portal configuration


---


# Manual/Help Updates


Update:
- README.md
- billing integration guide
- Stripe setup guide
- subscription billing guide
- owner billing management guide


Document:
- Stripe test mode setup
- checkout flow
- billing portal flow
- webhook setup
- billing sync behavior
- environment variables


---


# Suggested Future Enhancements


Possible future additions:
- yearly/monthly billing toggle
- tax handling
- invoices/receipts display
- billing history
- advanced subscription schedules
- coupons/discounts
- prorated upgrade/downgrade handling
- refunds
- payment retry handling
- revenue dashboard
- admin billing management
- multi-provider payment abstraction


Do not implement unless explicitly approved.


---


# Out of Scope


Do not implement:
- custom card input forms
- card data storage
- advanced tax logic
- refunds
- coupons
- revenue analytics
- complex proration
- admin billing management
- AI billing
- invoice PDF generation
- payment collection outside Stripe Checkout


These belong to future slices.


---


# Completion Criteria


This slice is complete only when:


- billing provider abstraction exists
- Stripe-ready backend service exists
- checkout session foundation works in test mode or is clearly stubbed with documentation
- billing portal foundation works in test mode or is clearly stubbed with documentation
- webhook endpoint foundation exists
- webhook signature verification is implemented
- billing events are stored
- subscription sync foundation exists
- owner-only billing permissions work
- workspace isolation works
- frontend billing actions are branded and usable
- no Stripe secrets are exposed to frontend
- deployment/Stripe setup docs are updated
- tests/testing instructions are added
- README/manuals are updated