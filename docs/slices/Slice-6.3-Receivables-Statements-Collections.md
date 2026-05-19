# Tetri Copilot
# Slice 6.3 — Receivables, Statements & Collections

Version: 1.0
Status: Approved
Module: Accounts Receivable
Parent Module: Invoices & Payments

Dependencies:
- Slice 1 — Authentication & Workspace Bootstrap
- Slice 2 — Workspace & Company Setup
- Slice 3 — Workspace User Management & Roles
- Slice 5 — Customers
- Slice 6.1 — Invoices Core
- Slice 6.2 — Payments & Allocations

---

# 1. Slice Purpose

The purpose of this slice is to provide complete Accounts Receivable visibility and collection management capabilities.

This slice enables businesses to monitor customer balances, outstanding invoices, overdue invoices, receivable aging, collection activities, customer statements, payment performance, and collection effectiveness.

This slice completes the Accounts Receivable lifecycle for Tetri Copilot.

The slice shall provide both operational and management-level visibility into receivables while remaining simple enough for SMEs.

---

# 2. Business Goals

The solution shall enable SMEs to:

- Monitor outstanding receivables
- Track customer balances
- Identify overdue invoices
- Reduce collection delays
- Improve cash collection performance
- Generate customer statements
- Manage collection activities
- Improve follow-up discipline
- Prioritize collection efforts
- Monitor aging exposure
- Improve cashflow visibility
- Reduce bad debt risk
- Leverage AI collection recommendations

---

# 3. Scope

## Included

### Receivables

- Customer Balance Management
- Outstanding Invoice Tracking
- Open Invoice Monitoring
- Receivable Visibility

### Aging Analysis

- Aging Buckets
- Aging Dashboard
- Aging Trends
- Customer Aging Analysis

### Statements

- Full Customer Statement
- Outstanding Statement
- Payment Statement
- Statement Export
- Statement Delivery

### Collections

- Collection Activities
- Follow-Up Scheduling
- Collection Notes
- Collection Workflow
- Collection Status Tracking

### Receivable Dashboards

- Receivable Summary
- Aging Summary
- Collection Summary
- Top Debtors
- Collection KPIs

### Notifications

- Due Date Alerts
- Overdue Alerts
- Follow-Up Reminders
- Statement Delivery Notifications

### AI Features

- Collection Recommendations
- Follow-Up Priorities
- Risk Indicators
- Natural Language Queries

### Audit Logging

Full receivable activity audit trail

---

## Excluded

### Cashflow Forecasting

Future Slice

### Predictive Collections

Future Slice

### Dunning Campaign Automation

Future Slice

### Customer Portal

Future Slice

### Online Collections

Future Slice

### Payment Gateway Collection

Future Slice

### Credit Scoring

Future Slice

---

# 4. User Roles

## Workspace Owner

Can:

- View all receivables
- Generate statements
- Manage collection activities
- View dashboards
- Configure reminders
- View collection analytics

---

## Workspace Admin

Can:

- Manage statements
- Manage collections
- Update collection activities
- View receivable dashboards

Based on permissions.

---

## User

Can:

- View assigned customer balances
- Generate statements
- Record collection notes
- Update collection status

According to permissions.

---

## Viewer

Read-only access.

Can:

- View receivables
- View statements
- View dashboards

Cannot modify data.

---

# 5. User Stories

## Customer Balance Monitoring

As a Finance User

I want to see customer balances

So that I know who owes money.

---

## Aging Review

As a Finance User

I want aging analysis

So that I can identify overdue customers.

---

## Customer Statements

As a Finance User

I want to generate statements

So that customers can review their balances.

---

## Collection Activities

As a Collection Officer

I want to record follow-up activities

So that collection efforts are tracked.

---

## Collection Prioritization

As a Manager

I want AI recommendations

So that collection resources focus on the highest priority accounts.

---

# 6. Functional Requirements

# Module 6.3.1 Customer Receivables

## Customer Balance

System shall calculate:

Total Invoiced

Minus Total Payments

Minus Credits Applied

Equals Outstanding Balance

---

## Balance Display

Display:

Current Balance

Overdue Balance

Credit Balance

Advance Balance

Open Invoice Count

Last Payment Date

Last Invoice Date

---

## Customer Receivable Profile

Display:

Customer Details

Receivable Summary

Invoice History

Payment History

Collection History

Statement History

---

# Module 6.3.2 Outstanding Invoice Tracking

## Open Invoices

Display invoices with:

Outstanding Amount > 0

---

## Outstanding Information

Invoice Number

Invoice Date

Due Date

Outstanding Amount

Days Outstanding

Status

Customer

Currency

---

## Invoice Drill Down

Users may navigate directly to invoice details.

---

# Module 6.3.3 Aging Analysis

## Aging Calculation

Calculate aging based on:

Current Date

Minus

Invoice Due Date

---

## Aging Buckets

Current

1–30 Days

31–60 Days

61–90 Days

91–120 Days

