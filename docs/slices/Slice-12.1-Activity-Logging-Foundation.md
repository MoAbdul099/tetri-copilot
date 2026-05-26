# Tetri Copilot
# Slice 12.1 — Activity Logging Foundation

Version: 2.0
Status: Approved for Development
Priority: High
Type: Platform Foundation
Architecture: Event-Driven Logging Framework

Dependencies:
- Slice 1 — Authentication & User Management
- Slice 2 — Workspace & Company Setup
- Slice 3 — Workspace User Management & Roles
- Slice 5 — Customers & Contacts
- Slice 6.1 — Invoices Core
- Slice 6.2 — Payments & Allocations
- Slice 7.1 — Expenses Core
- Slice 8 — Files & Attachments
- Slice 9.1 — Compliance Templates, Occurrences & Calendar
- Slice 10.1 — Notification Foundation
- Slice 11.1 — Dashboard Foundation

---

# 1. Overview

## Purpose

This slice establishes the centralized Activity Logging Foundation for Tetri Copilot.

The framework provides a complete history of operational activities occurring inside a workspace while introducing the platform-wide event architecture that future modules will rely on.

The objective is to answer questions such as:

- Who created this invoice?
- Who approved this expense?
- Who uploaded this file?
- When was this customer modified?
- What activities occurred yesterday?
- Which users were active this week?

The framework must support millions of events while remaining fast, searchable, scalable, and reusable.

---

# 2. Strategic Architecture Goal

## Why This Slice Exists

Historically many systems build activity logs separately from:

- Audit Logs
- Notifications
- Security Monitoring
- Reporting
- Analytics

This creates duplicated logic and inconsistent tracking.

Instead, Tetri Copilot shall introduce a unified event-driven architecture.

Every module publishes standardized business events.

Multiple consumers may react independently.

Examples:

Invoice Created Event

→ Activity Log Consumer
→ Audit Log Consumer (Future)
→ Notification Consumer (Future)
→ Security Consumer (Future)
→ Analytics Consumer (Future)
→ Integration/Webhook Consumer (Future)

One event.

Multiple outcomes.

No duplicated implementation.

---

# 3. Event-Driven Architecture Foundation

## Architectural Principle

Every business action generates a domain event.

Modules never write directly to activity tables.

Modules publish events.

Consumers process events.

---

## Event Flow

User Action

↓

Business Module

↓

Domain Event Published

↓

Event Bus

↓

Activity Log Consumer

↓

Activity Storage

---

Future Consumers

- Audit Engine
- Security Engine
- Notification Engine
- Analytics Engine
- Integration Engine
- AI Engine

---

# 4. Business Objectives

## Operational Transparency

Provide visibility into workspace activity.

## Accountability

Track user actions.

## Collaboration

Allow teams to understand record history.

## Troubleshooting

Provide investigation capability.

## Future Readiness

Serve as foundation for:

- Audit Logs
- Monitoring
- Alerts
- Analytics
- AI
- Integrations

---

# 5. Scope

## Included

### Event Framework

Central event architecture.

### Activity Engine

Activity processing service.

### Activity Storage

Database layer.

### Workspace Activity Feed

Global activity center.

### Entity Activity Timelines

History by record.

### Search

Activity search.

### Filtering

Activity filtering.

### Dashboard Widgets

Recent activities.

### Retention Policies

Cleanup management.

### Export Capability

CSV / Excel exports.

---

## Excluded

### Immutable Audit Trail

Slice 12.2

### Before/After Values

Slice 12.2

### Security Monitoring

Slice 12.3

### Suspicious Activity Detection

Slice 12.3

### Risk Scoring

Slice 12.3

### Alert Engine

Slice 12.3

---

# 6. Functional Requirements

---

# FR-12.1.1 Domain Event Framework

The platform shall provide a centralized event framework.

All business modules must publish standardized events.

Examples:

CustomerCreated

CustomerUpdated

