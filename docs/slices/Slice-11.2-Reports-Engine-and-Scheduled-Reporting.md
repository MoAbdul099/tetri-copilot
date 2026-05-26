# Slice 11.2 — Reports Engine & Scheduled Reporting

**Project:** Tetri Copilot  
**Module:** Workspace Dashboard, Reports & Analytics  
**Slice ID:** 11.2  
**Version:** 1.0  
**Status:** Planned  
**Priority:** High  
**Type:** Reporting / Exporting / Scheduled Delivery  
**Estimated Complexity:** Medium–High  
**Dependencies:** Slices 1–11.1  
**Primary Users:** Workspace Owner, Workspace Admin, User, Viewer  
**Recommended Implementation:** After Slice 11.1 Dashboard Foundation & KPI Center  

---

# 1. Purpose

Slice 11.2 introduces the reporting engine for Tetri Copilot.

After the Workspace Dashboard and KPI Center are available in Slice 11.1, users need the ability to generate structured business reports, filter them, export them, save report configurations, and schedule recurring delivery.

This slice provides a reusable reporting foundation that can support current and future modules, including invoices, payments, expenses, compliance, customers, files, notifications, subscriptions, and future AI analytics.

The goal is to allow workspace users to answer business questions without manually extracting data from multiple screens.

Examples:

- What invoices are overdue?
- Which customers have outstanding balances?
- What expenses were recorded this month?
- Which compliance obligations are due soon?
- What payments were collected this quarter?
- Which reports should be sent weekly to the owner?

---

# 2. Business Objectives

This slice enables Tetri Copilot to:

- Provide structured business reports
- Reduce manual spreadsheet work
- Improve visibility into financial and operational data
- Allow users to export reports for external use
- Support recurring scheduled reporting
- Enable workspace owners to monitor business status regularly
- Prepare the foundation for future AI report explanations
- Improve compliance and audit readiness
- Support role-based access to sensitive business data

---

# 3. Scope

## 3.1 Included in This Slice

This slice includes:

- Reports landing page
- Reports catalog
- Standard reports
- Report execution engine
- Report filters
- Report sorting
- Report grouping where needed
- Report table views
- Report detail views
- Saved reports
- Shared reports
- Report export to CSV
- Report export to Excel
- Report export to PDF
- Scheduled reports
- Scheduled report email delivery
- Scheduled report in-app notification delivery
- Report permission model
- Report audit logs
- Report error handling
- Report performance optimization

---

## 3.2 Excluded from This Slice

The following are excluded and should be handled later:

### Slice 11.3

- Forecasting
- Predictive analytics
- AI insights
- AI report explanations
- Business health score
- Advanced anomaly detection

### Future AI Slice

- Natural language report generation
- Ask AI to build reports
- AI-based report recommendations

### Future Integration Slice

- Power BI integration
- Google Sheets live sync
- Looker Studio integration
- External accounting system integrations

---

# 4. Key Recommendation

Slice 11.2 should not start with a complex custom report builder.

Recommended approach:

1. Start with a strong standard reports catalog.
2. Add flexible filters and exports.
3. Add saved report views.
4. Add scheduled delivery.
5. Keep full custom report builder for a later enhancement.

Reason:

A full custom report builder can become heavy and delay business value. Standard reports will cover most early user needs and are easier to test, secure, and optimize.

---

# 5. User Roles and Access

| Role | Access Level |
|---|---|
| Owner | Full access to all workspace reports |
| Workspace Admin | Full or configurable access |
| User | Access based on assigned permissions |
| Viewer | Read-only access to allowed reports |
| System Admin | Support access only, subject to platform rules |

---

# 6. Reports Landing Page

## 6.1 Purpose

The Reports page is the central location for all available workspace reports.

Path example:

```text
/workspace/reports
```

---

## 6.2 Page Sections

The Reports landing page should include:

- Page title
- Search reports field
- Report category filters
- Favorite reports
- Recently used reports
- Standard reports catalog
- Saved reports
- Scheduled reports shortcut

---

## 6.3 Report Categories

Recommended categories:

