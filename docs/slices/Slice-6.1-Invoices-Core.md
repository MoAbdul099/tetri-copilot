# Tetri Copilot
# Slice 6.1 — Invoices Core

Version: 1.0
Status: Approved
Module: Accounts Receivable
Parent Slice: Invoices & Payments
Dependencies:
- Slice 1 — Authentication & Workspace Bootstrap
- Slice 2 — Workspace & Company Setup
- Slice 3 — Workspace User Management & Roles
- Slice 5 — Customers

---

# 1. Slice Purpose

The purpose of this slice is to provide a complete invoice lifecycle management capability that enables SMEs to create, manage, issue, deliver, print, and track customer invoices.

This slice establishes the official billing document foundation of Tetri Copilot and becomes the primary source of revenue transactions before payment processing begins.

No payment recording, allocations, receivables management, statements, aging analysis, or collections functionality shall exist in this slice.

Those capabilities will be implemented in:

- Slice 6.2 — Payments & Allocations
- Slice 6.3 — Receivables, Statements & Collections

---

# 2. Business Goals

The solution shall allow businesses to:

- Create professional invoices quickly
- Reduce manual invoice preparation
- Standardize invoice formats
- Generate branded invoice PDFs
- Send invoices directly to customers
- Track invoice lifecycle status
- Maintain invoice history
- Store supporting documents
- Improve invoicing accuracy
- Leverage AI assistance during invoice preparation

---

# 3. Scope

## Included

### Invoice Management

- Create Invoice
- Edit Invoice Draft
- Duplicate Invoice
- Delete Draft Invoice
- Issue Invoice
- Cancel Invoice
- Void Invoice

### Invoice Content

- Invoice Header
- Line Items
- Tax Calculation
- Discounts
- Notes
- Terms & Conditions

### Invoice Numbering

- Automatic Numbering
- Configurable Number Formats
- Sequential Number Management

### Invoice Documents

- PDF Generation
- PDF Download
- Print Invoice

### Invoice Delivery

- Send Invoice By Email
- Resend Invoice
- Delivery History

### Attachments

- Upload
- Download
- Delete

### Search & Filtering

- Global Search
- Filters
- Sorting

### Dashboard Widgets

- Invoice Summary
- Recent Invoices
- Upcoming Due Invoices

### AI Assistance

- Description Generation
- Validation Assistant
- Smart Recommendations

### Audit Logging

Complete invoice audit history.

---

## Excluded

### Payments

Moved to Slice 6.2

### Payment Allocations

Moved to Slice 6.2

### Customer Credits

Moved to Slice 6.2

### Advance Payments

Moved to Slice 6.2

### Receivables

Moved to Slice 6.3

### Statements

Moved to Slice 6.3

### Collections

Moved to Slice 6.3

### Aging Analysis

Moved to Slice 6.3

---

# 4. User Roles

## Workspace Owner

Can:

- Create invoices
- Edit invoices
- Delete drafts
- Issue invoices
- Cancel invoices
- Void invoices
- Send invoices
- Configure numbering settings
- Manage invoice templates

---

## Workspace Admin

Can:

- Create invoices
- Edit invoices
- Issue invoices
- Send invoices
- Download PDFs
- Manage attachments

Based on assigned permissions.

---

## User

Can:

- Create invoices
- Edit own invoices
- View permitted invoices

Permissions controlled by role configuration.

---

## Viewer

Read-only access.

Cannot:

- Create
- Edit
- Delete
- Issue
- Send

---

# 5. User Stories

## Invoice Creation

As a User

I want to create an invoice

So that I can bill a customer.

---

## Invoice Delivery

As a User

I want to email an invoice

So that the customer receives it immediately.

---

## PDF Generation

As a User

I want to download a professional PDF

So that I can print or share it.

---

## Invoice Search

As a User

I want to search invoices

So that I can quickly find billing records.

---

## Invoice Validation

As a User

I want AI to review invoice data

So that I avoid mistakes.

---

# 6. Invoice Lifecycle

Supported statuses:

## Draft

Invoice is under preparation.

Editable.

---

## Issued

Invoice officially created.

Number becomes locked.

Financial content becomes locked.

---

## Sent

Invoice delivered to customer.

---

## Cancelled

Invoice cancelled before any payment activity.

---

## Void

Invoice invalidated.

Requires authorization.

