# Slice-11.1-Dashboard-Foundation-and-KPI-Center.md

---

# Slice 11.1 — Dashboard Foundation & KPI Center

**Project:** Tetri Copilot  
**Module:** Workspace Dashboard & Analytics  
**Slice ID:** 11.1  
**Version:** 1.0  
**Status:** Planned  
**Priority:** High  
**Type:** Core Business Intelligence Foundation  
**Estimated Complexity:** Medium  
**Dependencies:** Slices 1–10.5  
**Prerequisite:** All core operational modules must expose dashboard metrics APIs

---

# 1. Purpose

This slice introduces the primary Workspace Dashboard experience for Tetri Copilot.

The Dashboard becomes the default landing page for workspace users and provides a centralized real-time view of the most important business indicators, operational metrics, compliance status, financial performance, notifications, and recent activities.

The objective is to allow business owners and workspace users to understand the overall health of their business within seconds of logging into the system.

This slice establishes:

- Dashboard framework
- KPI infrastructure
- Widget architecture
- Dashboard personalization
- Dashboard permissions
- Global dashboard filters
- Workspace activity feed
- Financial overview widgets
- Compliance overview widgets
- Subscription usage widgets

Advanced reporting, forecasting, AI analytics, and custom reports are intentionally excluded and delivered in later slices.

---

# 2. Business Objectives

Enable users to:

- Monitor business performance instantly
- Track collections and receivables
- Monitor expenses
- Track compliance obligations
- Monitor workspace activity
- View subscription usage
- Identify operational risks early
- Improve business visibility
- Reduce manual status gathering
- Increase owner productivity

---

# 3. Scope

## Included

### Dashboard Infrastructure

- Dashboard page
- Widget framework
- KPI framework
- Widget configuration
- Widget visibility controls
- Dashboard preferences

### Dashboard Widgets

- KPI Cards
- Financial Snapshot
- Receivables Summary
- Expense Summary
- Compliance Summary
- Notifications Summary
- Activity Feed
- Subscription Usage
- Upcoming Tasks

### Personalization

- Reorder widgets
- Hide widgets
- Save preferences

### Filters

- Date filtering
- Global dashboard filtering

### Security

- Role-based widget visibility
- Workspace data isolation

---

## Excluded

Delivered in Slice 11.2:

- Reporting engine
- Report exports
- Scheduled reports
- Custom report builder

Delivered in Slice 11.3:

- Forecasting
- Trend analysis
- AI insights
- Health scoring
- Predictive analytics

---

# 4. User Roles

| Role | Access |
|----------|----------|
| Owner | Full Dashboard |
| Workspace Admin | Full Dashboard |
| User | Limited Dashboard |
| Viewer | Read-Only Dashboard |
| System Admin | Support Access Only |

---

# 5. Dashboard Entry Point

After authentication:

```text
Login
 ↓
Workspace Selection
 ↓
Dashboard Home
```

The Dashboard becomes the default homepage after workspace selection.

---

# 6. Dashboard Layout Structure

```text
--------------------------------------------------
Top Navigation
--------------------------------------------------

Welcome Banner

Global Filters

KPI Cards Row

Financial Widgets

Compliance Widgets

Operational Widgets

Activity Feed

Tasks & Notifications

--------------------------------------------------
Footer
--------------------------------------------------
```

Responsive design required for:

- Desktop
- Tablet
- Mobile

---

# 7. Dashboard Welcome Section

---

## Purpose

Provide immediate workspace context.

---

## Display Elements

### Workspace Name

Example:

```text
Redbridge Trading LLC
```

---

### Welcome Message

Examples:

```text
Good Morning Mohammed
```

```text
Welcome Back
```

---

### Current Date

Example:

```text
26 May 2026
```

---

### Fiscal Year

Example:

```text
FY 2026
```

---

### Subscription Plan

Example:

```text
Professional Plan
```

---

### Workspace Country

Example:

```text
Georgia
```

---

# 8. Quick Actions Panel

Purpose:

Allow users to perform common actions directly from Dashboard.

---

## Available Actions

### Customer

```text
Add Customer
```

---

### Invoice

```text
Create Invoice
```

---

### Payment

```text
Record Payment
```

---

### Expense

```text
Create Expense
```

---

### File

```text
Upload File
```

---

### Compliance

```text
Open Compliance Calendar
```

---

### Reminder

```text
Create Reminder
```

---

Permissions determine visibility.

---

# 9. KPI Center Architecture

---

## Purpose

Provide high-level business metrics.

---

## KPI Characteristics

Every KPI must display:

- Current value
- Previous period value
- Percentage change
- Trend indicator

Examples:

```text
↑ +12%
↓ -5%
→ No Change
```

