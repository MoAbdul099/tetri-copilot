# Slice 9.1 — Compliance Templates, Occurrences & Calendar

---

# 1. Document Information

| Field | Value |
|---------|---------|
| Slice ID | 9.1 |
| Slice Name | Compliance Templates, Occurrences & Calendar |
| Module | Compliance Management |
| Priority | High |
| Type | Core Business Module |
| Status | Planned |
| Estimated Complexity | Medium |
| Estimated Duration | 2–3 Weeks |
| Architecture Pattern | Template → Occurrence |
| Depends On | Slice 1, Slice 2, Slice 3, Slice 8, Slice 8.1 |
| Enables | Slice 9.2, Slice 9.3, Country Compliance Packs, AI Compliance Assistant |

---

# 2. Executive Summary

This slice establishes the compliance management foundation for Tetri Copilot.

The module introduces a scalable compliance architecture based on reusable compliance templates that automatically generate compliance occurrences according to configurable recurrence rules.

The module provides:

- Compliance jurisdictions
- Regulatory authorities
- Compliance categories
- Compliance template library
- Workspace compliance templates
- Compliance occurrence generation
- Compliance ownership
- Submission tracking
- Compliance evidence
- Activity history
- Compliance calendar
- Compliance pack foundation

The architecture is designed to support:

- UAE compliance
- Georgia compliance
- Saudi Arabia compliance
- Qatar compliance
- Additional jurisdictions

without future redesign.

This slice focuses exclusively on compliance definitions, compliance execution, and compliance visibility.

Reminder automation, escalations, dashboards, reporting, analytics, and AI functionality are delivered in future slices.

---

# 3. Business Objectives

The system shall:

- Prevent missed compliance obligations
- Centralize compliance management
- Improve accountability
- Maintain compliance evidence
- Track recurring obligations automatically
- Support multi-country compliance
- Support future compliance packs
- Prepare foundation for AI compliance services
- Improve audit readiness
- Reduce regulatory risk

---

# 4. Scope

---

## Included

### Jurisdiction Management

### Regulatory Authorities

### Compliance Categories

### Compliance Templates

### Workspace Compliance Templates

### Compliance Occurrences

### Recurrence Engine

### Compliance Ownership

### Submission Tracking

### Evidence Management

### Activity Timeline

### Compliance Calendar

### Compliance Pack Foundation

---

## Excluded

### Reminder Engine

Slice 9.2

### Escalation Engine

Slice 9.2

### Compliance Dashboard

Slice 9.3

### Compliance Reporting

Slice 9.3

### Compliance Analytics

Slice 9.3

### AI Compliance Recommendations

Future

### OCR Compliance Extraction

Future

### Government Integrations

Future

---

# 5. Architecture Overview

---

## Template → Occurrence Pattern

The compliance module follows a two-layer architecture.

---

### Layer 1 — Compliance Template

Represents the compliance definition.

Examples:

- VAT Return
- Corporate Tax Return
- Trade License Renewal
- ESR Filing
- UBO Declaration
- Annual Audit Submission

Templates are reusable blueprints.

---

### Layer 2 — Compliance Occurrence

Represents the actual actionable compliance event.

Example:

Template:

VAT Return

Occurrences:

- VAT Return — January 2027
- VAT Return — February 2027
- VAT Return — March 2027

Each occurrence contains:

- Due Date
- Status
- Owner
- Submission Data
- Evidence
- Activity History

Only occurrences are actionable.

---

# 6. Workspace Compliance Profile Integration

---

## Purpose

The compliance module shall consume compliance profile information introduced in Slice 8.1.

---

## Source Information

Workspace Compliance Profile

Examples:

- Jurisdiction
- VAT Registered
- VAT Registration Number
- Corporate Tax Registered
- Corporate Tax Number
- Trade License Number
- Trade License Expiry Date

---

## Usage

Used for:

- Compliance Pack recommendations
- Template recommendations
- Compliance onboarding
- Future AI compliance suggestions
- Future compliance health checks

---

# 7. User Stories

---

## US-9.1-001

As a Workspace Owner

I want reusable compliance templates

So recurring compliance obligations can be generated automatically.

---

## US-9.1-002

As a Compliance Manager

I want compliance occurrences generated automatically

So deadlines remain current.

---

## US-9.1-003

As a User

I want upcoming compliance obligations visible

So I can complete them on time.

---

## US-9.1-004

As a User

I want to upload compliance evidence

So compliance records remain complete.

---

## US-9.1-005

As a Compliance Officer

I want calendar visibility

So upcoming obligations are easy to manage.

