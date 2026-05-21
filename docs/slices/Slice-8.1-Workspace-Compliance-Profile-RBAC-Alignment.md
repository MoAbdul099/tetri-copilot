# Slice 8.1 — Workspace Compliance Profile & RBAC Alignment

## Purpose
Prepare the already-implemented platform foundation for Slice 9.1 Compliance Templates, Occurrences & Calendar.

## Included

### Workspace Compliance Profile
Add fields to company/workspace setup:

- jurisdiction_id
- tax_registration_number
- vat_registered
- vat_registration_number
- corporate_tax_registered
- corporate_tax_number
- trade_license_number
- trade_license_expiry_date

### RBAC Permission Additions
Add compliance permissions:

- compliance.view
- compliance.manage
- compliance.configure
- compliance.admin

### Navigation Preparation
Add placeholder permission checks for future compliance menu visibility.

### Database Migration
Create migration for new workspace/company compliance profile fields.

### Seed Data Preparation
Optional: seed initial jurisdictions:

- UAE
- Georgia
- Saudi Arabia
- Qatar

## Excluded
- Compliance templates
- Compliance occurrences
- Calendar
- Reminder engine
- Escalations
- Reports
- Dashboards

These remain in Slice 9.1, 9.2, and 9.3.

## Acceptance Criteria
- Workspace/company profile supports compliance-related fields
- Existing onboarding still works
- Existing company setup still works
- Existing RBAC still works
- Compliance permissions exist
- No compliance module functionality exposed yet
- Database migration runs safely