Audit trail mandatory.

---

# 7. Functional Requirements

# Module 6.1.1 Invoice Creation

## Create Invoice

Users shall be able to create invoices.

---

### Required Fields

Customer

Invoice Date

Due Date

Currency

Minimum one line item

---

### Optional Fields

Reference Number

Purchase Order Number

Customer Reference

Customer Contact

Notes

Terms

Attachments

Internal Comments

---

## Invoice Header

Store:

- Invoice Number
- Customer Name
- Customer ID
- Billing Address
- Tax Registration Number
- Customer Contact
- Invoice Date
- Due Date
- Currency
- Reference Number
- Purchase Order Number

---

## Invoice Line Items

Support unlimited lines.

Fields:

### Description

Required

### Quantity

Required

Positive decimal

### Unit Price

Required

Positive decimal

### Discount %

Optional

### Tax %

Optional

### Tax Amount

System Calculated

### Line Total

System Calculated

---

## Calculations

System shall automatically calculate:

Subtotal

Less Discount

Plus Tax

Equals Grand Total

Calculations must update instantly.

---

# Module 6.1.2 Invoice Numbering

## Automatic Number Generation

System generates numbers automatically.

Examples:

INV-000001

INV-2026-000001

RB-INV-000001

---

## Configuration Options

Workspace Owner can configure:

Prefix

Suffix

Year

Month

Sequence Length

Starting Number

---

## Rules

Must be:

Unique

Sequential

Workspace-specific

Immutable after issue

No duplicates permitted

---

# Module 6.1.3 Invoice Templates

## Standard Template

System default template.

---

## Workspace Branding

Apply:

Company Logo

Company Name

Brand Colors

Footer Information

Contact Information

Tax Registration Number

---

## Future Expansion

Multiple templates supported later.

Current slice requires one active template.

---

# Module 6.1.4 Invoice PDF

## Generate PDF

System generates professional invoice PDF.

---

### PDF Contents

Company Logo

Company Details

Customer Details

Invoice Number

Issue Date

Due Date

Reference Number

Line Items

Tax Breakdown

Totals

Notes

Terms

Footer

---

## PDF Actions

Preview

Download

Print

---

## PDF Storage

Generated dynamically.

Optional caching supported.

---

# Module 6.1.5 Invoice Delivery

## Send By Email

Users may email invoices directly.

---

### Email Content

Invoice Summary

Invoice Number

Amount

Due Date

PDF Attachment

Company Signature

---

## Recipient Options

Primary Email

CC

BCC

---

## Resend Invoice

Users may resend any issued invoice.

---

## Delivery Log

Store:

Recipient

Date

User

Status

Error Message

Delivery Method

---

# Module 6.1.6 Attachments

## Upload Attachment

Support:

PDF

DOCX

XLSX

PNG

JPG

JPEG

---

## Common Attachment Types

Purchase Order

Contract

Delivery Note

Agreement

Supporting Documents

---

## Attachment Security

Workspace isolated

Permission controlled

Virus scanning ready

---

## Attachment Actions

Upload

Preview

Download

Delete

---

# Module 6.1.7 Search & Filtering

## Global Search

Search by:

Invoice Number

Customer Name

Customer Code

Reference Number

PO Number

Amount

---

## Filters

Status

Customer

Date Range

Due Date

Currency

Created By

---

## Sorting

Invoice Date

Due Date

Amount

Customer

Status

Created Date

---

# Module 6.1.8 Invoice Dashboard Widgets

## Invoice Summary Widget

Display:

Draft

Issued

Sent

Cancelled

Void

---

## Recent Invoices Widget

Latest invoices.

---

## Upcoming Due Invoices Widget

Due within:

7 Days

14 Days

30 Days

---

# Module 6.1.9 AI Invoice Assistant

## AI Description Generator

User enters:

Website Development

AI suggests:

Professional website design, development, testing and deployment services.

---

## AI Validation Assistant

Detect:

Missing Customer

Missing Due Date

Missing Description

Missing Amount

Suspicious Values

Duplicate Content

---

## AI Smart Suggestions

Suggest:

Invoice Terms

Descriptions

References

Payment Terms

---

## AI Natural Language Assistance

Examples:

Create invoice for ABC Trading

Generate consulting service description

Suggest professional wording

---

# 8. Notifications

## Invoice Issued

Notify creator.

---

