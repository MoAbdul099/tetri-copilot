# Slice-7.1-Expenses-Core.md

# Slice 7.1 — Expenses Core

## Overview

This slice delivers the foundational Expense Management capability for Tetri Copilot.

The objective of this slice is to provide businesses with the ability to record, organize, track, and manage operational expenses in a structured and auditable manner.

This slice intentionally focuses on the core expense lifecycle and excludes advanced functionality such as:

- Approval workflows
- Employee reimbursements
- Recurring expenses
- OCR extraction
- AI categorization
- Anomaly detection
- Dashboards and analytics
- Advanced notifications

Those capabilities will be delivered in future slices:

- Slice 7.2 — Expense Approvals & Reimbursements
- Slice 7.3 — Expense Insights, Automation & AI

The outcome of Slice 7.1 is a fully usable expense recording and tracking system suitable for small businesses from day one.

---

# Objectives

## Business Objectives

Provide organizations with the ability to:

- Record operational expenses
- Track company spending
- Organize expenses by category
- Associate expenses with suppliers
- Maintain supporting documentation
- Support tax and VAT recording
- Maintain audit history
- Search and retrieve expense records efficiently
- Prepare for future automation and reporting

---

## User Objectives

Allow users to:

- Create expenses quickly
- Upload supporting documents
- Categorize expenses consistently
- Search historical expenses
- View expense details
- Track expense status
- Maintain organized financial records

---

# Dependencies

## Required Slices

- Slice 1 — Authentication & User Identity
- Slice 2 — Workspace & Company Setup
- Slice 3 — Workspace User Management & Roles

---

## Future Integrations

Future slices may extend this module:

- Slice 7.2 — Expense Approvals & Reimbursements
- Slice 7.3 — Expense Insights, Automation & AI
- Slice 8 — Files & Attachments
- Slice 10 — Notifications

This slice must operate independently without requiring those future modules.

---

# User Roles

## Workspace Owner

Can:

- Create expenses
- Edit expenses
- Delete expenses
- View all expenses
- Manage categories
- Manage suppliers
- Upload attachments
- Export expenses

---

## Workspace Admin

Can:

- Create expenses
- Edit expenses
- View all expenses
- Manage categories
- Manage suppliers
- Upload attachments

Permissions configurable.

---

## User

Can:

- Create expenses
- Edit own expenses
- View own expenses
- Upload attachments

Cannot:

- Manage categories
- Manage suppliers
- Delete approved expenses

---

## Viewer

Read-only access.

Can:

- View authorized expenses

Cannot:

- Create
- Edit
- Delete

---

# Functional Modules

This slice contains:

1. Expense Categories
2. Suppliers & Vendors
3. Expense Records
4. Expense Attachments
5. Search & Filtering
6. Audit & Activity Tracking
7. Export Functionality

---

# Module 1 — Expense Categories

## Purpose

Expense categories provide structured classification of business spending.

Categories allow reporting consistency and support future accounting and analytics functionality.

---

## Features

### Create Category

Authorized users can create new categories.

Required fields:

| Field | Required |
|----------|----------|
| Category Name | Yes |
| Category Code | Yes |
| Status | Yes |

Optional fields:

| Field | Required |
|----------|----------|
| Description | No |
| Parent Category | No |

---

### Edit Category

Users can update:

- Name
- Code
- Description
- Parent Category
- Status

---

### Archive Category

Categories may be archived.

Archived categories:

- Cannot be selected for new expenses
- Remain available for historical records

---

### Restore Category

Archived categories may be restored.

---

## Category Hierarchy

Support parent-child structure.

Example:

Travel

- Flights
- Hotels
- Transportation
- Meals

Marketing

- Advertising
- Events
- Sponsorships

---

## Default Categories

New workspaces should automatically receive starter categories.

Examples:

- Office Expenses
- Utilities
- Rent
- Travel
- Transportation
- Accommodation
- Meals
- Marketing
- Professional Services
- Insurance
- Software
- Subscriptions
- Banking Charges
- Maintenance
- Miscellaneous

---

# Module 2 — Suppliers & Vendors

## Purpose

Track suppliers associated with expenses.

Supplier records reduce duplicate data entry and improve future reporting.

---

## Supplier Information