---

# 8. Functional Requirements

---

# FR-1 Jurisdiction Management

---

## Purpose

Support multi-country compliance.

Every compliance template belongs to a jurisdiction.

---

## Examples

- UAE
- Georgia
- Saudi Arabia
- Qatar
- Bahrain
- Oman
- Kuwait
- United States
- United Kingdom

---

## Jurisdiction Fields

### Name

### Code

### ISO Code

### Default Currency

### Active Flag

### Notes

---

## Ownership

Managed by Super Admin only.

---

# FR-2 Regulatory Authorities

---

## Purpose

Maintain authority master data.

---

## Examples

### UAE

FTA

MOHRE

Ministry of Economy

---

### Georgia

Revenue Service

National Agency of Public Registry

---

### Saudi Arabia

ZATCA

Ministry of Commerce

---

## Authority Fields

### Name

### Jurisdiction

### Website

### Contact Information

### Notes

### Active Flag

---

# FR-3 Compliance Categories

---

## System Categories

- Tax
- Regulatory
- Licenses
- Employment
- Finance
- Internal

---

## Workspace Categories

Supported.

Examples:

- ESG
- Data Privacy
- Procurement
- Health & Safety
- Information Security

---

## Fields

### Name

### Description

### Color

### Active Flag

---

# FR-4 Global Compliance Templates

---

## Purpose

Managed by Super Admin.

Acts as master template library.

---

## Examples

### UAE VAT Return

### UAE Corporate Tax Return

### Trade License Renewal

### Georgia VAT Declaration

### Georgia Revenue Service Filing

---

## Actions

Create

Edit

Clone

Archive

Version

Activate

Deactivate

---

# FR-5 Compliance Packs

---

## Purpose

Bundle compliance templates.

---

## Examples

### UAE Core Compliance Pack

Contains:

- VAT Return
- Corporate Tax Return
- Trade License Renewal

---

### Georgia Core Compliance Pack

Contains:

- VAT Declaration
- Revenue Service Filing
- Property Tax Filing

---

### Saudi Core Compliance Pack

Contains:

- VAT Return
- Corporate Tax Filing
- Commercial Registration Renewal

---

# FR-6 Compliance Pack Recommendations

---

## Purpose

Recommend compliance packs during workspace setup.

---

## Example

Workspace:

```text
Jurisdiction = UAE
VAT Registered = Yes
```

System suggests:

```text
UAE Core Compliance Pack
```

---

## User Actions

Install Now

Install Later

Skip

---

## Note

Automatic installation is not required in Slice 9.1.

Only recommendation functionality is required.

---

# FR-7 Workspace Compliance Templates

---

## Purpose

Workspace-owned copies of global templates.

---

## Creation Sources

Install Pack

Install Template

Create Custom Template

Clone Template

---

## Workspace Customization

Allowed:

- Owner
- Backup Owner
- Priority
- Reminder Profile Reference
- Notes
- Activation

---

## Not Allowed

Modification of global master template.

---

# FR-8 Create Compliance Template

---

## Route

```text
/compliance/templates/new
```

---

## Required Fields

### Template Name

### Jurisdiction

### Category

### Authority

### Frequency

### Start Date

### Owner

---

## Optional Fields

### Description

### Backup Owner

### Department

### Priority

### Submission Method

### End Date

### Maximum Occurrences

### Notes

---

# FR-9 Recurrence Engine

---

## Supported Frequencies

### One Time

### Weekly

### Monthly

### Quarterly

### Semi-Annual

### Annual

### Custom

---

## Custom Rules

Every:

- X Days
- X Weeks
- X Months
- X Years

---

## Configuration

### Start Date

### End Date

### Maximum Occurrences

### Auto Generate

---

# FR-10 Occurrence Generation Engine

---

## Purpose

Generate actionable compliance events.

---

## Example

Template:

VAT Return

Frequency:

Monthly

Start Date:

31-Jan-2027

Generated:

- Jan 2027
- Feb 2027
- Mar 2027
- Apr 2027

---

## Inherited Values

Jurisdiction

Authority

Category

Owner

Priority

Description

---

# FR-11 Compliance Occurrences

---

## Route

```text
/compliance/occurrences
```

---

## Fields

### Name

### Due Date

### Status

### Owner

### Authority

### Priority

### Notes

### Reference Number

---

# FR-12 Status Management

Supported statuses:

### Scheduled

### In Progress

### Submitted

### Approved

### Completed

### Overdue

### Cancelled

### Archived

---

# FR-13 Ownership Management

---