- Financial Reports
- Receivables Reports
- Payments Reports
- Expenses Reports
- Customers Reports
- Compliance Reports
- Activity Reports
- Subscription & Usage Reports

---

# 7. Reports Catalog

## 7.1 Purpose

The Reports Catalog lists all standard reports available to the workspace.

Each report should include:

- Report name
- Report description
- Category
- Required permission
- Last generated date
- Favorite option
- Open report action

---

## 7.2 Example Report Card

```text
Outstanding Receivables Report
Shows all unpaid invoices grouped by customer and due status.
Category: Receivables
Actions: Open | Favorite | Schedule
```

---

# 8. Standard Reports

## 8.1 Financial Summary Report

Purpose:

Provide a high-level financial summary for a selected period.

Includes:

- Revenue
- Collections
- Expenses
- Net position
- Invoice count
- Payment count
- Expense count

Filters:

- Date range
- Currency
- Customer

Export:

- PDF
- Excel
- CSV

---

## 8.2 Revenue Report

Purpose:

Show invoice-based revenue by period.

Includes:

- Invoice number
- Customer
- Invoice date
- Due date
- Status
- Currency
- Subtotal
- Tax
- Total amount

Filters:

- Date range
- Customer
- Invoice status
- Currency

Grouping:

- By customer
- By month
- By status

---

## 8.3 Collections Report

Purpose:

Show payments received during a selected period.

Includes:

- Payment reference
- Customer
- Payment date
- Payment method
- Invoice reference
- Amount received
- Currency
- Allocation status

Filters:

- Date range
- Customer
- Payment method
- Currency

---

## 8.4 Outstanding Receivables Report

Purpose:

Show unpaid or partially paid invoices.

Includes:

- Customer
- Invoice number
- Invoice date
- Due date
- Days overdue
- Invoice amount
- Paid amount
- Outstanding amount
- Status

Filters:

- Customer
- Due date range
- Overdue only
- Status
- Currency

---

## 8.5 Aging Report

Purpose:

Show receivables grouped by aging bucket.

Buckets:

```text
Current
1–30 Days
31–60 Days
61–90 Days
90+ Days
```

Includes:

- Customer
- Current balance
- 1–30 days
- 31–60 days
- 61–90 days
- 90+ days
- Total outstanding

Filters:

- Customer
- Currency
- As-of date

Recommendation:

This should be one of the most important reports for early business value.

---

## 8.6 Expense Report

Purpose:

Show recorded expenses for a selected period.

Includes:

- Expense date
- Vendor
- Category
- Description
- Amount
- Currency
- Status
- Created by
- Attachment indicator

Filters:

- Date range
- Category
- Status
- User
- Currency

---

## 8.7 Expense Category Summary Report

Purpose:

Show expense totals by category.

Includes:

- Category
- Expense count
- Total amount
- Percentage of total expenses

Filters:

- Date range
- Category
- Currency

Visualization:

- Table
- Optional chart in UI

---

## 8.8 Customer Balance Report

Purpose:

Show balances by customer.

Includes:

- Customer name
- Total invoices
- Total paid
- Total outstanding
- Overdue amount
- Last payment date

Filters:

- Customer
- Balance status
- Currency

---

## 8.9 Customer Activity Report

Purpose:

Show customer-related activity.

Includes:

- Customer created
- Invoice created
- Payment recorded
- Communication or reminder activity
- Last activity date

Filters:

- Customer
- Date range
- Activity type

---

## 8.10 Compliance Status Report

Purpose:

Show compliance obligations and their current status.

Includes:

- Obligation name
- Country profile
- Due date
- Status
- Assigned user
- Completion date
- Days remaining or overdue

Filters:

- Date range
- Status
- Assigned user
- Compliance type

---

## 8.11 Upcoming Compliance Obligations Report

Purpose:

Show obligations due soon.

Includes:

- Obligation name
- Due date
- Priority
- Assigned user
- Reminder status

Filters:

- Due in next 7 days
- Due in next 30 days
- Due in custom range
- Assigned user

---

## 8.12 User Activity Report

Purpose:

Show key workspace user activities.

Includes:

- User
- Action
- Module
- Timestamp
- Related record

Filters:

- User
- Module
- Action type
- Date range

Security note:

This report should be restricted to Owner and Workspace Admin by default.

---

## 8.13 Notifications Report

Purpose:

Show notifications and delivery status.

Includes:

- Notification title
- Type
- Recipient
- Status
- Sent date
- Read date
- Related record

Filters:

- Type
- Recipient
- Status
- Date range

---

## 8.14 Subscription Usage Report

Purpose:

Show workspace plan usage.

Includes:

- Current plan
- Users used
- User limit
- Storage used
- Storage limit
- Feature usage where applicable

Filters:

- Period

---

# 9. Report Execution Engine

## 9.1 Purpose

The report execution engine is a reusable backend service that runs reports based on report definition, filters, permissions, and workspace context.

---

## 9.2 Core Responsibilities

The report engine should:

- Validate report code
- Validate user permission
- Validate workspace access
- Validate filters
- Apply tenant isolation
- Execute report query
- Apply sorting
- Apply pagination
- Return report metadata
- Return report results
- Log report execution

---

## 9.3 Report Definition Model

Each report should be defined using a structured configuration.

Example fields:

- report_code
- report_name
- category
- description
- required_permission
- supported_filters
- default_sort
- supported_exports
- query_handler
- is_active

---

# 10. Report Viewer Page

## 10.1 Purpose

The Report Viewer displays report results in an interactive table format.

---

## 10.2 Page Components

The report viewer should include:

- Report title
- Report description
- Filters panel
- Run report button
- Export button
- Save report button
- Schedule report button
- Results table
- Pagination
- Column sorting
- Empty state
- Error state

---

## 10.3 Results Table

Required features:

- Column headers
- Sorting
- Pagination
- Sticky header
- Total rows where applicable
- Currency formatting
- Date formatting
- Status badges

---

# 11. Report Filters

## 11.1 Supported Filter Types

Reports may support:

- Date range
- As-of date
- Customer
- Invoice status
- Payment method
- Expense category
- Compliance status
- Assigned user
- Currency
- Amount range
- Created by
- Record status

---

## 11.2 Filter Behavior

Filters should:

- Be report-specific
- Have default values where needed
- Validate invalid combinations
- Persist in saved reports
- Be included in export metadata

---

## 11.3 Default Date Range

Recommended default:

```text
Current Month
```

For Aging Report:

```text
As of today
```

---

# 12. Saved Reports

## 12.1 Purpose

Allow users to save frequently used report configurations.

---

## 12.2 Saved Report Includes

A saved report should store:

- Base report code
- Report name
- Filters
- Sorting
- Grouping if applicable
- Visibility
- Owner user
- Workspace

---

## 12.3 Visibility Options

Options:

```text
Private
Shared with workspace
```

Optional future enhancement:

```text
Shared with selected users or roles
```

---

## 12.4 Saved Report Actions

Users can:

- Create saved report
- Rename saved report
- Update filters
- Duplicate saved report
- Delete saved report
- Mark as favorite

---

# 13. Favorite Reports

Users can favorite frequently used reports.

Favorite reports should appear on:

- Reports landing page
- Dashboard quick access area where applicable

---

# 14. Exporting Reports

## 14.1 Purpose

Users need to export report data for sharing, analysis, compliance, or record keeping.

---

## 14.2 Supported Export Formats

Required:

- CSV
- Excel
- PDF

---

## 14.3 CSV Export

CSV export should include:

- Raw tabular data
- Column headers
- Applied filters metadata where practical

Use cases:

- Data import to spreadsheets
- External analysis

---

## 14.4 Excel Export

Excel export should include:

- Report title
- Generated date
- Workspace name
- Applied filters
- Data table
- Total rows where applicable
- Currency formatting
- Date formatting

Recommendation:

Excel should be the preferred export format for business users.

---

## 14.5 PDF Export

PDF export should include:

- Tetri Copilot branding
- Workspace name
- Report title
- Generated date
- Applied filters
- Summary section where applicable
- Data table
- Page numbers

