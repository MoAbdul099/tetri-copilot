Software Requirements Specification (SRS)

Tetri Copilot

AI-First Lightweight SME Operating Assistant

Version 2.0



1\. Introduction

1.1 Purpose

This Software Requirements Specification (SRS) document defines the detailed technical, functional, operational, architectural, and implementation requirements for the Tetri Copilot MVP platform.

This document is based on:

BRD Version 2.0,

Express.js backend architecture,

Prisma ORM implementation,

PostgreSQL database hosted on Ubuntu VPS,

Cloudflare Pages frontend deployment,

feature-by-feature development methodology.

The document is intended to guide:

backend development,

frontend development,

database implementation,

deployment setup,

QA testing,

sprint execution,

AI-assisted development.



1.2 Product Overview

Tetri Copilot is an AI-first lightweight SaaS platform designed for:

SMEs,

freelancers,

startups,

lightweight operational teams.

The platform provides:

invoicing,

expense management,

compliance reminders,

AI operational assistance,

AI document generation,

dashboards,

subscription management,

multilingual operations.

The platform intentionally avoids:

ERP complexity,

heavy enterprise workflows,

complicated accounting operations,

excessive configuration.



1.3 Development Philosophy

The project shall follow:

Feature-by-Feature Incremental Development

Each feature shall be implemented in the following order:

Prisma schema

Prisma migration

Database validation

Backend routes

Controllers

Services/business logic

Frontend UI

Responsive validation

Permission validation

Integration testing

Refactoring

QA approval

No feature shall proceed to production readiness before passing all validation stages.



1.4 Development Environment

Area

Technology

IDE

VS Code

AI IDE

Cursor IDE

AI Coding Assistant

Claude Code

Source Control

GitHub

API Testing

Thunder Client / Postman

Database Inspection

Prisma Studio





2\. System Architecture

2.1 High-Level Architecture

Frontend (React + Vite)

&#x20;       ↓

Cloudflare Pages

&#x20;       ↓

Express.js REST API

&#x20;       ↓

Prisma ORM

&#x20;       ↓

PostgreSQL Database (Ubuntu VPS)





2.2 Frontend Architecture

Frontend responsibilities:

dashboards,

forms,

responsive UI,

authentication flows,

AI interactions,

reports,

notifications.

Recommended Stack:

Layer

Technology

Framework

React + Vite

Styling

Tailwind CSS

UI Components

shadcn/ui

Forms

React Hook Form

Validation

Zod

State Management

Zustand or Context API

Routing

React Router





2.3 Backend Architecture

Backend responsibilities:

REST APIs,

business logic,

authentication validation,

role validation,

AI orchestration,

billing integration,

reminder scheduling,

data validation.

Recommended Stack:

Layer

Technology

Runtime

Node.js

Framework

Express.js

ORM

Prisma ORM

Validation

Zod

Authentication

Clerk

Logging

Winston or Pino





2.4 Backend Folder Structure

backend/

&#x20; src/

&#x20;   config/

&#x20;   middleware/

&#x20;   routes/

&#x20;   controllers/

&#x20;   services/

&#x20;   validators/

&#x20;   prisma/

&#x20;   utils/

&#x20;   jobs/

&#x20;   ai/

&#x20;   lib/

&#x20;   server.js





2.5 Database Architecture

Database Technology:

PostgreSQL

Hosted on Ubuntu VPS

Prisma ORM

Prisma Client

The database shall support:

multi-tenancy,

modular expansion,

future integrations,

AI tracking,

scalable operational data.



2.6 Infrastructure Architecture

Layer

Technology

Frontend Hosting

Cloudflare Pages

Backend Hosting

Ubuntu VPS

Reverse Proxy

Nginx

Process Manager

PM2

SSL

Cloudflare SSL

DNS

Cloudflare DNS

File Storage

Cloudflare R2





2.7 Third-Party Integrations

Service

Purpose

Clerk

Authentication

Stripe

Billing

OpenAI

AI services

Resend

Emails

PostHog

Analytics

Sentry

Monitoring





3\. User Roles \& Permissions

3.1 System Roles

Role

Description

Admin

Global platform administrator

Owner

Business/workspace owner

User

Operational workspace user

Viewer

Read-only user





3.2 Admin Permissions

Admin users shall have access to:

tenant management,

subscription management,

AI analytics,

country profile management,

compliance settings,

