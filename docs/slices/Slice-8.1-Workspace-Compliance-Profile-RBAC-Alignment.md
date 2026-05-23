# Slice 8.1 — Workspace Compliance Profile \& RBAC Alignment

## Purpose

Prepare the already-implemented platform foundation for Slice 9.1 Compliance Templates, Occurrences \& Calendar.

## Included

### Workspace Compliance Profile

Add fields to company/workspace setup:

* jurisdiction\_id
* tax\_registration\_number
* vat\_registered
* vat\_registration\_number
* corporate\_tax\_registered
* corporate\_tax\_number
* trade\_license\_number
* trade\_license\_expiry\_date

### RBAC Permission Additions

Add compliance permissions:

* compliance.view
* compliance.manage
* compliance.configure
* compliance.admin

### Navigation Preparation

Add placeholder permission checks for future compliance menu visibility.

### Database Migration

Create migration for new workspace/company compliance profile fields.

### Seed Data Preparation

Optional: seed initial jurisdictions:

* UAE
* Georgia
* Saudi Arabia
* Qatar

## Excluded

* Compliance templates
* Compliance occurrences
* Calendar
* Reminder engine
* Escalations
* Reports
* Dashboards

These remain in Slice 9.1, 9.2, and 9.3.

## Acceptance Criteria

* Workspace/company profile supports compliance-related fields
* Existing onboarding still works
* Existing company setup still works
* Existing RBAC still works
* Compliance permissions exist
* No compliance module functionality exposed yet
* Database migration runs safely





Issues Fixing:



also, consider resolving these previous issues:



in budgets menu,

1\. i fill in budget details and click create budget button, but nothing happened, stay in the same page, no saving, no messages.



in recurring menu, when fill in recurring expenses details,

1\. no suppliers and categories showing supplier and category dropdown boxes

2\. when i click create, nothing happened, no save, no messages



In files screen:

1. resolve the file loading issue





Side menu UI grouping:



Update the Tetri Copilot sidebar navigation UI to make it shorter and better organized.



Current issue:

The sidebar has too many top-level menu items, making it long and difficult to scan.



Required change:

Group related menu items into collapsible sidebar sections.



Keep Dashboard as a top-level item.



Create these sidebar groups:



1\. Sales

&#x20;  - Customers



2\. Invoicing

&#x20;  - Invoices

&#x20;  - Payments

&#x20;  - Receivables

&#x20;  - Collections

&#x20;  - Statements

&#x20;  - Recurring



3\. Expenses

&#x20;  - Expenses

&#x20;  - Approvals

&#x20;  - Reimbursements

&#x20;  - Budgets



4\. Insights

&#x20;  - Insights



5\. Admin \& Settings

&#x20;  - Files

&#x20;  - Members

&#x20;  - Billing

&#x20;  - Settings



UI/UX requirements:

\- Each group should be collapsible/expandable.

\- Use a chevron icon to show expanded/collapsed state.

\- Keep the existing design style, colors, spacing, icons, and active menu styling.

\- Preserve the current routing paths.

\- Do not remove any existing menu item.

\- Do not change backend logic.

\- Do not change permissions logic unless already connected to menu visibility.

\- Sidebar should remain responsive and work properly on desktop and mobile.

\- Active submenu item should highlight correctly.

\- If a submenu route is active, the parent group should automatically appear expanded.

\- Keep Dashboard always visible at the top.

\- Keep the logo area unchanged.



Implementation guidance:

\- Locate the current sidebar/navigation component.

\- Refactor the menu configuration into a structured array with groups and children.

\- Reuse existing shadcn/ui, lucide-react icons, Tailwind classes, and routing approach.

\- Avoid hardcoded duplicated menu rendering.

\- Make the component clean and maintainable for future menu additions.



Acceptance criteria:

\- Sidebar is visually shorter.

\- Menu items are grouped logically.

\- All existing links still work.

\- Active route highlighting works for both parent groups and child items.

\- Refreshing the page on a child route keeps its parent group expanded.

\- No TypeScript, lint, or build errors.

\- Run the relevant frontend checks after implementation.



Use the below image as the visual direction, but adapt it to the existing Tetri Copilot UI and codebase.



'c:\\Users\\mo\\Downloads\\side-menu-grouping.png'