120+ Days

---

## Aging Views

### Customer Aging

Per customer

---

### Invoice Aging

Per invoice

---

### Summary Aging

Entire workspace

---

## Aging Dashboard

Display:

Total Current

Total Overdue

Total Aging

Aging Distribution

Top Delinquent Customers

---

## Aging Colors

Current

Green

1–30

Yellow

31–60

Orange

61–90

Red

90+

Dark Red

---

# Module 6.3.4 Customer Statements

## Statement Types

### Full Statement

Includes:

Invoices

Payments

Credits

Adjustments

Running Balance

---

### Outstanding Statement

Includes:

Open invoices only

---

### Payment Statement

Includes:

Payment activity only

---

## Statement Period

Support:

Current Month

Previous Month

Quarter

Year

Custom Range

---

## Statement Content

Company Information

Customer Information

Statement Period

Opening Balance

Transactions

Closing Balance

Outstanding Balance

---

## Statement Export

Formats:

PDF

Excel

CSV

---

## Statement Delivery

Send via email.

Track delivery history.

---

## Statement History

Store:

Date

User

Customer

Format

Delivery Status

---

# Module 6.3.5 Collection Activities

## Collection Activity Types

Phone Call

Email

Meeting

Reminder

Escalation

Site Visit

Other

---

## Collection Record

Store:

Date

Activity Type

Customer

Invoice

Notes

Outcome

Next Follow-Up Date

Responsible User

---

## Collection Notes

Support:

Rich Text

Attachments

Timestamp

User History

---

## Collection Attachments

Support:

PDF

DOCX

Images

Emails

Call Notes

---

# Module 6.3.6 Collection Workflow

## Collection Statuses

Pending

Contacted

Awaiting Response

Promise To Pay

Partially Settled

Escalated

Closed

---

## Follow-Up Scheduling

Users can schedule:

Date

Time

Responsible User

Reminder

---

## Collection Queue

Display:

Overdue Accounts

Upcoming Follow-Ups

Broken Promises

High Risk Customers

---

# Module 6.3.7 Promise To Pay Tracking

## Promise Information

Promised Amount

Promised Date

Customer Contact

Notes

---

## Promise Status

Pending

Fulfilled

Broken

Cancelled

---

## Promise Monitoring

Notify responsible users when:

Promise date arrives

Promise broken

Payment received

---

# Module 6.3.8 Receivable Dashboard

## Receivable Summary Widget

Display:

Total Receivables

Current Receivables

Overdue Receivables

Credit Balances

Advance Balances

---

## Collection Performance Widget

Display:

Collected This Month

Collection Rate

Average Collection Days

Invoices Collected

Outstanding Count

---

## Aging Summary Widget

Display bucket totals.

---

## Top Debtors Widget

Display:

Top 10 customers by outstanding balance.

---

## Upcoming Follow-Ups Widget

Display upcoming collection tasks.

---

# Module 6.3.9 AI Collection Assistant

## Collection Prioritization

AI recommends:

Customers requiring immediate attention

High-value overdue accounts

Frequently late payers

---

## Follow-Up Suggestions

Suggest:

Call

Email

Escalation

Meeting

Reminder

---

## Risk Indicators

Identify:

Repeated late payments

Growing balances

Broken promises

Long aging exposure

---

## Collection Summary Generation

Generate collection summaries automatically.

---

## Natural Language Queries

Examples:

Show overdue invoices above AED 10,000

Which customers owe the most money?

Show invoices overdue more than 90 days

Which customers promised payment this week?

Generate collection summary for ABC Trading

---

# Module 6.3.10 Notifications

## Due Date Notifications

Notify:

7 Days Before Due

3 Days Before Due

1 Day Before Due

---

## Overdue Notifications

Notify:

1 Day Overdue

7 Days Overdue

30 Days Overdue

60 Days Overdue

90 Days Overdue

---

## Follow-Up Notifications

Notify responsible users:

Upcoming Follow-Up

Missed Follow-Up

Promise Due

Promise Broken

---

## Statement Notifications

Statement Generated

Statement Sent

Statement Delivery Failure

---

# Module 6.3.11 Search & Filtering

## Search

Customer

Invoice

Statement

Collection Note

Reference

Outstanding Amount

---

## Filters

Customer

Status

Aging Bucket

Collector

Date Range

Currency

Outstanding Amount

---

## Sorting

Balance

Due Date

Customer

Aging Days

Status

Created Date

---

# Module 6.3.12 Audit Logging

Track:

Statement Generated

Statement Exported

Statement Sent

Collection Activity Created

Collection Activity Updated

Collection Status Changed

Promise Created

Promise Updated

Reminder Created

Reminder Updated

AI Recommendation Generated

---

## Audit Data

Store:

Timestamp

User

Action

Entity

Old Value

New Value

IP Address

---

# 7. Validation Rules

## Statement Validation

Customer required.

Date range required.

---

## Collection Validation

Activity type required.

Customer required.