InvoiceCreated

InvoiceIssued

InvoicePaid

ExpenseSubmitted

ExpenseApproved

FileUploaded

UserInvited

RoleChanged

ComplianceTaskCompleted

---

# FR-12.1.2 Event Bus

The system shall provide an internal event bus.

Responsibilities:

- Event registration
- Event publishing
- Event subscription
- Event delivery
- Event processing

---

## Design Goals

Loose coupling

Scalability

Maintainability

Future extensibility

---

# FR-12.1.3 Activity Consumer

The Activity Consumer shall subscribe to business events.

Responsibilities:

- Listen for events
- Transform events
- Create activity entries
- Store activity records

Modules never create activity records directly.

---

# FR-12.1.4 Standard Event Schema

Every event shall contain:

| Field | Description |
|----------|----------|
| Event ID | Unique identifier |
| Event Name | Business event |
| Event Version | Schema version |
| Workspace ID | Workspace |
| User ID | Actor |
| User Name | Actor name |
| Module | Source module |
| Entity Type | Record type |
| Entity ID | Record identifier |
| Reference Number | Business reference |
| Metadata | Additional data |
| Timestamp | Event timestamp |

---

# FR-12.1.5 Activity Event Categories

Supported categories:

Authentication

Workspace

Users

Customers

Invoices

Payments

Expenses

Compliance

Files

Notifications

Subscription

Billing

System

Security

Administration

---

# FR-12.1.6 Automatic Activity Generation

The system shall automatically generate activities from published events.

No module-specific logging logic shall be implemented.

This ensures consistency across the platform.

---

# FR-12.1.7 Workspace Activity Center

A dedicated Activity Center shall be available.

Navigation:

Workspace
→ Activity Center

---

## Display Information

User Avatar

User Name

Activity Description

Module

Category

Related Record

Timestamp

---

## Example Activities

Ahmed created invoice INV-0001

Sarah approved expense EXP-0045

Mohammed uploaded contract.pdf

Compliance filing VAT Return completed

User invited: finance@example.com

---

# FR-12.1.8 Entity Timelines

Major records shall expose activity history.

Supported entities:

Customer

Invoice

Payment

Expense

Compliance Task

File

Workspace

User

---

## Timeline Examples

Invoice

Created

Edited

Issued

Viewed

Paid

Voided

---

Expense

Submitted

Approved

Rejected

Reimbursed

---

# FR-12.1.9 Search Engine

Search by:

Keyword

User

Reference Number

Module

Category

Entity Type

Activity Description

---

# FR-12.1.10 Advanced Filtering

Filters:

Date Range

User

Module

Category

Entity Type

Event Type

Workspace

---

Supported date presets:

Today

Yesterday

Last 7 Days

Last 30 Days

Last 90 Days

Custom Range

---

# FR-12.1.11 Dashboard Integration

Dashboard widget:

Recent Activities

Display:

Latest 10 events

Quick access to Activity Center

Real-time refresh

---

# FR-12.1.12 User Activity View

Each user profile shall display:

My Activities

Recent Actions

Module Breakdown

Activity Summary

---

# FR-12.1.13 Permissions

Owner

Full access

Admin

Full access

Manager

Workspace activities

User

Limited visibility

Viewer

Read-only visibility

---

# FR-12.1.14 Visibility Rules

Users may only view activities related to records they can access.

Examples:

Restricted expense

→ hidden

Restricted customer

→ hidden

Restricted file

→ hidden

---

# FR-12.1.15 Export

Supported formats:

CSV

Excel

Filters must apply before export.

---

# FR-12.1.16 Retention Management

Default:

24 Months

Options:

6 Months

12 Months

24 Months

36 Months

Unlimited

---

Automatic cleanup jobs shall run periodically.

---

# FR-12.1.17 Event Replay Capability

The architecture shall support event replay.

Purpose:

Rebuild activity history

Recover failures