## Invoice Sent

Notify responsible users.

---

## Invoice Cancelled

Notify management.

---

## Invoice Voided

Notify authorized users.

---

# 9. Audit Logging

Track:

Invoice Created

Invoice Updated

Invoice Deleted

Invoice Issued

Invoice Cancelled

Invoice Voided

Invoice Sent

Attachment Uploaded

Attachment Deleted

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

# 10. Validation Rules

## Customer Validation

Customer required.

Must exist.

Must belong to workspace.

---

## Date Validation

Due Date >= Invoice Date

---

## Amount Validation

Amounts > 0

---

## Currency Validation

Must be supported currency.

---

## Line Validation

Minimum one line item required.

---

# 11. Security Requirements

## Workspace Isolation

Users access only workspace invoices.

---

## RBAC Enforcement

All actions permission controlled.

---

## Data Protection

Secure storage

Secure APIs

Authorization checks

---

## File Security

Permission controlled downloads.

---

# 12. API Requirements

## Invoice APIs

POST /api/invoices

GET /api/invoices

GET /api/invoices/{id}

PUT /api/invoices/{id}

DELETE /api/invoices/{id}

POST /api/invoices/{id}/issue

POST /api/invoices/{id}/cancel

POST /api/invoices/{id}/void

POST /api/invoices/{id}/duplicate

POST /api/invoices/{id}/send

---

## PDF APIs

GET /api/invoices/{id}/pdf

---

## Attachment APIs

POST /api/invoices/{id}/attachments

GET /api/invoices/{id}/attachments

DELETE /api/attachments/{id}

---

# 13. Database Tables

## invoices

Master invoice record

---

## invoice_items

Line items

---

## invoice_status_history

Status transitions

---

## invoice_delivery_logs

Delivery history

---

## invoice_attachments

Attachment metadata

---

## invoice_number_sequences

Workspace numbering configuration

---

# 14. UI Pages

## Invoice List

/workspace/invoices

Features:

Search

Filters

Sorting

Pagination

Bulk Actions

---

## Create Invoice

/workspace/invoices/new

---

## Invoice Details

/workspace/invoices/{id}

---

## Edit Invoice

/workspace/invoices/{id}/edit

---

## Invoice PDF Preview

/workspace/invoices/{id}/preview

---

# 15. UI Components

Required shadcn/ui components:

- DataTable
- Form
- Dialog
- Sheet
- Tabs
- Badge
- DropdownMenu
- Tooltip
- DatePicker
- Select
- Combobox
- Textarea
- AlertDialog
- Pagination
- Skeleton

---

# 16. Testing Requirements

## Unit Tests

Invoice Calculations

Tax Calculation

Number Generation

Validation Rules

Status Changes

---

## Integration Tests

Invoice Creation

Invoice Editing

PDF Generation

Email Delivery

Attachment Upload

Search

Filtering

---

## Security Tests

RBAC

Workspace Isolation

Authorization Checks

---

# 17. Claude Code Implementation Instructions

Implement as a complete vertical slice.

Must include:

Backend

Frontend

Database

Prisma Schema

Validation

API Layer

Services

UI

Testing

Documentation

Seed Data

Demo Data

Migration Files

Deployment Verification

---

# 18. Deliverables Checklist

✓ Prisma Models

✓ Database Migration

✓ Repository Layer

✓ Service Layer

✓ API Endpoints

✓ DTO Validation

✓ Invoice UI

✓ PDF Generation

✓ Email Delivery

✓ Attachment Management

✓ Dashboard Widgets

✓ AI Assistant

✓ Audit Logging

✓ Notifications

✓ Unit Tests

✓ Integration Tests

✓ Documentation

✓ Deployment Validation

---

# 19. Acceptance Criteria

✓ User can create invoice

✓ User can edit draft invoice

✓ User can duplicate invoice

✓ User can issue invoice

✓ User can cancel invoice

✓ User can void invoice

✓ Invoice numbering works correctly

✓ Invoice PDF generates correctly

✓ Invoice email delivery works

✓ Delivery history captured

✓ Attachments managed successfully

✓ Search and filtering operate correctly

✓ AI validation works

✓ Audit logging complete

✓ Notifications generated

✓ Workspace isolation enforced

✓ Responsive UI completed

✓ Automated tests pass

✓ Production deployment successful

END OF SLICE 6.1