Notes required.

---

## Promise Validation

Amount > 0

Future date required.

---

## Follow-Up Validation

Responsible user required.

Valid date required.

---

# 8. Security Requirements

## Workspace Isolation

Receivable information restricted to workspace.

---

## Customer Security

Users only view authorized customer data.

---

## Statement Security

Statement generation permission controlled.

---

## Collection Security

Collection activities permission controlled.

---

## Audit Protection

Audit logs immutable.

---

# 9. API Requirements

## Receivable APIs

GET /api/receivables

GET /api/receivables/customers

GET /api/receivables/customer/{id}

---

## Aging APIs

GET /api/aging

GET /api/aging/customer/{id}

GET /api/aging/summary

---

## Statement APIs

POST /api/statements/generate

GET /api/statements

GET /api/statements/{id}

POST /api/statements/{id}/send

GET /api/statements/{id}/download

---

## Collection APIs

POST /api/collections

PUT /api/collections/{id}

GET /api/collections

GET /api/collections/{id}

---

## Promise APIs

POST /api/promises

PUT /api/promises/{id}

GET /api/promises

---

## Dashboard APIs

GET /api/dashboard/receivables

GET /api/dashboard/aging

GET /api/dashboard/collections

---

# 10. Database Tables

## customer_balances

Receivable balances

---

## aging_snapshots

Aging calculations

---

## statement_runs

Generated statements

---

## statement_deliveries

Statement delivery history

---

## collection_activities

Collection actions

---

## collection_notes

Collection notes

---

## collection_attachments

Collection files

---

## collection_status_history

Status changes

---

## payment_promises

Promise-to-pay tracking

---

## collection_reminders

Follow-up reminders

---

## ai_collection_recommendations

Generated recommendations

---

# 11. UI Pages

## Receivables Dashboard

/workspace/receivables

---

## Aging Analysis

/workspace/receivables/aging

---

## Customer Receivable Profile

/workspace/receivables/customer/{id}

---

## Statements

/workspace/statements

---

## Statement Details

/workspace/statements/{id}

---

## Collections

/workspace/collections

---

## Collection Activity

/workspace/collections/{id}

---

## Promise To Pay

/workspace/collections/promises

---

# 12. UI Components

Required shadcn/ui components:

- DataTable
- Form
- Dialog
- Sheet
- Tabs
- Badge
- Card
- Calendar
- Tooltip
- Select
- Combobox
- DatePicker
- Input
- Textarea
- Pagination
- AlertDialog
- Skeleton

---

# 13. Reporting Requirements

## Aging Report

Customer Aging

Invoice Aging

Aging Summary

---

## Outstanding Receivable Report

Open balances

---

## Statement Report

Generated statements

---

## Collection Activity Report

Collection actions

---

## Promise To Pay Report

Promise tracking

---

## Top Debtors Report

Highest outstanding balances

---

# 14. Testing Requirements

## Unit Tests

Balance Calculations

Aging Logic

Statement Generation

Collection Status Logic

Promise Tracking

Reminder Generation

---

## Integration Tests

Statement Creation

Statement Delivery

Collection Workflow

Promise Workflow

Aging Calculations

Dashboard Metrics

Search

Filtering

---

## Security Tests

RBAC

Workspace Isolation

Statement Permissions

Collection Permissions

---

# 15. Claude Code Implementation Instructions

Implement as a complete vertical slice.

Must include:

Backend

Frontend

Database

Prisma Schema

Migration Files

Services

Repositories

REST APIs

Validation

Dashboard Widgets

Statement Engine

Collection Engine

Notification Engine

AI Collection Assistant

Audit Logging

Testing

Documentation

Demo Data

Deployment Verification

---

# 16. Deliverables Checklist

✓ Prisma Models

✓ Database Migration

✓ Receivable Engine

✓ Aging Engine

✓ Statement Engine

✓ Collection Workflow

✓ Promise-To-Pay Tracking

✓ Dashboard Widgets

✓ Notification System

✓ AI Collection Assistant

✓ Audit Logging

✓ API Endpoints

✓ UI Screens

✓ Reports

✓ Unit Tests

✓ Integration Tests

✓ Documentation

✓ Deployment Validation

---

# 17. Acceptance Criteria

✓ Customer balances calculated correctly

✓ Outstanding invoices displayed correctly

✓ Aging analysis accurate

✓ Aging buckets calculated correctly

✓ Statements generated successfully

✓ PDF statement export works

✓ Excel statement export works

✓ Statement emailing works

✓ Collection activities recorded successfully

✓ Collection workflow functions correctly

✓ Follow-up reminders generated

✓ Promise-to-pay tracking works

✓ Dashboard metrics accurate

✓ AI collection recommendations generated

✓ Search and filtering work

✓ Notifications generated correctly

✓ Audit logging complete

✓ Workspace isolation enforced

✓ Responsive UI completed

✓ Automated tests pass

✓ Production deployment successful

END OF SLICE 6.3