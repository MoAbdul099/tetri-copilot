Business Requirements Document (BRD)

Tetri Copilot

AI-First Lightweight SME Operating Assistant

Version 2.0



1\. Executive Summary

Tetri Copilot is a lightweight AI-first SaaS platform designed for SMEs, freelancers, startups, and small operational teams.

The platform focuses on:

operational simplicity,

AI-assisted workflows,

lightweight invoicing,

expense tracking,

compliance reminders,

multilingual operations,

simple dashboards,

fast onboarding,

affordable subscription pricing.

Unlike traditional ERP systems, Tetri Copilot is intentionally designed to:

avoid complexity,

reduce operational overhead,

improve usability,

support mobile-first operations,

leverage AI for daily business activities.

The MVP will initially target:

Georgia,

UAE,

Saudi Arabia,

Qatar, while remaining expandable to additional countries through configurable country profiles.



2\. Product Vision

The vision of Tetri Copilot is to become:

“The AI-powered operational assistant for SMEs.”

The platform shall provide:

operational organization,

lightweight financial workflows,

compliance reminders,

AI-powered guidance,

fast SaaS onboarding,

simple collaboration.

The system must remain:

modern,

responsive,

scalable,

cost-efficient,

cloud-native,

easy to maintain.



3\. Product Goals

3.1 Business Goals

The platform aims to:

launch fast as MVP,

maintain low operational cost,

minimize infrastructure management,

minimize DevOps complexity,

support subscription-based recurring revenue,

provide affordable pricing for SMEs,

support scalable GCC expansion.



3.2 Technical Goals

The platform architecture shall:

support multi-tenant SaaS operations,

support mobile-first UI,

support modular development,

support feature-by-feature expansion,

support AI integrations,

support multilingual operations,

support low-cost infrastructure.



3.3 Operational Goals

The system shall:

simplify SME operations,

reduce manual work,

provide AI guidance,

improve compliance tracking,

centralize lightweight operational workflows.



4\. Target Users

4.1 Primary Users

User Type

Description

SME Owners

Small business owners

Freelancers

Independent professionals

Small Teams

Teams requiring lightweight operations

Startup Founders

Startup operational management

Service Companies

Agencies \& consulting firms





4.2 Internal User Roles

Role

Description

Admin

Global platform administrator

Owner

Workspace/business owner

User

Operational user

Viewer

Read-only user





5\. Product Scope

5.1 Included in MVP

The MVP shall include:

Authentication \& user management

Workspace/company setup

Country profile configuration

Dashboard \& reporting

Invoice management

Expense management

Compliance reminders

AI assistant

AI document generation

Subscription \& billing

Admin management panel

Multilingual UI

Mobile-first responsive design



5.2 Future Roadmap

Future roadmap may include:

OCR receipt scanning,

payroll,

accounting integrations,

WhatsApp integrations,

mobile applications,

AI workflow automation,

bank integrations,

tax authority integrations,

advanced analytics.



6\. Technical Architecture

6.1 Updated Technical Stack

Frontend

Layer

Technology

Frontend Framework

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





Backend

Layer

Technology

Backend Framework

Express.js

Runtime

Node.js

API Architecture

REST APIs

ORM

Prisma ORM

Authentication Middleware

Clerk

Validation

Zod

Logging

Winston/Pino





Database

Layer

Technology

Database

PostgreSQL

Hosting

Ubuntu VPS

ORM

Prisma

Database Access

Prisma Client





Hosting \& Infrastructure

Layer

Technology

Frontend Hosting

Cloudflare Pages

Backend Hosting

Ubuntu VPS

Reverse Proxy

Nginx

SSL

Cloudflare SSL

DNS

Cloudflare DNS

File Storage

Cloudflare R2

CI/CD

GitHub Actions (Future)





AI \& SaaS Integrations

Service

Purpose

OpenAI APIs

AI assistant

Clerk

Authentication

Stripe

Billing \& subscriptions

Resend

Emails

PostHog

Analytics

Sentry

Error monitoring





6.2 Development Tools

Tool

Purpose

VS Code

Main IDE

Cursor IDE

AI-assisted development

Claude Code

AI coding assistant

GitHub

Version control

Postman/Thunder Client

API testing

Prisma Studio

Database inspection





6.3 Infrastructure Philosophy

The platform architecture shall prioritize:

simplicity,

low monthly cost,

maintainability,

fast MVP delivery,

minimal operational management.

The architecture intentionally avoids:

Kubernetes,

microservices,

unnecessary distributed systems,

expensive managed infrastructure.



7\. Development Methodology

7.1 Feature-Based Development

Development shall follow:

“One Feature at a Time” Approach

Each feature must be completed in the following order:

Prisma schema

Prisma migration

Database testing

Backend APIs

Business logic

Frontend UI

Responsive validation

Role validation

Integration testing

Refactoring

No feature shall move to production before full validation.



7.2 AI-Assisted Development Workflow

Claude Code and Cursor IDE shall be used to:

generate schema suggestions,

generate APIs,

review architecture,

improve UI structure,

identify edge cases,

optimize code quality,

accelerate development.

Developers shall still:

manually review generated code,

validate security,

validate business logic,

validate performance.



8\. Functional Requirements

8.1 Authentication \& User Management

The platform shall support:

signup/login,

session management,

invitation workflows,

role management,

protected routes,

workspace membership.



8.2 Workspace \& Company Setup

The platform shall support:

company profile setup,

localization settings,

country selection,

branding configuration,

tax settings.



8.3 Country Profiles

The system shall support configurable country profiles.

Each country profile may contain:

currencies,

default tax rules,

compliance calendar rules,

localization settings,

date formats,

timezone settings.

Initial countries:

Georgia,

UAE,

Saudi Arabia,

Qatar.

The admin panel shall allow future country configuration without code changes where possible.



8.4 Dashboards \& Reporting

The platform shall provide:

role-based dashboards,

invoice summaries,

expense summaries,

compliance widgets,

reminder widgets,

recent activity widgets,

lightweight operational reports.

Dashboards must be:

mobile responsive,

simple,

fast-loading,

visually modern.



8.5 Invoice Management

The invoice module shall support:

invoice creation,

invoice editing,

PDF generation,

recurring invoices,

customer management,

multilingual invoices,

invoice statuses,

overdue tracking.



8.6 Expense Management

The expense module shall support:

expense tracking,

receipt uploads,

expense categorization,

AI categorization suggestions,

expense reporting.



8.7 Compliance Reminder Engine

The reminder engine shall support:

compliance reminders,

invoice reminders,

recurring reminders,

dashboard notifications,

email notifications,

country-specific compliance calendars.



8.8 AI Assistant

The AI assistant shall support:

operational guidance,

invoice guidance,

compliance guidance,

AI suggestions,

AI quick actions,

AI usage tracking.

AI interactions must support:

multilingual operations,

usage limits,

subscription plan enforcement.



8.9 AI Document Generator

The system shall support AI-generated:

quotations,

NDAs,

agreements,

operational letters,

business templates.

Generated documents shall support:

multilingual templates,

PDF export,

editable drafts.



8.10 Subscription \& Billing

The platform shall support:

Stripe subscriptions,

upgrades,

downgrades,

subscription validation,

plan enforcement,

AI limits,

user limits.



8.11 Admin Panel

The admin panel shall support:

tenant management,

user analytics,

subscription analytics,

AI usage monitoring,

country management,

compliance configuration,

feature toggles,

operational monitoring.

The admin panel must remain:

lightweight,

simple,

operationally efficient.



9\. Database Requirements

9.1 Database Strategy

The system shall use:

PostgreSQL hosted on Ubuntu VPS,

Prisma ORM,

Prisma Client.

Database architecture shall support:

multi-tenancy,

scalability,

modular growth,

future integrations.



9.2 Prisma ORM Strategy

Prisma shall be used for:

schema management,

migrations,

type-safe database access,

relational mapping,

query abstraction.

Prisma Studio may be used for:

debugging,

development inspection,

seed validation.



9.3 Multi-Tenant Strategy

The platform shall use:

Workspace-Based Multi-Tenancy

Each operational table shall include:

workspace\_id.

Tenant isolation shall be enforced:

at API layer,

through Prisma queries,

through middleware validation.



10\. API Architecture

10.1 Backend Architecture

The backend shall follow:

RESTful APIs,

modular Express.js architecture,

route/controller/service separation.



10.2 Recommended Backend Structure

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





10.3 API Security

The backend shall support:

JWT/session validation,

protected routes,

role-based authorization,

request validation,

rate limiting,

error handling.



11\. Frontend Requirements

11.1 Frontend Philosophy

The frontend must remain:

modern,

minimal,

responsive,

mobile-first,

fast-loading.



11.2 UI Design Principles

The UI shall prioritize:

simplicity,