Future audit reconstruction

Future analytics rebuilding

---

This capability is foundational and may be activated in future slices.

---

# FR-12.1.18 Event Versioning

The framework shall support event versioning.

Purpose:

Backward compatibility

Schema evolution

Future integrations

---

Example:

InvoiceCreatedV1

InvoiceCreatedV2

---

# FR-12.1.19 Future Consumer Registration

The event bus shall allow future subscribers.

Examples:

AuditConsumer

SecurityConsumer

NotificationConsumer

AnalyticsConsumer

WebhookConsumer

AIConsumer

---

Without modifying existing modules.

---

# FR-12.1.20 API Layer

Endpoints:

GET /api/activity

GET /api/activity/{id}

GET /api/activity/entity/{entityId}

GET /api/activity/user/{userId}

GET /api/activity/export

GET /api/activity/recent

POST /internal/events

---

# 7. Database Design

## Table

activity_logs

---

Columns

id

workspace_id

event_id

event_name

event_version

user_id

user_name

module

category

entity_type

entity_id

reference_number

description

metadata_json

ip_address

user_agent

created_at

---

## Indexes

workspace_id

event_name

user_id

entity_type

entity_id

category

module

created_at

reference_number

---

# 8. Integration Requirements

## Slice 1

Authentication events

## Slice 3

User and role events

## Slice 5

Customer events

## Slice 6

Invoice and payment events

## Slice 7

Expense events

## Slice 8

File events

## Slice 9

Compliance events

## Slice 10

Notification events

## Slice 11

Dashboard widgets

---

# 9. Performance Requirements

Activity write latency

<100 ms

---

Activity search

<1 second

---

Activity feed loading

<500 ms

---

Dashboard widget loading

<300 ms

---

Supported volume

Minimum 10 Million records

Per workspace

---

# 10. Security Requirements

Workspace isolation

Permission enforcement

Secure APIs

Protected exports

Access validation

Encrypted transport

Secure metadata storage

---

# 11. Observability Requirements

Logging

Error tracking

Processing metrics

Consumer metrics

Failed event monitoring

Retry tracking

Dead-letter queue readiness

Future monitoring integration

---

# 12. Testing Requirements

## Unit Tests

Event publishing

Event consumption

Activity generation

Search

Filtering

Permissions

Exports

Retention

Versioning

---

## Integration Tests

Customer events

Invoice events

Expense events

File events

Compliance events

User events

---

## Performance Tests

High-volume event generation

Bulk exports

Large activity searches

Millions of activity records

---

## Security Tests

Workspace isolation

Permission validation

Unauthorized access attempts

---

# 13. Acceptance Criteria

✓ Event framework operational

✓ Event bus operational

✓ Activity consumer operational

✓ Standard event schema implemented

✓ Workspace Activity Center available

✓ Entity timelines available

✓ Search functional

✓ Filters functional

✓ Export functional

✓ Dashboard integration complete

✓ Permission model enforced

✓ Retention management operational

✓ Event versioning supported

✓ Future consumer registration supported

✓ Performance requirements achieved

✓ Automated tests passing

✓ Documentation completed

---

# 14. Forward Compatibility

This slice intentionally establishes infrastructure required for:

## Slice 12.2

Audit Logs & Compliance Trail

Capabilities:

- Immutable records
- Field-level changes
- Before/After values
- Compliance exports
- Diff viewer

---

## Slice 12.3

Monitoring, Alerts & Security Intelligence

Capabilities:

- Threat detection
- Suspicious activity monitoring
- Security alerts
- Risk scoring
- Investigation dashboard

---

## Future Platform Features

Workflow Automation

AI Insights

Business Analytics

Webhook Integrations

Third-Party Integrations

Public APIs

Real-Time Notifications

System Observability

---

END OF DOCUMENT

Slice 12.1 — Activity Logging Foundation
Version 2.0
Event-Driven Platform Architecture Edition