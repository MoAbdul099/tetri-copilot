# Slice-10.5 — Frontend/Backend App Boundary & Subdomain Readiness

## Slice Information

| Field | Value |
|---------|---------|
| Slice ID | 10.5 |
| Slice Name | Frontend/Backend App Boundary & Subdomain Readiness |
| Type | Technical Foundation |
| Priority | Medium |
| Estimated Effort | 1–2 Days |
| Dependencies | Slices 0–10.4 |
| Future Dependency For | Slice 13, Slice 19, Slice 20 |
| Database Changes | No |
| User Visible Changes | No |
| API Changes | Internal Namespace Preparation |

---

# 1. Purpose

This slice introduces the architectural foundation required to support future separation of:

- Public Website
- Customer Application
- Platform Administration Panel
- Backend API Services

while maintaining:

- Single repository
- Shared codebase
- Shared component library
- Unified development workflow

The objective is to prepare Tetri Copilot for future deployment to:

- www.tetricopilot.com
- app.tetricopilot.com
- admin.tetricopilot.com
- api.tetricopilot.com

without requiring large-scale refactoring when Slice 19 (Admin Panel) and Slice 20 (Public Website) are implemented.

No business functionality shall be modified by this slice.

---

# 2. Objectives

## Business Objectives

1. Reduce future technical debt.
2. Establish clear application ownership boundaries.
3. Improve maintainability.
4. Improve scalability.
5. Support future multi-domain deployment.
6. Support future white-label architecture.
7. Improve security segregation between customer and platform administration functions.

## Technical Objectives

1. Separate frontend application domains.
2. Separate backend service domains.
3. Standardize route namespaces.
4. Standardize API namespaces.
5. Centralize shared libraries.
6. Centralize shared UI components.
7. Prepare deployment configuration standards.
8. Prepare future infrastructure automation.

---

# 3. Scope

## Included

- Frontend structure reorganization
- Backend module segmentation
- Shared component architecture
- Shared hooks architecture
- Shared services architecture
- Route namespace strategy
- API namespace strategy
- Environment configuration standardization
- Permission boundary preparation
- Documentation updates

## Excluded

- Cloudflare DNS configuration
- VPS configuration
- OpenLiteSpeed configuration
- SSL configuration
- Production deployment
- CI/CD modifications
- Domain cutover activities

These activities belong to Slice 13.

---

# 4. Future Target Architecture

## Public Website

Domain:

www.tetricopilot.com

Responsibilities:

- Marketing pages
- Pricing pages
- Features pages
- Blog
- Knowledge base
- Contact pages
- Legal pages

Future Slice:

Slice 20

## Customer Application

Domain:

app.tetricopilot.com

Responsibilities:

- Workspace operations
- Customers
- Vendors
- Invoices
- Expenses
- Compliance
- Reports
- Notifications
- Settings

## Platform Administration

Domain:

admin.tetricopilot.com

Responsibilities:

- Subscription plans
- Feature management
- Countries
- Templates
- Global notifications
- Global settings
- System monitoring
- Tenant administration

Future Slice:

Slice 19

## Backend API

Domain:

api.tetricopilot.com

Namespaces:

- /api/public/*
- /api/app/*
- /api/admin/*

---

# 5. Frontend Architecture Requirements

## Target Folder Structure

```text
frontend/
└── src/
    ├── customer/
    │   ├── routes/
    │   ├── pages/
    │   ├── layouts/
    │   └── features/
    │
    ├── admin/
    │   ├── routes/
    │   ├── pages/
    │   ├── layouts/
    │   └── features/
    │
    ├── website/
    │   ├── routes/
    │   ├── pages/
    │   ├── layouts/
    │   └── content/
    │
    ├── shared/
    │   ├── components/
    │   ├── hooks/
    │   ├── services/
    │   ├── lib/
    │   ├── utils/
    │   └── types/
    │
    └── providers/
```

## Layout Separation

### Customer Layout

Contains:

- Sidebar
- Workspace switcher
- Notifications
- User profile

### Admin Layout

Contains:

- Admin navigation
- Platform management menu
- Monitoring widgets

### Website Layout

Contains:

- Marketing navigation
- Footer
- SEO components

---

# 6. Frontend Routing Requirements

## Customer Routes

```text
/app/*
```

Examples:

```text
/app/dashboard
/app/customers
/app/vendors
/app/invoices
/app/expenses
/app/compliance
```

## Admin Routes

```text
/admin/*
```

Examples:

```text
/admin/dashboard
/admin/plans
/admin/features
/admin/countries
```

## Website Routes

```text
/
/pricing
/features
/about
/contact
/blog
/help
```

---

# 7. Shared Library Standards

## Shared Components

Location:

```text
src/shared/components
```

Examples:

- Button
- Input
- Modal
- Table
- Select
- Tabs
- Badge
- Tooltip
- Avatar

## Shared Hooks

Location:

```text
src/shared/hooks
```

Examples:

- useApi
- useWorkspace
- usePermissions
- useNotifications

## Shared Types

Location:

```text
src/shared/types
```

Examples:

- User
- Workspace
- Subscription
- Notification
- Country

---

# 8. Backend Architecture Requirements

## Target Module Structure

```text
backend/src/modules/
├── public/
├── app/
├── admin/
├── auth/
├── notifications/
├── billing/
├── compliance/
└── shared/
```

## Public APIs

Namespace:

```text
/api/public/*
```

Examples:

```text
/plan
/features
/contact
```

Authentication:

Not required

## Customer APIs

Namespace:

```text
/api/app/*
```

Authentication:

Required

## Admin APIs

Namespace:

```text
/api/admin/*
```

Authentication:

Required

Authorization:

Platform Administrator only

---

# 9. Permission Boundary Requirements

## Platform Permissions

Examples:

```text
manage_plans
manage_features
manage_countries
manage_templates
manage_platform_users
```

## Workspace Permissions

Examples:

```text
manage_customers
manage_vendors
manage_invoices
manage_expenses
manage_compliance
```

## Security Rules

Non-platform users must never access:

```text
/admin/*
/api/admin/*
```

Public users must never access:

```text
/api/app/*
/api/admin/*
```

---

# 10. Environment Variable Standards

## Frontend

```env
VITE_API_URL=
VITE_APP_URL=
VITE_ADMIN_URL=
VITE_WEBSITE_URL=
```

## Backend

```env
API_URL=
APP_URL=
ADMIN_URL=
WEBSITE_URL=
```

---

# 11. Database Impact

## New Tables

None

## Modified Tables

None

## Migration Required

No

---

# 12. Backend Tasks

1. Create module namespace structure.
2. Introduce API namespace routing.
3. Create admin middleware placeholder.
4. Create public middleware placeholder.
5. Update route registration.
6. Update backend documentation.

---

# 13. Frontend Tasks

1. Create customer application boundary.
2. Create admin application boundary.
3. Create website application boundary.
4. Move shared components.
5. Move shared hooks.
6. Move shared services.
7. Move shared types.
8. Update imports.
9. Update documentation.

---

# 14. Testing Requirements

## Unit Testing

- Route grouping validation
- Middleware validation
- Permission validation

## Integration Testing

- Existing slices continue functioning
- Existing APIs remain operational
- Existing permissions remain operational

## Security Testing

Verify non-admin users cannot access:

```text
/admin/*
/api/admin/*
```

---

# 15. Acceptance Criteria

## AC-001

Frontend contains:

- customer
- admin
- website
- shared

boundaries.

## AC-002

Backend contains:

- public
- app
- admin
- shared

boundaries.

## AC-003

Route namespaces implemented.

## AC-004

API namespaces implemented.

## AC-005

Shared libraries centralized.

## AC-006

Documentation updated.

## AC-007

No business functionality regression.

## AC-008

Future subdomain deployment achievable without major refactoring.

---

# 16. Claude Code Implementation Instructions

Implement this slice as an architectural foundation only.

Rules:

1. No business functionality changes.
2. No database schema changes.
3. No user experience changes.
4. No API contract changes.
5. Existing slices must remain operational.
6. Introduce folder boundaries only.
7. Introduce namespace boundaries only.
8. Refactor imports where required.
9. Update architecture documentation.
10. Validate all existing features after refactoring.

Future deployment target:

- www.tetricopilot.com
- app.tetricopilot.com
- admin.tetricopilot.com
- api.tetricopilot.com

must be achievable without further architecture restructuring.

---

# Deliverables

- Updated frontend architecture
- Updated backend architecture
- Shared library architecture
- Route namespace framework
- API namespace framework
- Permission boundary framework
- Updated technical documentation
- Full regression validation

---

# End of Slice 10.5