## Primary Owner

Required.

---

## Backup Owner

Optional.

---

## Ownership Transfer

Supported.

Audit history maintained.

---

# FR-14 Submission Tracking

---

## Fields

### Submission Date

### Submitted By

### Authority Reference

### Internal Reference

### Notes

---

## Outcomes

Submitted

Accepted

Pending Review

Future:

Rejected

Resubmission Required

---

# FR-15 Evidence Management

Uses Slice 8.

---

## Supported Files

PDF

DOCX

XLSX

CSV

PNG

JPG

ZIP

---

## Operations

Upload

Preview

Download

Replace

Delete

---

# FR-16 Comments & Notes

Users may add comments.

Metadata:

Author

Created Date

Updated Date

---

# FR-17 Activity Timeline

Records:

Occurrence Generated

Status Changed

Owner Changed

Submission Recorded

Evidence Uploaded

Comment Added

Occurrence Archived

---

# FR-18 Overdue Detection

Rule:

Current Date > Due Date

AND

Status NOT Completed

AND

Status NOT Approved

Result:

Status = Overdue

---

# FR-19 Compliance Calendar

---

## Route

```text
/compliance/calendar
```

---

## Displays

Occurrences only.

Templates never appear.

---

## Views

Month

Week

Day

Agenda

---

## Filters

Jurisdiction

Category

Authority

Owner

Status

Priority

Department

Date Range

---

# FR-20 Search & Advanced Filtering

---

## Search

Occurrence Name

Template Name

Authority

Reference Number

Category

---

## Filters

Jurisdiction

Authority

Owner

Priority

Status

Due Date

Department

Date Range

---

# FR-21 Bulk Operations

Supported:

Change Status

Change Owner

Archive

Export

---

# 9. User Interface

## Screen 1

Compliance Dashboard Landing

```text
/compliance
```

---

## Screen 2

Compliance Templates

```text
/compliance/templates
```

---

## Screen 3

Template Details

---

## Screen 4

Compliance Occurrences

```text
/compliance/occurrences
```

---

## Screen 5

Occurrence Details

---

## Screen 6

Compliance Calendar

```text
/compliance/calendar
```

---

## Screen 7

Categories

---

## Screen 8

Authorities

---

## Screen 9

Compliance Pack Library

---

# 10. Permissions

Based on Slice 8.1 RBAC framework.

Permissions:

```text
compliance.view

compliance.manage

compliance.configure

compliance.admin
```

---

# 11. Database Entities

### compliance_jurisdictions

### compliance_authorities

### compliance_categories

### compliance_packs

### compliance_pack_templates

### system_compliance_templates

### workspace_compliance_templates

### compliance_occurrences

### compliance_submissions

### compliance_evidence

### compliance_comments

### compliance_activity_logs

---

# 12. API Endpoints

## Jurisdictions

GET /api/compliance/jurisdictions

---

## Authorities

GET /api/compliance/authorities

---

## Categories

GET /api/compliance/categories

POST /api/compliance/categories

---

## Packs

GET /api/compliance/packs

POST /api/compliance/packs/install

---

## Templates

GET /api/compliance/templates

POST /api/compliance/templates

PUT /api/compliance/templates/{id}

---

## Occurrences

GET /api/compliance/occurrences

GET /api/compliance/occurrences/{id}

PUT /api/compliance/occurrences/{id}

---

## Calendar

GET /api/compliance/calendar

GET /api/compliance/calendar/events

---

# 13. Acceptance Criteria

✓ Jurisdictions managed globally

✓ Authorities managed globally

✓ Categories configurable

✓ Compliance packs available

✓ Compliance pack recommendations work

✓ Templates installed successfully

✓ Workspace templates customizable

✓ Recurrence engine generates occurrences

✓ Occurrences managed independently

✓ Submission tracking operational

✓ Evidence management operational

✓ Activity history maintained

✓ Calendar operational

✓ Search and filtering operational

✓ Overdue detection operational

✓ RBAC permissions enforced

✓ Workspace isolation enforced

---

# 14. Future Enhancements

(Not Part of Slice 9.1)

- Notification & Reminder Engine (Slice 9.2)
- Escalation Engine (Slice 9.2)
- Compliance Dashboard (Slice 9.3)
- Compliance Reporting (Slice 9.3)
- Compliance Analytics (Slice 9.3)
- AI Compliance Assistant
- OCR Compliance Extraction
- Regulatory Change Monitoring
- Government Portal Integrations
- Compliance Risk Scoring
- Compliance Copilot Chat
- Automated Compliance Setup Wizard