clean dashboards,

easy navigation,

accessible forms,

fast interactions,

lightweight components.



11.3 Responsive Requirements

The platform must fully support:

desktop,

tablets,

mobile phones.

Special focus shall be given to:

mobile navigation,

responsive forms,

dashboard responsiveness,

touch-friendly controls.



12\. File Storage Strategy

The system shall use:

Cloudflare R2 for files.

Supported uploads:

receipts,

logos,

PDFs,

generated documents.

The backend shall generate:

secure upload workflows,

signed URLs where applicable.



13\. Email \& Notification Strategy

The system shall use:

Resend email service.

Emails include:

invitations,

reminders,

invoice notifications,

verification emails,

operational notifications.



14\. AI Integration Strategy

The platform shall integrate with:

OpenAI APIs.

AI services include:

AI chat,

AI operational guidance,

AI categorization,

AI document generation.

AI usage shall be:

tracked,

logged,

limited by subscription plans.



15\. Deployment Strategy

15.1 Frontend Deployment

Frontend deployment shall use:

Cloudflare Pages.

Benefits:

low cost,

CDN acceleration,

automatic SSL,

fast global delivery.



15.2 Backend Deployment

Backend APIs shall be deployed to:

Ubuntu VPS.

Backend environment shall use:

Node.js,

Express.js,

PM2,

Nginx.



15.3 Database Hosting

PostgreSQL database shall initially run on:

Ubuntu VPS.

Benefits:

full database control,

lower operational cost,

simpler early-stage infrastructure.



16\. GitHub \& Source Control

The project shall use:

GitHub repositories,

feature branches,

pull requests.

Recommended branches:

main,

development,

feature/\*.



17\. Logging \& Monitoring

The system shall integrate:

Sentry,

backend logging,

API logging,

activity tracking,

audit logging.



18\. Analytics

The platform shall integrate:

PostHog.

Analytics include:

feature usage,

onboarding flows,

AI usage,

operational metrics.



19\. Security Requirements

The system shall support:

secure authentication,

secure APIs,

protected routes,

environment variable isolation,

passwordless external auth via Clerk,

HTTPS enforcement,

secure database access.



20\. Subscription Plans

Plan

Price

Users

Features

Free

$0

1

Limited invoices + AI

Starter

$4

1

Unlimited invoices

Professional

$8

Up to 5

AI + expenses

Business

$12

More than 5

Advanced collaboration





21\. Development Milestones

Phase 0 — Foundation Setup

Duration: 1 Week

Includes:

GitHub setup,

VS Code/Cursor setup,

Express backend setup,

Prisma setup,

PostgreSQL setup,

frontend setup,

initial deployment setup.



Sprint 1 — Authentication \& Roles

Duration: 1 Week

Includes:

Clerk integration,

protected routes,

role permissions,

onboarding.



Sprint 2 — Company Setup \& Localization

Duration: 1 Week

Includes:

company setup,

localization,

country profiles.



Sprint 3 — Dashboards \& Reporting

Duration: 1 Week

Includes:

dashboards,

widgets,

lightweight reports.



Sprint 4 — Invoice Management

Duration: 1–2 Weeks

Includes:

invoices,

PDF generation,

customers,

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

Stripe,

subscriptions,

production deployment,

QA,

stabilization.



22\. Expected MVP Timeline

Estimated MVP duration:

Approximately 8–10 Weeks

depending on:

development speed,

AI-assisted coding efficiency,

testing complexity.



23\. Development Best Practices

The project shall prioritize:

feature-by-feature development,

early testing,

modular architecture,

reusable components,

responsive validation,

security validation,

continuous refactoring.



24\. Developer Flexibility Clause

Developers may recommend alternate technologies if:

operational cost decreases,

maintainability improves,

scalability improves,

development speed improves,

stronger expertise exists.

However, all alternate technologies should preserve:

lightweight architecture,

maintainability,

scalability,

operational simplicity.



25\. Conclusion

Tetri Copilot shall remain:

lightweight,

AI-first,

mobile-first,

operationally simple,

scalable,

modern,

affordable,

fast to develop,

easy to maintain.

The architecture intentionally prioritizes:

Express.js simplicity,

Prisma productivity,

PostgreSQL flexibility,

Ubuntu VPS affordability,

Cloudflare scalability,

AI-assisted development efficiency.

The final platform should provide SMEs with:

practical operational management,

AI assistance,

affordable SaaS access,

simple user experience,

lightweight business workflows.





