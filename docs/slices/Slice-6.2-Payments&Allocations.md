# Tetri Copilot
# Slice 6.2 — Payments & Allocations

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

---

# 1. Slice Purpose

The purpose of this slice is to provide complete customer payment management and allocation functionality.

This slice enables businesses to record received payments, allocate those payments against invoices, manage partial settlements, handle customer credits, process advance payments, and maintain a complete payment history.

This slice becomes the financial settlement engine of the Accounts Receivable process.

No receivable dashboards, aging analysis, statements, collection workflows, or collection intelligence are included in this slice.

These capabilities will be delivered in:

- Slice 6.3 — Receivables, Statements & Collections

---

# 2. Business Goals

The solution shall enable SMEs to:

- Record customer payments accurately
- Reduce manual payment tracking
- Track invoice settlements
- Support partial invoice payments
- Support multiple invoice allocations
- Manage overpayments
- Manage customer credits
- Manage advance payments
- Maintain complete payment history
- Improve payment visibility
- Reduce reconciliation effort
- Ensure financial auditability

---

# 3. Scope

## Included

### Payment Management

- Record Payment
- Edit Payment
- View Payment
- Reverse Payment
- Void Payment

### Payment Allocation

- Single Invoice Allocation
- Multi Invoice Allocation
- Automatic Allocation
- Manual Allocation
- Allocation Reversal

### Invoice Settlement

- Partial Payments
- Full Payments
- Invoice Balance Updates
- Invoice Status Updates

### Customer Credits

- Overpayment Handling
- Credit Balance Tracking
- Credit Utilization

### Advance Payments

- Customer Deposits
- Advance Receipts
- Future Invoice Allocation

### Payment Attachments

- Deposit Slips
- Bank Advice
- Receipts
- Supporting Documents

### Payment Search

- Search
- Filtering
- Sorting

### Dashboard Widgets

- Recent Payments
- Payment Summary
- Payment Methods Summary

### Notifications

- Payment Recorded
- Payment Reversed
- Credit Created

### Audit Logging

Complete payment audit trail.

---

## Excluded

### Customer Statements

Moved to Slice 6.3

### Aging Analysis

Moved to Slice 6.3

### Collection Activities

Moved to Slice 6.3

### Receivable Dashboard

Moved to Slice 6.3

### Collection AI

Moved to Slice 6.3

---

# 4. User Roles

## Workspace Owner

Can:

- Record payments
- Edit payments
- Reverse payments
- Allocate payments
- Remove allocations
- Manage credits
- Manage advances
- View all payment history

---

## Workspace Admin

Can:

- Record payments
- Allocate payments
- View payment history
- Upload payment attachments

Based on permissions.

---

## User

Can:

- Record payments
- View assigned customer payments

Permissions controlled by role settings.

---

## Viewer

Read-only access.

Cannot:

- Record
- Edit
- Reverse
- Allocate

---

# 5. User Stories

## Record Payment

As an Accounts User

I want to record a customer payment

So that invoice balances are updated.

---

## Allocate Payment

As an Accounts User

I want to allocate one payment across several invoices

So that customer balances remain accurate.

---

## Process Partial Payment

As an Accounts User

I want to partially settle an invoice

So that outstanding balances remain visible.

---

## Handle Customer Credit

As an Accounts User

I want overpayments stored as credit

So they can be used later.

---

## Reverse Incorrect Payment

As an Accounts User

I want to reverse a payment

So that accounting records remain accurate.

---

# 6. Payment Lifecycle

Supported statuses:

## Draft

Payment entered but not confirmed.

Editable.

---

## Posted

Official payment record.

Affects balances.

---

## Allocated

Payment fully allocated.

---

## Partially Allocated

Payment partially allocated.

Remaining balance exists.

---

## Unallocated

Payment exists but not assigned.

---

## Reversed

Payment cancelled.

Audit trail required.

---

## Voided

Payment invalidated.

Authorization required.

---

# 7. Functional Requirements

# Module 6.2.1 Payment Recording

## Record Payment

Users shall be able to record received payments.

---

### Required Fields

Customer

Payment Date

Amount

Currency

Payment Method

---

### Optional Fields

Reference Number

Bank Reference

Cheque Number

Notes

Attachment

Deposit Date

Value Date

---

## Payment Header

Store:

- Payment Number
- Customer
- Customer ID
- Payment Date
- Amount
- Currency
- Method
- Reference
- Notes
- Status

---

## Payment Numbering

Auto-generated.