---

## KPI Refresh

Automatic refresh:

```text
5 minutes
```

Manual refresh supported.

---

# 10. KPI Card — Accounts Receivable

Displays:

### Total Outstanding

Example:

```text
$12,500
```

---

### Overdue Amount

Example:

```text
$3,250
```

---

### Collection Rate

Example:

```text
87%
```

---

### Open Invoices

Example:

```text
18
```

---

Source:

Slice 6

---

# 11. KPI Card — Revenue

Displays:

### Current Month Revenue

### Previous Month Revenue

### Growth %

### Active Customers Revenue

---

Source:

Customers + Invoices

---

# 12. KPI Card — Collections

Displays:

### Collected This Month

### Collected Last Month

### Collection Growth %

### Payments Count

---

Source:

Payments Module

---

# 13. KPI Card — Expenses

Displays:

### Current Month Expenses

### Previous Month Expenses

### Expense Change %

### Expense Count

---

Source:

Expense Module

---

# 14. KPI Card — Compliance

Displays:

### Upcoming Obligations

### Due This Week

### Overdue

### Completed This Month

---

Source:

Compliance Module

---

# 15. KPI Card — Notifications

Displays:

### Unread Notifications

### Pending Actions

### Escalations

### Announcements

---

Source:

Notifications Module

---

# 16. KPI Card — Subscription Usage

Displays:

### Plan Name

### Users Used

### Users Limit

### Storage Used

### Storage %

---

Source:

Billing & Subscription

---

# 17. Financial Snapshot Widget

Purpose:

Provide financial overview.

---

## Metrics

### Revenue

### Collections

### Expenses

### Net Position

Formula:

```text
Collections - Expenses
```

---

## Supported Periods

- Today
- Week
- Month
- Quarter
- Year
- Custom

---

## Visualization

Summary cards

Optional mini trend chart

---

# 18. Receivables Summary Widget

Purpose:

Monitor unpaid invoices.

---

## Metrics

### Outstanding

### Current

### Overdue

### Aging

---

## Aging Buckets

```text
Current

1–30 Days

31–60 Days

61–90 Days

90+ Days
```

---

## Visualization

Bar Chart

or

Donut Chart

---

# 19. Expense Summary Widget

Purpose:

Monitor spending.

---

## Metrics

### Current Month

### Previous Month

### Difference

### Average Monthly Expense

---

## Top Categories

Top 5 categories displayed.

---

Visualization:

Donut Chart

---

# 20. Compliance Summary Widget

Purpose:

Monitor compliance workload.

---

Displays:

### Upcoming

### Due Soon

### Overdue

### Completed

---

Status Colors

Green

Amber

Red

---

# 21. Subscription Usage Widget

Displays:

### Active Users

### Remaining Users

### Storage Consumption

### Plan Utilization

---

Usage Progress Bars

Required.

---

# 22. Upcoming Tasks Widget

Displays:

- Compliance tasks
- Reminders
- Pending approvals
- Due actions

---

Sorting:

1. Overdue
2. Today
3. Upcoming

---

# 23. Recent Activity Feed

Purpose:

Provide operational visibility.

---

Activities include:

### Customer Created

### Invoice Created

### Invoice Sent

### Payment Recorded

### Expense Submitted

### Expense Approved

### Reminder Completed

### File Uploaded

### User Invited

### Compliance Completed

---

Activity record includes:

- User
- Action
- Timestamp

Example:

```text
Ahmed created Invoice INV-00215
10 minutes ago
```

---

# 24. Notifications Summary Widget

Displays:

### Recent Notifications

### Unread Count

### High Priority Alerts

### Escalations

---

Actions:

- Mark Read
- Open Item

---

# 25. Dashboard Global Filters

Purpose:

Apply filtering across all widgets.

---

## Supported Filters

### Date Range

### Customer

### Status

### User

### Expense Category

### Currency

---

All widgets refresh automatically after filter changes.

---

# 26. Dashboard Personalization

Users can customize layout.

---

## Supported Actions

### Move Widget

Drag & Drop

---

### Hide Widget

---

### Show Widget

---

### Reset Layout

Restore default configuration.

---

Preferences saved automatically.

---

# 27. Widget Visibility Rules

Example:

### Viewer

Visible:

- KPI cards
- Activity Feed
- Compliance Summary

Hidden:

- Financial details if restricted

---

### Owner

Visible:

All widgets

---

Permission controlled.

---

# 28. Mobile Dashboard

Required.

---

## Mobile Layout

Single-column responsive layout.

---

Priority order:

1. KPI Cards
2. Tasks
3. Notifications
4. Financial Snapshot
5. Compliance Summary
6. Activity Feed