Use cases:

- Sharing with management
- Compliance evidence
- Archived reporting

---

## 14.6 Export Limits

To protect performance:

- Apply maximum export row limits
- Use background export for large reports
- Notify user when export is ready

Recommended initial limits:

```text
CSV: 50,000 rows
Excel: 25,000 rows
PDF: 2,000 rows
```

These limits can be adjusted later based on performance testing.

---

# 15. Background Export Processing

## 15.1 Purpose

Large exports should not block the user interface.

---

## 15.2 Background Export Flow

```text
User requests export
 ↓
System validates request
 ↓
Export job created
 ↓
Export processed in background
 ↓
File generated
 ↓
User receives notification
 ↓
User downloads file
```

---

## 15.3 Export Job Statuses

```text
Pending
Processing
Completed
Failed
Expired
```

---

# 16. Scheduled Reports

## 16.1 Purpose

Allow users to schedule recurring reports to be delivered automatically.

---

## 16.2 Scheduling Options

Supported frequencies:

- Daily
- Weekly
- Monthly

Future:

- Quarterly
- Custom cron-like schedules

---

## 16.3 Delivery Channels

Required:

- Email
- In-app notification

Connected to Slice 10 notification infrastructure.

---

## 16.4 Scheduled Report Configuration

A scheduled report should include:

- Report code or saved report ID
- Schedule name
- Frequency
- Delivery time
- Time zone
- Recipients
- Export format
- Filters
- Active or inactive status

---

## 16.5 Recipient Types

Supported recipients:

- Current user
- Workspace users
- Workspace roles

Recommended restriction:

External email recipients should be disabled initially or controlled by workspace owner only.

---

## 16.6 Scheduled Report Examples

```text
Weekly Aging Report every Monday at 9:00 AM
```

```text
Monthly Expense Report on the first day of each month
```

```text
Daily Compliance Due Soon Report at 8:00 AM
```

---

# 17. Scheduled Report Delivery

## 17.1 Email Delivery

Email should include:

- Report name
- Workspace name
- Reporting period
- Generated timestamp
- Attachment or secure download link

Recommendation:

Use secure download links instead of large email attachments where possible.

---

## 17.2 In-App Notification Delivery

Notification should include:

- Report name
- Status
- Link to download or view report

---

## 17.3 Delivery Failure Handling

If scheduled delivery fails:

- Mark job as failed
- Log error
- Notify schedule owner
- Allow manual retry

---

# 18. Report Permissions

## 18.1 Permission Principles

Report access must follow the same permission rules as the underlying module data.

Example:

A user who cannot view expenses should not access expense reports.

---

## 18.2 Permission Checks

Apply permission checks at:

- Reports catalog visibility
- Report execution
- Export generation
- Saved report sharing
- Scheduled report creation
- Scheduled delivery

---

## 18.3 Sensitive Reports

Restrict by default:

- User Activity Report
- Subscription Usage Report
- Financial Summary Report
- Expense Reports

Default access:

Owner and Workspace Admin.

---

# 19. Tenant Isolation

All reports must be workspace-scoped.

Required:

- Every query includes workspace_id filtering
- Saved reports are workspace-scoped
- Scheduled reports are workspace-scoped
- Export files are workspace-scoped
- Download links validate workspace and user access

---

# 20. Report Audit Logs

## 20.1 Events to Log

Log the following:

- Report viewed
- Report executed
- Report exported
- Report scheduled
- Scheduled report updated
- Scheduled report deleted
- Saved report created
- Saved report shared
- Export downloaded

---

## 20.2 Audit Log Fields

Suggested fields:

- workspace_id
- user_id
- event_type
- report_code
- saved_report_id
- scheduled_report_id
- export_job_id
- timestamp
- ip_address where available
- user_agent where available

---

# 21. Database Changes

## 21.1 report_definitions

Purpose:

Stores standard report metadata.

Suggested columns:

- id
- report_code
- report_name
- category
- description
- required_permission
- supported_filters_json
- supported_exports_json
- default_sort_json
- is_active
- created_at
- updated_at