Examples:

PAY-000001

PAY-2026-000001

RCPT-000001

Rules:

- Unique
- Sequential
- Workspace Specific

---

# Module 6.2.2 Payment Methods

Support:

- Cash
- Bank Transfer
- Credit Card
- Debit Card
- Cheque
- Mobile Wallet
- POS
- Online Transfer
- Other

---

## Payment Method Configuration

Workspace Owner can:

- Add Method
- Disable Method
- Rename Method

System methods protected.

---

# Module 6.2.3 Payment Allocation Engine

## Allocation Purpose

Allocate payments against invoices.

---

## Single Invoice Allocation

Example:

Invoice = 1,000

Payment = 1,000

Result:

Invoice Paid

---

## Multiple Invoice Allocation

Example:

Payment = 2,500

Invoice A = 1,000

Invoice B = 1,500

Result:

Both Paid

---

## Partial Allocation

Example:

Payment = 1,000

Invoice = 2,000

Result:

Outstanding = 1,000

Status:

Partially Paid

---

## Unallocated Payment

Support payments without allocation.

Example:

Customer deposit.

Status:

Unallocated

---

## Allocation Removal

Authorized users may remove allocations.

Audit required.

---

# Module 6.2.4 Automatic Allocation

System can automatically allocate using:

Oldest Invoice First

---

## Configuration

Workspace configurable:

- Enable
- Disable

Default:

Manual Allocation

---

## Auto Allocation Logic

Priority:

1. Oldest Due Invoice
2. Oldest Invoice Date
3. Lowest Invoice Number

---

# Module 6.2.5 Manual Allocation

User selects:

- Invoice
- Amount

System validates:

- Available Balance
- Outstanding Balance

---

## Allocation Screen

Display:

Invoice Number

Invoice Date

Outstanding Amount

Due Date

Status

---

# Module 6.2.6 Partial Payments

Support unlimited partial payments.

Example:

Invoice = 10,000

Payment 1 = 3,000

Payment 2 = 4,000

Payment 3 = 3,000

Invoice becomes Paid.

---

## Invoice Status Changes

Outstanding > 0

Status:

Partially Paid

Outstanding = 0

Status:

Paid

---

# Module 6.2.7 Full Payments

When outstanding balance reaches zero:

Invoice automatically becomes:

Paid

---

## Payment History

Retain full settlement history.

---

# Module 6.2.8 Customer Credits

## Credit Creation

Created when:

Payment exceeds allocation.

Example:

Invoice = 1,000

Payment = 1,200

Credit = 200

---

## Credit Balance

Track:

- Original Credit
- Used Amount
- Remaining Balance

---

## Credit Application

Users may apply credit to future invoices.

---

## Credit History

Store:

- Creation
- Usage
- Remaining Balance

---

# Module 6.2.9 Advance Payments

## Advance Receipts

Allow payment before invoice exists.

Examples:

Project Deposit

Retainer

Prepayment

Security Deposit

---

## Advance Balance

Maintain customer advance account.

---

## Advance Allocation

Future invoices may consume advance balance.

---

## Advance History

Track:

- Creation
- Allocation
- Remaining Balance

---

# Module 6.2.10 Payment Reversal

## Reverse Payment

Authorized users only.

---

### Required

Reason

Comments

---

## Reversal Effects

System automatically:

- Remove allocations
- Restore balances
- Restore invoice status

---

## Audit Requirement

Mandatory.

---

# Module 6.2.11 Payment Attachments

Supported Files:

PDF

DOCX

PNG

JPG

JPEG

---

## Common Documents

Bank Advice

Deposit Slip

Receipt Copy

Transfer Confirmation

Cheque Scan

---

## Attachment Actions

Upload

Preview

Download

Delete

---

# Module 6.2.12 Payment Search

## Search By

Payment Number

Customer

Reference

Amount

Cheque Number

Bank Reference

---

## Filters

Status

Method

Customer

Date Range

Amount Range

Currency

---

## Sorting

Payment Date

Amount

Customer

Status

Created Date

---

# Module 6.2.13 Dashboard Widgets

## Payment Summary

Display:

Today's Payments

Monthly Payments

Unallocated Payments

Credits Created

---

## Recent Payments

Latest transactions.

---

## Payment Method Breakdown

Display:

Cash

Transfer

Card

Cheque

Other

---

# Module 6.2.14 Notifications

## Payment Recorded

Notify responsible users.

---

## Payment Reversed

Notify administrators.