feature toggles,

operational monitoring.



3.3 Owner Permissions

Owners shall have access to:

workspace management,

company settings,

users \& invitations,

invoices,

expenses,

dashboards,

reminders,

AI tools,

reports.



3.4 User Permissions

Users shall have access to:

operational activities,

invoices,

expenses,

reminders,

dashboards,

AI tools.

Users shall have restricted access to:

billing,

subscription settings,

admin-only features.



3.5 Viewer Permissions

Viewers shall have:

read-only access,

dashboard access,

report visibility.

Viewers shall not:

modify operational data,

create invoices,

create expenses,

manage users.



4\. Functional Requirements

4.1 Authentication \& User Management Module

4.1.1 Objective

Provide secure authentication and workspace membership management.



4.1.2 Database Models

Required Prisma models:

User

Workspace

WorkspaceMember

Invitation



4.1.3 Backend Requirements

Required APIs:

Endpoint

Method

Purpose

/api/auth/session

GET

Validate session

/api/workspaces

POST

Create workspace

/api/users/invite

POST

Invite user

/api/users/roles

PATCH

Update role





4.1.4 Frontend Requirements

Required pages:

login page,

signup page,

onboarding wizard,

workspace creation,

invitation modal,

users management page.



4.1.5 Validation Requirements

The system shall:

validate Clerk sessions,

validate protected routes,

validate role permissions,

prevent unauthorized access.



4.2 Company \& Workspace Setup Module

4.2.1 Objective

Allow businesses to configure their operational workspace.



4.2.2 Database Models

Required Prisma models:

Company

CompanySettings

CountryProfile

Language

Currency



4.2.3 Functional Requirements

The system shall support:

company setup,

tax settings,

localization settings,

branding settings,

invoice numbering configuration.



4.2.4 Country Profiles

The system shall support:

configurable country profiles,

tax labels,

default currencies,

default languages,

compliance calendars,

timezone settings.

Initial countries:

Georgia,

UAE,

Saudi Arabia,

Qatar.



4.3 Dashboard \& Reporting Module

4.3.1 Objective

Provide operational visibility through lightweight dashboards.



4.3.2 Dashboard Widgets

Required widgets:

revenue summary,

expense summary,

invoice summary,

reminder summary,

AI quick actions,

recent activities.



4.3.3 Reporting Requirements

Reports shall support:

filtering,

sorting,

date ranges,

responsive layouts.



4.3.4 Role-Based Dashboards

Role

Dashboard Scope

Admin

Platform analytics

Owner

Full business overview

User

Operational overview

Viewer

Read-only overview





4.4 Invoice Management Module

4.4.1 Objective

Provide lightweight professional invoicing.



4.4.2 Database Models

Required Prisma models:

Customer

Invoice

InvoiceItem

InvoicePayment

RecurringInvoice



4.4.3 Functional Requirements

The module shall support:

invoice creation,

invoice editing,

invoice deletion,

PDF generation,

multilingual invoices,

recurring invoices,

customer management,

payment tracking,

overdue tracking.



4.4.4 Invoice Calculations

The backend shall calculate:

subtotal,

tax totals,

discounts,

total amount,

overdue amounts.



4.4.5 Frontend Requirements

Required pages:

invoices list,

invoice details,

create invoice form,

customer management,

payment history.



4.5 Expense Management Module

4.5.1 Objective

Provide lightweight expense management.



4.5.2 Database Models

Required Prisma models:

Expense

ExpenseCategory

File



4.5.3 Functional Requirements

The module shall support:

expense tracking,

receipt uploads,

expense categorization,

AI category suggestions,

expense reporting.



4.5.4 File Upload Requirements

Uploads shall support:

receipts,

images,

PDFs.

Files shall be stored in:

Cloudflare R2.



4.6 Compliance Reminder Engine

4.6.1 Objective

Provide automated compliance and operational reminders.



4.6.2 Database Models

Required Prisma models:

Reminder

ReminderLog

ComplianceCalendarItem

Notification



4.6.3 Functional Requirements

The reminder engine shall support:

recurring reminders,

compliance reminders,

invoice reminders,

email reminders,

dashboard reminders,

country-based reminders.



4.6.4 Notification Channels

Supported channels:

dashboard notifications,

email notifications.



4.7 AI Assistant Module

4.7.1 Objective

Provide AI-powered operational guidance.