---

## 21.2 saved_reports

Purpose:

Stores user-saved report configurations.

Suggested columns:

- id
- workspace_id
- user_id
- base_report_code
- saved_report_name
- filters_json
- sorting_json
- grouping_json
- visibility
- is_favorite
- created_at
- updated_at

---

## 21.3 scheduled_reports

Purpose:

Stores recurring report schedules.

Suggested columns:

- id
- workspace_id
- created_by_user_id
- saved_report_id
- report_code
- schedule_name
- frequency
- delivery_time
- timezone
- export_format
- recipients_json
- filters_json
- is_active
- last_run_at
- next_run_at
- created_at
- updated_at

---

## 21.4 report_export_jobs

Purpose:

Tracks report export processing.

Suggested columns:

- id
- workspace_id
- user_id
- report_code
- saved_report_id
- scheduled_report_id
- export_format
- filters_json
- status
- file_url
- file_key
- error_message
- expires_at
- created_at
- completed_at

---

## 21.5 report_execution_logs

Purpose:

Tracks report execution and audit history.

Suggested columns:

- id
- workspace_id
- user_id
- report_code
- saved_report_id
- execution_type
- filters_json
- row_count
- duration_ms
- status
- error_message
- created_at

---

# 22. API Endpoints

## 22.1 Reports Catalog

```http
GET /api/reports
```

Returns available reports based on user permissions.

---

## 22.2 Report Definition

```http
GET /api/reports/:reportCode
```

Returns report metadata and supported filters.

---

## 22.3 Execute Report

```http
POST /api/reports/:reportCode/run
```

Request includes:

- filters
- sorting
- pagination

Returns:

- columns
- rows
- totals
- metadata

---

## 22.4 Export Report

```http
POST /api/reports/:reportCode/export
```

Creates export job.

---

## 22.5 Export Job Status

```http
GET /api/reports/exports/:exportJobId
```

---

## 22.6 Download Export

```http
GET /api/reports/exports/:exportJobId/download
```

Requires permission validation.

---

## 22.7 Saved Reports

```http
GET /api/reports/saved
```

```http
POST /api/reports/saved
```

```http
PUT /api/reports/saved/:savedReportId
```

```http
DELETE /api/reports/saved/:savedReportId
```

---

## 22.8 Scheduled Reports

```http
GET /api/reports/schedules
```

```http
POST /api/reports/schedules
```

```http
PUT /api/reports/schedules/:scheduledReportId
```

```http
DELETE /api/reports/schedules/:scheduledReportId
```

```http
POST /api/reports/schedules/:scheduledReportId/run-now
```

---

# 23. Frontend Requirements

## 23.1 Reports Page

Required components:

- Reports search
- Category tabs
- Report cards
- Favorite reports
- Recently used reports
- Saved reports section
- Scheduled reports section

---

## 23.2 Report Viewer

Required components:

- Report title
- Filters sidebar or top filter panel
- Run report button
- Export dropdown
- Save report button
- Schedule report button
- Results table
- Pagination
- Totals footer
- Empty state
- Error state

---

## 23.3 Saved Reports UI

Users can:

- View saved reports
- Open saved reports
- Edit saved report name
- Update saved filters
- Delete saved report
- Mark as favorite

---

## 23.4 Scheduled Reports UI

Users can:

- View scheduled reports
- Create schedule
- Edit schedule
- Enable or disable schedule
- Run now
- Delete schedule
- View last run status
- View next run date

---

# 24. UX Requirements

## 24.1 Empty States

Examples:

```text
No reports available for your role.
```

```text
No data found for the selected filters.
```

```text
No scheduled reports yet.
```

---

## 24.2 Loading States

Use loading skeletons for:

- Reports catalog
- Report results
- Export jobs
- Scheduled report list

---

## 24.3 Error States

Examples:

```text
Report could not be generated. Please adjust filters and try again.
```

```text
Export failed. Please retry or contact support.
```

---

# 25. Performance Requirements

## 25.1 Report Execution

Standard reports should return within:

```text
3 seconds
```

for normal datasets.