### Basic Information

| Field | Required |
|----------|----------|
| Supplier Name | Yes |
| Status | Yes |

---

### Additional Information

| Field | Required |
|----------|----------|
| Contact Person | No |
| Email | No |
| Phone | No |
| Tax Registration Number | No |
| Address | No |
| Country | No |
| Website | No |
| Notes | No |

---

## Features

### Create Supplier

Users can manually create suppliers.

---

### Quick Create Supplier

While creating expense:

User may create supplier without leaving expense screen.

---

### Edit Supplier

Authorized users can modify supplier information.

---

### Archive Supplier

Archived suppliers:

- Cannot be selected for new expenses
- Remain linked to historical expenses

---

### Supplier Search

Search by:

- Supplier Name
- Tax Number
- Email
- Phone

---

### Supplier Expense History

Supplier details screen should display:

- Total Expense Count
- Total Spend
- Latest Expense Date

Detailed analytics will be introduced in future slices.

---

# Module 3 — Expense Records

## Purpose

Store and manage company expenses.

This is the primary feature of this slice.

---

# Expense Types

Supported types:

### Company Expense

Examples:

- Rent
- Utilities
- Software
- Internet
- Marketing

---

### Employee Expense

Business expenses incurred by employees.

Approval and reimbursement functionality will be introduced later.

---

### Petty Cash Expense

Small operational expenses.

---

# Expense Statuses

Supported statuses:

| Status | Description |
|----------|----------|
| Draft | Being prepared |
| Submitted | Recorded and finalized |
| Cancelled | Invalid expense |
| Deleted | Soft deleted |

Future statuses will be introduced in Slice 7.2.

---

# Expense Numbering

Automatic numbering required.

Format:

EXP-YYYY-XXXXXX

Example:

EXP-2026-000001

Configuration options:

- Prefix
- Year inclusion
- Sequence length

Numbers must remain unique per workspace.

---

# Expense Information

## General Information

| Field | Required |
|----------|----------|
| Expense Number | Auto |
| Expense Date | Yes |
| Posting Date | Yes |
| Expense Type | Yes |
| Category | Yes |
| Supplier | No |
| Currency | Yes |
| Amount | Yes |
| Description | Yes |

---

## Tax Information

| Field | Required |
|----------|----------|
| Tax Rate | No |
| Tax Amount | No |
| Tax Included | No |

---

## Additional Information

| Field | Required |
|----------|----------|
| Department | No |
| Cost Center | No |
| Project | No |
| Reference Number | No |
| Notes | No |

---

# Multi-Currency Support

Expenses must support:

- Transaction Currency
- Workspace Base Currency
- Exchange Rate
- Converted Amount

The exchange rate may be:

- Entered manually
- Retrieved from future exchange-rate services

---

# Expense Creation

Users can:

- Create expense
- Save draft
- Submit expense
- Duplicate expense

---

# Expense Editing

Users can edit:

- Draft expenses
- Submitted expenses (based on permissions)

All modifications must be audited.

---

# Duplicate Expense Check

Basic validation only.

Warn user if:

- Same supplier
- Same date
- Same amount

Found within configurable period.

This is warning only.

Advanced duplicate detection will be added later.

---

# Module 4 — Expense Attachments

## Purpose

Allow supporting documents to be linked to expenses.

This is a lightweight attachment implementation until Slice 8.

---

## Supported File Types

- PDF
- JPG
- PNG
- JPEG

---

## Attachment Features

### Upload Attachment

Attach documents during expense creation.

---

### Multiple Attachments

Allow multiple files per expense.

---

### Preview Attachment

Preview directly within application.

---

### Download Attachment

Download original file.

---

### Remove Attachment

Users can remove attachments before final submission.

---

## Attachment Metadata

Store:

- File Name
- File Type
- File Size
- Upload Date
- Uploaded By

---

## Storage Strategy

Temporary implementation:

- Local filesystem
- S3-compatible storage
- Workspace-isolated storage

Future migration to Slice 8 architecture must be supported.

---

# Module 5 — Search & Filtering

## Global Expense Search

Search by:

- Expense Number
- Description
- Supplier
- Category
- Reference Number

---

## Advanced Filters

Filter by:

- Date Range
- Expense Type
- Category
- Supplier
- Amount Range
- Currency
- Status
- Created By

---

## Sorting

Support sorting by:

- Date
- Amount
- Supplier
- Category
- Created Date

Ascending and descending.

---

## Saved Filters

Not included in this slice.

Future enhancement.

---

# Module 6 — Audit & Activity Tracking

## Purpose

Maintain traceability and compliance.

---

## Audit Events

Track:

- Expense Created
- Expense Updated
- Expense Deleted
- Category Created
- Category Updated
- Supplier Created
- Supplier Updated
- Attachment Added
- Attachment Removed

---

## Audit Information

Store:

| Field |
|----------|
| User |
| Timestamp |
| Action |
| Entity |
| Previous Value |
| New Value |

---

## Activity Timeline

Expense detail screen should display:

- Created
- Updated
- Attachment Added
- Attachment Removed

Chronological order.

---

# Module 7 — Export Functionality

## Purpose

Allow users to export expense records.

---

## Supported Formats

### CSV

Required.

---

### Excel (XLSX)

Required.

---

### PDF

Optional for this slice.

May be deferred if required.

---

## Export Scope

Support exporting:

- Current search result
- Current filter result
- Selected records

---

# User Interface Requirements

## Expense List Screen

Display:

- Expense Number
- Date
- Supplier
- Category
- Amount
- Currency
- Status

Capabilities:

- Search
- Filter
- Sort
- Export
- Create Expense

---

## Expense Detail Screen

Display:

- Full expense information
- Attachments
- Audit timeline

Actions:

- Edit
- Duplicate
- Delete
- Export

---

## Expense Creation Screen

Sections:

1. General Information
2. Tax Information
3. Additional Information
4. Attachments

---

## Category Management Screen

Features:

- Create
- Edit
- Archive
- Restore
- Search

---

## Supplier Management Screen

Features:

- Create
- Edit
- Archive
- Search

---

# API Requirements

## Expense APIs

- Create Expense
- Update Expense
- Delete Expense
- Get Expense
- List Expenses
- Duplicate Expense

---

## Category APIs

- Create Category
- Update Category
- Archive Category
- List Categories

---

## Supplier APIs

- Create Supplier
- Update Supplier
- Archive Supplier
- List Suppliers

---

## Attachment APIs

- Upload Attachment
- Download Attachment
- Delete Attachment

---

# Database Entities

Core tables:

- expense_categories
- suppliers
- expenses
- expense_attachments
- expense_audit_logs

---

# Security Requirements

## Workspace Isolation

Users can only access data belonging to their workspace.

---

## Role-Based Access Control

All actions protected by RBAC.

---

## Attachment Security

Users cannot access files outside their workspace.

---

## Soft Delete

Expenses must be soft deleted.

Historical audit data preserved.

---

# Testing Requirements

## Unit Tests

Cover:

- Expense creation
- Expense update
- Category management
- Supplier management
- Attachment handling

---

## Integration Tests

Cover:

- Complete expense lifecycle
- Attachment upload process
- Export functionality

---

## Security Tests

Verify:

- Workspace isolation
- Permission enforcement
- File access controls

---

# Acceptance Criteria

## Functional Acceptance

✓ Users can create expenses

✓ Users can edit expenses

✓ Categories can be managed

✓ Suppliers can be managed

✓ Attachments can be uploaded

✓ Expense search works

✓ Expense exports work

✓ Audit trail records changes

✓ Multi-currency fields function correctly

---

## Non-Functional Acceptance

✓ Responsive UI

✓ Workspace isolation enforced

✓ Secure attachment storage

✓ Search results under 2 seconds

✓ Audit history preserved

✓ APIs protected through RBAC

✓ Production-ready deployment

---

# Deliverables

## Backend

- Expense APIs
- Category APIs
- Supplier APIs
- Attachment APIs
- Export APIs

---

## Database

- Expense schema
- Category schema
- Supplier schema
- Attachment schema
- Audit schema

---

## Frontend

- Expense list page
- Expense detail page
- Expense create/edit page
- Category management page
- Supplier management page

---

## Documentation

- User Guide
- Administrator Guide
- API Documentation
- Deployment Guide
- Test Evidence

---

End of Slice 7.1 — Expenses Core