4.7.2 Database Models

Required Prisma models:

AiConversation

AiMessage

AiUsageLog



4.7.3 AI Functional Requirements

The AI assistant shall support:

invoice guidance,

operational guidance,

compliance guidance,

AI recommendations,

multilingual interactions.



4.7.4 AI Usage Requirements

The system shall:

track AI usage,

enforce subscription limits,

log token usage,

track estimated AI cost.



4.7.5 AI Security Requirements

The system shall:

validate workspace ownership,

validate AI permissions,

restrict unauthorized access.



4.8 AI Document Generator Module

4.8.1 Objective

Generate operational documents using AI.



4.8.2 Database Models

Required Prisma models:

DocumentTemplate

GeneratedDocument



4.8.3 Functional Requirements

Supported documents:

quotations,

NDAs,

agreements,

operational letters.

The system shall support:

editable drafts,

PDF export,

multilingual templates.



4.9 Subscription \& Billing Module

4.9.1 Objective

Manage SaaS subscriptions and billing.



4.9.2 Database Models

Required Prisma models:

Plan

Subscription

BillingEvent



4.9.3 Functional Requirements

The system shall support:

Stripe subscriptions,

plan upgrades,

plan downgrades,

AI limits,

user limits,

invoice limits.



4.9.4 Subscription Plans

Plan

Price

Users

Free

$0

1

Starter

$4

1

Professional

$8

Up to 5

Business

$12

More than 5





4.10 Admin Management Module

4.10.1 Objective

Provide centralized platform administration.



4.10.2 Functional Requirements

Admin panel shall support:

tenant management,

AI analytics,

subscriptions monitoring,

country profile management,

compliance management,

feature toggles,

operational monitoring.



5\. Database Requirements

5.1 Database Technology

The system shall use:

PostgreSQL,

Prisma ORM,

Prisma Client.



5.2 PostgreSQL Hosting

PostgreSQL shall initially be hosted on:

Ubuntu VPS.

The server shall support:

secure remote access,

backups,

scalability,

optimized queries.



5.3 Prisma Requirements

Prisma shall be used for:

schema management,

migrations,

type-safe queries,

database relations,

query abstraction.



5.4 Multi-Tenant Requirements

The platform shall implement:

Workspace-Based Multi-Tenancy

Each operational table shall contain:

workspaceId.

Tenant isolation shall be enforced:

at API level,

through Prisma query filtering,

through middleware validation.



5.5 Prisma Migration Workflow

Development workflow:

npx prisma migrate dev

npx prisma generate



Prisma Studio may be used for:

debugging,

development validation,

seed inspection.



6\. API Requirements

6.1 API Architecture

The backend shall follow:

REST APIs,

modular route structure,

controller/service separation.



6.2 Middleware Requirements

Required middleware:

authentication validation,

role validation,

request validation,

error handling,

logging,

rate limiting.



6.3 API Validation

All APIs shall validate:

request body,

parameters,

permissions,

workspace ownership.



6.4 Error Handling

The backend shall support:

centralized error handling,

structured error responses,

validation messages,

logging.



7\. Frontend Requirements

7.1 Frontend Philosophy

The frontend shall remain:

lightweight,

modern,

responsive,

minimal,

mobile-first.



7.2 Responsive Requirements

The UI must fully support:

desktop,

tablets,

mobile phones.

Special focus:

mobile navigation,

responsive dashboards,

responsive forms,

touch-friendly interactions.



7.3 UI Design Requirements

The UI shall prioritize:

simplicity,

fast interactions,

clean layouts,

readable dashboards,

operational clarity.



8\. Deployment Requirements

8.1 Frontend Deployment

Frontend deployment shall use:

Cloudflare Pages.

Benefits:

low cost,

CDN optimization,

automatic SSL.



8.2 Backend Deployment

Backend deployment shall use:

Ubuntu VPS,

PM2,

Nginx.



8.3 Backend Deployment Workflow

Deployment process:

Pull latest code from GitHub

Install dependencies

Run Prisma migrations

Restart PM2 services

Validate APIs



8.4 PM2 Requirements

PM2 shall support:

process management,

automatic restart,

logs,

uptime monitoring.



8.5 Nginx Requirements

Nginx shall support:

reverse proxy,

SSL forwarding,

API routing,

compression.



9\. Security Requirements

9.1 Authentication Security

The system shall:

validate Clerk sessions,

protect APIs,

secure routes,

validate user roles.



9.2 Database Security

The PostgreSQL server shall support:

strong passwords,

firewall restrictions,

limited external access,

regular backups.



9.3 Environment Variables

Sensitive configuration shall use:

.env files,

server-only environment variables.



10\. Logging \& Monitoring

10.1 Monitoring

The platform shall integrate:

Sentry,

backend logs,

API logs.



10.2 Activity Tracking

The platform shall support:

activity logs,

audit logs,

AI usage logs.



11\. Analytics Requirements

The system shall integrate:

PostHog analytics.

Analytics include:

onboarding tracking,

feature usage,

AI usage,

operational metrics.



12\. Email Requirements

The system shall use:

Resend email service.

Email types:

invitations,

reminders,

invoice notifications,

operational notifications.



13\. GitHub \& Source Control Requirements

13.1 Repository Structure

tetri-copilot/

&#x20; backend/

&#x20; frontend/





13.2 Branch Strategy

Recommended branches:

main,

development,

feature/\*.



13.3 Git Workflow

Recommended workflow:

Create feature branch

Implement feature

Test locally

Commit changes

Push to GitHub

Merge after validation



14\. AI-Assisted Development Workflow

14.1 Cursor IDE Usage

Cursor IDE may be used for:

code suggestions,

refactoring,

architecture generation,

code explanations.



14.2 Claude Code Usage

Claude Code may be used for:

backend generation,

Prisma generation,

frontend scaffolding,

debugging support,

architecture recommendations.



14.3 Developer Responsibility

Developers must:

validate generated code,

validate security,

validate business logic,

validate performance.



15\. Testing Requirements

15.1 Mandatory Testing

Every feature must pass:

Test Type

Required

API Testing

Yes

Responsive Testing

Yes

Permission Testing

Yes

Validation Testing

Yes

Error Handling

Yes

Integration Testing

Yes





15.2 Recommended Testing Tools

Tool

Purpose

Thunder Client

API testing

Postman

API testing

Prisma Studio

Database inspection

Browser DevTools

Responsive testing





16\. Development Milestones

Phase 0 — Foundation Setup

Duration: 1 Week

Includes:

GitHub setup,

VS Code/Cursor setup,

Express setup,

Prisma setup,

PostgreSQL setup,

frontend setup.



Sprint 1 — Authentication \& Roles

Duration: 1 Week

Includes:

Clerk integration,

protected routes,

role management,

onboarding.



Sprint 2 — Company Setup \& Localization

Duration: 1 Week

Includes:

company setup,

localization,

country profiles.



Sprint 3 — Dashboard \& Reporting

Duration: 1 Week

Includes:

dashboards,

widgets,

reports.



Sprint 4 — Invoice Management

Duration: 1–2 Weeks

Includes:

invoices,

customers,

PDF generation,

recurring invoices.



Sprint 5 — Expense Management

Duration: 1 Week

Includes:

expenses,

uploads,

categorization.



Sprint 6 — Compliance Reminder Engine

Duration: 1 Week

Includes:

reminders,

notifications,

compliance workflows.



Sprint 7 — AI Features

Duration: 1–2 Weeks

Includes:

AI assistant,

AI documents,

AI usage tracking.



Sprint 8 — Billing \& Production Deployment

Duration: 1 Week

Includes:

Stripe integration,

subscription enforcement,

production deployment,

QA validation.



17\. Expected MVP Timeline

Estimated MVP delivery:

Approximately 8–10 Weeks

Depending on:

development speed,

testing complexity,

AI-assisted development efficiency.



18\. Future Scalability

Future roadmap may include:

OCR scanning,

payroll,

accounting integrations,

bank integrations,

mobile applications,

WhatsApp integrations,

advanced AI workflows,

advanced analytics.



19\. Conclusion

The Tetri Copilot platform shall remain:

lightweight,

AI-first,

mobile-first,

operationally simple,

scalable,

affordable,

modern,

easy to maintain.

The architecture intentionally prioritizes:

Express.js simplicity,

Prisma productivity,

PostgreSQL flexibility,

Ubuntu VPS affordability,

Cloudflare scalability,

AI-assisted development speed.

The final system should provide SMEs with:

practical operational management,

AI operational assistance,

affordable SaaS access,

multilingual workflows,

modern lightweight business operations.