---

## 25.2 Large Reports

Large reports should use:

- Pagination
- Background export
- Query optimization
- Indexing

---

## 25.3 Export Processing

Small exports:

```text
Immediate or near immediate
```

Large exports:

```text
Background job
```

---

# 26. Security Requirements

Must enforce:

- Authentication
- Workspace authorization
- Role-based access
- Report-level permissions
- Export download validation
- Tenant isolation
- Secure file storage
- Expiring download links

---

# 27. Data Privacy Requirements

Reports must not expose:

- Other workspace data
- Restricted financial data
- Hidden user activity
- System-level information
- Data from disabled or deleted workspaces unless explicitly allowed by business rules

---

# 28. Notifications Integration

This slice depends on Slice 10 for:

- Export completion notifications
- Scheduled report delivery notifications
- Scheduled report failure notifications

Notification examples:

```text
Your Aging Report export is ready.
```

```text
Weekly Expense Report was delivered successfully.
```

```text
Monthly Financial Summary failed to generate.
```

---

# 29. Email Integration

Scheduled report emails should use the email notification engine from Slice 10.2.

Email template should include:

- Workspace name
- Report name
- Reporting period
- Generated date and time
- Secure download link
- Optional short summary

---

# 30. File Storage Integration

Report exports should be stored using the existing file storage strategy.

Recommended:

- Use private storage for generated reports
- Use expiring download links
- Apply workspace-based access validation
- Clean up expired files automatically

---

# 31. Testing Requirements

## 31.1 Unit Tests

Test:

- Report definitions
- Filter validation
- Permission checks
- Query handlers
- Export formatting
- Schedule calculations

---

## 31.2 Integration Tests

Test:

- Report catalog API
- Report execution API
- Saved reports APIs
- Scheduled reports APIs
- Export job APIs
- Notification integration
- Email delivery integration

---

## 31.3 Security Tests

Test:

- Workspace isolation
- Unauthorized report access
- Export download access
- Saved report sharing restrictions
- Scheduled report recipient restrictions

---

## 31.4 Performance Tests

Test:

- Large report execution
- Large export generation
- Pagination performance
- Concurrent report execution

---

## 31.5 UI Tests

Test:

- Reports page loading
- Report filters
- Results table
- Export button
- Save report flow
- Schedule report flow
- Empty states
- Error states

---

# 32. Acceptance Criteria

## 32.1 Reports Catalog

- Users can view reports available to their role
- Reports are grouped by category
- Users can search reports
- Users can favorite reports

---

## 32.2 Report Execution

- Users can run standard reports
- Filters work correctly
- Results are accurate
- Pagination works correctly
- Totals are calculated correctly where applicable

---

## 32.3 Saved Reports

- Users can save report configurations
- Users can reopen saved reports
- Users can update saved reports
- Users can delete saved reports
- Shared visibility works as designed

---

## 32.4 Exporting

- Users can export supported reports to CSV
- Users can export supported reports to Excel
- Users can export supported reports to PDF
- Exported files include correct filters and data
- Large exports run in background

---

## 32.5 Scheduled Reports

- Users can create scheduled reports
- Users can edit scheduled reports
- Users can disable scheduled reports
- Reports are delivered through selected channels
- Failures are logged and notified

---

## 32.6 Security

- Users cannot access unauthorized reports
- Users cannot access another workspace report data
- Export download links are protected
- Report permissions match module permissions

---

## 32.7 Performance

- Normal reports load within target response time
- Large reports use pagination or background jobs
- UI remains responsive during report generation

---

# 33. Implementation Phases

## Phase 1 — Reporting Foundation

Deliver:

- Report definitions
- Report catalog
- Report execution engine
- Basic report viewer
- Permission model

---

## Phase 2 — Standard Reports

Deliver core reports:

- Financial Summary
- Revenue Report
- Collections Report
- Outstanding Receivables
- Aging Report
- Expense Report
- Compliance Status

---

## Phase 3 — Exports

Deliver:

- CSV export
- Excel export
- PDF export
- Export jobs
- Export download flow

---