---

# 29. Dashboard Performance Requirements

---

## Initial Load

Target:

```text
< 3 Seconds
```

---

## Widget Refresh

Target:

```text
< 2 Seconds
```

---

## API Response

Target:

```text
< 500 ms
```

for normal requests.

---

# 30. Dashboard APIs

---

## Dashboard Summary

```http
GET /api/dashboard/summary
```

Returns:

- KPI cards
- counts
- totals

---

## Financial Snapshot

```http
GET /api/dashboard/financial
```

---

## Receivables Summary

```http
GET /api/dashboard/receivables
```

---

## Expense Summary

```http
GET /api/dashboard/expenses
```

---

## Compliance Summary

```http
GET /api/dashboard/compliance
```

---

## Notifications Summary

```http
GET /api/dashboard/notifications
```

---

## Activity Feed

```http
GET /api/dashboard/activity
```

---

## User Preferences

```http
GET /api/dashboard/preferences
```

```http
PUT /api/dashboard/preferences
```

---

# 31. Database Changes

---

## dashboard_preferences

Stores:

- layout
- visibility
- widget positions

Example:

```sql
dashboard_preferences
```

Columns:

- id
- workspace_id
- user_id
- layout_json
- hidden_widgets
- created_at
- updated_at

---

## dashboard_widget_configs

Stores default widget configuration.

Example:

```sql
dashboard_widget_configs
```

Columns:

- id
- widget_code
- widget_name
- enabled
- default_position
- created_at

---

# 32. Audit Requirements

Log:

### Dashboard Access

### Widget Changes

### Layout Changes

### Dashboard Resets

### Filter Usage

---

Retain in audit logs.

---

# 33. Security Requirements

Must enforce:

### Workspace Isolation

Users cannot access another workspace metrics.

---

### Permission Validation

Every widget validates permissions.

---

### Secure Aggregation

Queries must only aggregate workspace-owned data.

---

### API Authorization

All dashboard endpoints protected.

---

# 34. Error Handling

---

## No Data

Display:

```text
No data available
```

---

## Widget Failure

Widget fails independently.

Dashboard remains functional.

---

## API Timeout

Retry automatically.

---

## Permission Denied

Display:

```text
Access Restricted
```

---

# 35. Testing Requirements

---

## Unit Tests

Dashboard services

KPI calculations

Permission logic

Filters

---

## Integration Tests

API endpoints

Widget loading

Activity feed

Preferences

---

## Security Tests

Tenant isolation

Unauthorized access

Role restrictions

---

## Performance Tests

Dashboard load

Concurrent users

Large datasets

---

## Responsive Tests

Desktop

Tablet

Mobile

---

# 36. Acceptance Criteria

### Dashboard Foundation

- Dashboard loads successfully
- Default landing page configured
- Responsive design implemented

---

### KPI Center

- KPI cards calculate correctly
- Trends display correctly
- Filters apply successfully

---

### Widgets

- All widgets functional
- Widget permissions enforced
- Widgets refresh correctly

---

### Personalization

- Widget reordering works
- Preferences persist
- Reset layout works

---

### Activity Feed

- Activities appear in real time
- Proper ordering maintained

---

### Security

- Tenant isolation verified
- Permission checks verified

---

### Performance

- Dashboard meets performance targets

---

# 37. Future Integration Points

### Slice 11.2

Reports Engine

- Drill-down reporting
- Export actions
- Open report from widget

---

### Slice 11.3

Analytics & Forecasting

- Trend analysis
- Forecast charts
- Health score
- AI recommendations

---

### Slice 14

AI Copilot

Examples:

```text
Why did expenses increase this month?
```

```text
Show overdue invoices above $500.
```

```text
Which customers pay late most often?
```

---

# 38. Recommended Implementation Order

### Phase 1

Dashboard framework

Widget engine

Preferences

Global filters

---

### Phase 2

KPI Cards

Financial Snapshot

Receivables

Expenses

Compliance

---

### Phase 3

Activity Feed

Notifications

Tasks

Subscription Usage

---

### Phase 4

Performance optimization

Responsive improvements

Security validation

Testing

Deployment

---

# Deliverables

### Backend

- Dashboard services
- KPI calculation services
- Widget APIs
- Preferences APIs
- Activity feed services

### Frontend

- Dashboard page
- KPI cards
- Widget framework
- Filters
- Personalization UI
- Responsive layouts

### Database

- dashboard_preferences
- dashboard_widget_configs

### Documentation

- Technical documentation
- API documentation
- User guide

### Testing

- Unit tests
- Integration tests
- Security tests
- Performance tests

---

**End of Slice 11.1 — Dashboard Foundation & KPI Center**