---

## Credit Created

Notify finance users.

---

## Advance Balance Used

Notify responsible user.

---

# Module 6.2.15 Audit Logging

Track:

Payment Created

Payment Updated

Payment Reversed

Allocation Added

Allocation Removed

Credit Created

Credit Applied

Advance Created

Advance Applied

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

# 8. Validation Rules

## Customer Validation

Customer required.

Must exist.

Must belong to workspace.

---

## Amount Validation

Amount > 0

Maximum value configurable.

---

## Allocation Validation

Cannot exceed:

Available Balance

Cannot exceed:

Invoice Outstanding Balance

---

## Currency Validation

Supported currencies only.

---

## Reversal Validation

Cannot reverse already reversed payment.

---

# 9. Security Requirements

## Workspace Isolation

Payments visible only within workspace.

---

## RBAC Enforcement

All actions permission controlled.

---

## Financial Data Security

Payment data protected.

---

## Attachment Security

Secure file access.

Permission controlled.

---

# 10. API Requirements

## Payment APIs

POST /api/payments

GET /api/payments

GET /api/payments/{id}

PUT /api/payments/{id}

POST /api/payments/{id}/reverse

POST /api/payments/{id}/void

---

## Allocation APIs

POST /api/payments/{id}/allocate

DELETE /api/allocations/{id}

GET /api/payments/{id}/allocations

---

## Credit APIs

GET /api/customer-credits

POST /api/customer-credits/apply

---

## Advance APIs

GET /api/customer-advances

POST /api/customer-advances/apply

---

## Attachment APIs

POST /api/payments/{id}/attachments

DELETE /api/payment-attachments/{id}

---

# 11. Database Tables

## payments

Payment master records

---

## payment_allocations

Invoice allocations

---

## payment_status_history

Status changes

---

## payment_attachments

Payment documents

---

## customer_credits

Credit balances

---

## customer_credit_transactions

Credit activity

---

## customer_advances

Advance balances

---

## customer_advance_transactions

Advance activity

---

## payment_methods

Configured methods

---

## payment_number_sequences

Payment numbering

---

# 12. UI Pages

## Payment List

/workspace/payments

Features:

Search

Filters

Sorting

Pagination

---

## Record Payment

/workspace/payments/new

---

## Payment Details

/workspace/payments/{id}

---

## Edit Payment

/workspace/payments/{id}/edit

---

## Allocation Screen

/workspace/payments/{id}/allocate

---

## Credits

/workspace/customer-credits

---

## Advances

/workspace/customer-advances

---

# 13. UI Components

Required shadcn/ui components:

- DataTable
- Form
- Dialog
- Sheet
- Tabs
- Badge
- DropdownMenu
- Tooltip
- AlertDialog
- Select
- Combobox
- DatePicker
- Input
- Textarea
- Pagination
- Skeleton

---

# 14. Testing Requirements

## Unit Tests

Payment Validation

Allocation Logic

Credit Calculation

Advance Calculation

Status Updates

Reversal Logic

---

## Integration Tests

Payment Creation

Allocation

Partial Payment

Full Payment

Credit Application

Advance Allocation

Attachment Upload

Search

Filtering

---

## Security Tests

RBAC

Workspace Isolation

Authorization

Attachment Access

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

UI

Notifications

Audit Logging

Tests

Documentation

Demo Data

Deployment Verification

---

# 16. Deliverables Checklist

✓ Prisma Models

✓ Database Migration

✓ Payment Engine

✓ Allocation Engine

✓ Credit Engine

✓ Advance Engine

✓ Service Layer

✓ API Endpoints

✓ Validation Rules

✓ Payment UI

✓ Attachment Management

✓ Notifications

✓ Audit Logging

✓ Dashboard Widgets

✓ Unit Tests

✓ Integration Tests

✓ Documentation

✓ Deployment Validation

---

# 17. Acceptance Criteria

✓ User can record payment

✓ User can edit payment

✓ User can reverse payment

✓ Single allocation works

✓ Multi allocation works

✓ Partial payment works

✓ Full payment works

✓ Credits calculated correctly

✓ Credits can be applied

✓ Advances can be applied

✓ Invoice statuses update correctly

✓ Attachments managed correctly

✓ Search and filtering work

✓ Dashboard widgets work

✓ Notifications generated

✓ Audit logging complete

✓ Workspace isolation enforced

✓ Responsive UI completed

✓ Automated tests pass

✓ Production deployment successful

END OF SLICE 6.2