## Phase 4 — Saved and Favorite Reports

Deliver:

- Saved reports
- Favorite reports
- Shared reports
- Recently used reports

---

## Phase 5 — Scheduled Reporting

Deliver:

- Scheduled reports
- Email delivery
- In-app notification delivery
- Run now action
- Failure handling

---

# 34. Recommended Development Notes for Claude Code

Claude Code should:

- Reuse existing workspace authorization middleware
- Reuse existing role and permission logic
- Reuse existing notification services from Slice 10
- Reuse existing file storage utilities from Slice 8 where applicable
- Avoid duplicating report logic inside frontend components
- Keep report definitions centralized
- Keep report queries optimized and workspace-scoped
- Add indexes where report performance requires them
- Use background jobs for large exports and scheduled reports
- Ensure all report APIs are tested for tenant isolation

---

# 35. Suggested Database Indexes

Recommended indexes:

- invoices.workspace_id
- invoices.customer_id
- invoices.status
- invoices.invoice_date
- invoices.due_date
- payments.workspace_id
- payments.payment_date
- payments.customer_id
- expenses.workspace_id
- expenses.expense_date
- expenses.category_id
- compliance_occurrences.workspace_id
- compliance_occurrences.due_date
- compliance_occurrences.status
- report_export_jobs.workspace_id
- report_export_jobs.status
- scheduled_reports.workspace_id
- scheduled_reports.next_run_at

Exact index names and implementation should follow the existing database naming conventions.

---

# 36. Risks and Mitigations

## Risk 1 — Reports Become Too Heavy

Mitigation:

Start with standard reports and delay full custom report builder.

---

## Risk 2 — Slow Report Queries

Mitigation:

Use pagination, indexes, optimized queries, and background exports.

---

## Risk 3 — Data Leakage Across Workspaces

Mitigation:

Apply strict workspace_id filtering and automated tenant isolation tests.

---

## Risk 4 — Scheduled Reports Sent to Wrong Recipients

Mitigation:

Validate recipients at schedule creation and again at delivery time.

---

## Risk 5 — PDF Export Complexity

Mitigation:

Start with simple branded PDF tables before advanced formatted report packs.

---

# 37. Future Enhancements

Future enhancements may include:

- Full custom report builder
- Drag-and-drop report designer
- Advanced charts inside reports
- AI-generated report summaries
- Natural language report requests
- Report comments and annotations
- Report approval workflow
- External sharing links
- Google Sheets export
- Power BI integration
- Admin-level SaaS reporting

---

# 38. Final Recommendation

Slice 11.2 should deliver a strong reporting foundation without overcomplicating the first version.

Recommended first release focus:

- Reports catalog
- Standard reports
- Filters
- Saved reports
- CSV, Excel, and PDF exports
- Scheduled delivery
- Strong permissions and tenant isolation

Do not include a full custom report builder in this slice unless absolutely required. It is better to make standard reports excellent first, then introduce advanced customization later.

---

# 39. Deliverables

## Backend Deliverables

- Report definitions
- Report execution engine
- Report query handlers
- Report permission validation
- Saved reports APIs
- Scheduled reports APIs
- Export job service
- CSV export service
- Excel export service
- PDF export service
- Report execution logs

---

## Frontend Deliverables

- Reports landing page
- Reports catalog UI
- Report viewer page
- Filter panel
- Results table
- Export dropdown
- Save report flow
- Scheduled report flow
- Favorite reports UI
- Saved reports UI

---

## Database Deliverables

- report_definitions
- saved_reports
- scheduled_reports
- report_export_jobs
- report_execution_logs
- Required indexes

---

## Notification Deliverables

- Export completed notification
- Export failed notification
- Scheduled report delivered notification
- Scheduled report failed notification

---

## Documentation Deliverables

- Developer implementation notes
- API documentation
- Report catalog documentation
- User guide for running reports
- User guide for scheduling reports

---

## Testing Deliverables

- Unit tests
- Integration tests
- Security tests
- Performance tests
- UI tests

---

# End of Slice 11.2 — Reports Engine & Scheduled Reporting
