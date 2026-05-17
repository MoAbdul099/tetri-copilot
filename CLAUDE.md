# Tetri Copilot — Claude Code Instructions

## Project Identity

This repository belongs to Tetri Copilot.

Tetri Copilot is an AI-first lightweight SME operating assistant focused on:
- finance operations
- invoicing
- expenses
- compliance support
- AI-powered operational assistance
- workspace-based SaaS operations

The system must feel:
- modern
- AI-native
- enterprise-ready
- trustworthy
- operationally efficient
- lightweight and scalable

---

# Source of Truth

Before implementing any feature, always read:

- docs/BRD-Tetri-Copilot-v2.1.md
- docs/SRS-Tetri-Copilot-v2.0.md
- docs/branding.md
- docs/database/schema.sql
- backend/prisma/schema.prisma
- relevant docs/slices/*.md file

Priority order:
1. BRD = business intent
2. SRS = functional behavior
3. SAL = architecture and technical direction
4. Prisma/schema.sql = database implementation
5. branding.md = frontend/UI styling source of truth
6. slice files = implementation scope

Do not invent business rules unless explicitly requested.

If requirements conflict:
- explain the conflict first
- do not silently choose implementation behavior

---

# Development Method

Use vertical-slice development.

Every slice must include:
- database integration
- backend API
- frontend UI
- validation
- permissions/security
- testing or testing instructions
- deployment considerations
- manual/help updates

A slice is NOT complete until it works end-to-end.

Do not build backend-only features unless explicitly requested.

---

# Tech Stack

## Backend

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM

## Frontend

- React
- Vite
- Tailwind CSS
- shadcn/ui

## Authentication

- Clerk

## Hosting

Frontend:
- Cloudflare Pages

Backend:
- Ubuntu VPS
- PM2
- Nginx reverse proxy

Database:
- PostgreSQL on Ubuntu VPS

## Storage

- Cloudflare R2

## Development

- Cursor IDE
- VS Code
- Claude Code
- GitHub

---

# Branding & UI Rules

Before implementing or modifying frontend UI, always read:

- docs/branding.md

branding.md is the source of truth for:
- colors
- typography
- logo usage
- spacing
- buttons
- cards
- authentication screens
- dashboard layouts
- iconography
- dark mode
- AI interaction styling

---

## Branding Requirements

All frontend UI must follow Tetri Copilot branding.

The UI should feel:
- modern
- intelligent
- trustworthy
- enterprise-ready
- AI-native
- clean
- operationally efficient

Avoid:
- cluttered interfaces
- overly colorful layouts
- cartoonish UI
- heavy gradients
- inconsistent spacing
- excessive shadows
- decorative fonts

---

## Frontend Stack Rules

Use:
- Tailwind CSS
- shadcn/ui
- Lucide React

Use centralized:
- theme tokens
- color system
- spacing system
- typography system

Do not:
- hardcode random colors
- create inconsistent component styles
- duplicate styling systems

---

## Authentication UI Rules

Authentication pages must:
- follow Tetri branding
- use Tetri logo
- use clean centered layouts
- feel modern and secure

For MVP:
- Clerk prebuilt auth UI may remain
- Clerk branding/logo may remain temporarily

However:
- surrounding auth layout must follow Tetri branding

---

## Dashboard UI Rules

Dashboard experience should feel:
- spacious
- enterprise-grade
- fintech-inspired
- AI-native
- productivity-focused

Inspired by:
- Linear
- Stripe
- Ramp
- Mercury
- Notion
- Vercel

---

## Dark Mode Rules

Dark mode must support:
- #020817 backgrounds
- #0f172a surfaces
- readable typography
- accessible contrast

Avoid:
- glowing neon effects
- low contrast UI
- noisy styling

---

## Branding Asset Locations

Logos:
- frontend/public/logo.svg
- frontend/public/logo-light.svg
- frontend/public/logo-dark.svg

Icons:
- frontend/public/favicon.ico
- frontend/public/icon-64.png
- frontend/public/icon-128.png

Branding documentation:
- docs/branding.md

---

# Architecture Principles

Follow:
- feature-based modular architecture
- service layer architecture
- reusable validation patterns
- centralized error handling
- centralized authorization
- reusable frontend components
- clean separation of concerns

Never:
- place business logic inside controllers
- duplicate validation logic
- directly expose Prisma models to frontend
- bypass workspace isolation

---

# Multi-Tenant Rules

The platform is workspace-based multi-tenant SaaS.

All tenant-owned data must:
- include workspace_id
- enforce workspace filtering
- validate workspace membership

Never expose:
- cross-workspace data
- unauthorized workspace access

Always validate:
- authenticated user
- workspace membership
- role permissions

---

# Authentication Rules

Clerk is:
- source of truth for authentication identity
- session handling provider
- password/security provider

Local database stores:
- application profile
- workspace relationships
- operational roles
- internal references

Never trust frontend auth state alone.

Backend must verify:
- Clerk session/JWT
- workspace membership
- permissions

---

# Backend Architecture Rules

Backend modules should follow:

src/modules/[feature]/
  [feature].routes.js
  [feature].controller.js
  [feature].service.js
  [feature].repository.js
  [feature].validation.js
  [feature].constants.js

Controllers:
- thin only

Services:
- business logic

Repositories:
- database access

Validation:
- centralized
- reusable
- schema-based

---

# Frontend Architecture Rules

Frontend features should follow:

src/features/[feature]/
  pages/
  components/
  hooks/
  services/
  schemas/
  utils/

Each feature should include:
- API service layer
- loading states
- error states
- empty states
- validation
- reusable components

---

# API Standards

Use:
- REST API
- /api/v1

## Success Response

```json
{
  "success": true,
  "data": {},
  "message": ""
}