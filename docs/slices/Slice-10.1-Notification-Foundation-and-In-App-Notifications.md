# Slice 10.1 – Notification Foundation & In-App Notifications

Version: 1.0  
Status: Approved / Ready for Claude Code Implementation  
Module: Notifications  
Parent Slice: Slice 10 – Notifications  
Slice Type: Platform Service + User Experience Foundation  
Primary Goal: Establish the notification foundation and complete in-app notification experience for Tetri Copilot.

---

# 1. Document Purpose

This document defines the full functional, technical, UI, API, database, security, integration, and acceptance requirements for **Slice 10.1 – Notification Foundation & In-App Notifications**.

This slice creates the foundational notification layer used by Tetri Copilot across all modules. It introduces the core notification data model, service layer, notification center, notification bell, notification dropdown, in-app real-time delivery, personal preferences, workspace notification settings, deep linking, and audit tracking.

This slice does **not** implement email delivery, reminder automation, escalation automation, or announcement management. Those are handled in later Notification slices.

---

# 2. Slice Position in Roadmap

## 2.1 Parent Slice

- Slice 10 – Notifications

## 2.2 Sub-Slice

- Slice 10.1 – Notification Foundation & In-App Notifications

## 2.3 Related Notification Slices

- Slice 10.2 – Email Notifications, Templates & Delivery Engine
- Slice 10.3 – Reminders, Escalations & Announcements
- Slice 10.4 – Platform Notification Enablement (Backward Integration)

## 2.4 Recommended Implementation Order

Although Slice 10.4 is the backward integration slice, Slice 10.1 should define the foundational service and data model first.

Recommended order:

```text
1. Slice 10.1 – Notification Foundation & In-App Notifications
2. Slice 10.4 – Platform Notification Enablement (Backward Integration)
3. Slice 10.2 – Email Notifications, Templates & Delivery Engine
4. Slice 10.3 – Reminders, Escalations & Announcements
```

Reason:

- Slice 10.1 creates the base notification engine.
- Slice 10.4 connects previous modules to the engine.
- Slice 10.2 expands delivery to email.
- Slice 10.3 adds reminder, escalation, and announcement orchestration.

---

# 3. Dependencies

## 3.1 Functional Dependencies

This slice depends on the following previously implemented or planned slices:

- Slice 1 – Authentication
- Slice 2 – Workspace & Company Setup
- Slice 3 – Workspace User Management & Roles
- Slice 4.1 – Subscription Plans & Catalog
- Slice 4.2 – Workspace Current Plan & Usage Summary
- Slice 4.3 – Upgrade / Downgrade / Cancel Plan
- Slice 4.4 – Billing Integration Foundation
- Slice 5 – Customers
- Slice 6.1 – Invoices Core
- Slice 6.2 – Payments & Allocations
- Slice 6.3 – Receivables, Statements & Collections
- Slice 7.1 – Expenses Core
- Slice 7.2 – Expense Approvals & Reimbursements
- Slice 7.3 – Expense Insights, Automation & AI
- Slice 8 – Files & Attachments
- Slice 8.1 – Compliance Foundation
- Slice 9.1 – Compliance Templates, Occurrences & Calendar
- Slice 9.2 – Compliance Tasks & Workflow Management
- Slice 9.3 – Compliance Dashboard, Reporting & Insights

## 3.2 Technical Dependencies

The implementation must use the existing Tetri Copilot stack:

- React frontend
- shadcn/ui component style
- Express.js backend
- Prisma ORM
- PostgreSQL database
- Clerk authentication integration
- Workspace-based multi-tenancy
- Role-based access control
- Existing layout shell and side navigation
- Existing audit/logging pattern where applicable

---

# 4. High-Level Objective

The objective of this slice is to build the first complete notification capability in Tetri Copilot.

At the end of this slice:

- Users can see a notification bell in the global header.
- Users can see unread notification counts.
- Users can open a notification dropdown.
- Users can navigate to a full Notification Center.
- Users can read, archive, delete, and manage notifications.
- Users can open deep links from notifications to related records.
- Users can manage personal in-app notification preferences.
- Workspace owners/admins can configure workspace-level notification behavior.
- The backend has a reusable Notification Service.
- Business modules can create notification records through a centralized service.
- Notification events are auditable.
- Future email, reminder, escalation, push, SMS, and announcement features can build on this foundation.

---

# 5. Business Goals

## 5.1 Centralized Communication

Provide one consistent place where users can view important system, workflow, compliance, invoice, expense, billing, security, and workspace notifications.

## 5.2 Improve User Awareness

Ensure important events are surfaced immediately instead of requiring users to manually check different screens.

## 5.3 Reduce Missed Actions

Reduce missed approvals, overdue compliance tasks, payment events, invoice activities, and user management actions.

## 5.4 Enable Future Automation

Prepare the system for future reminders, escalations, email delivery, workflow automation, and AI-based prioritization.

## 5.5 Improve Auditability

Track the notification lifecycle, including creation, viewing, reading, archiving, deletion, and delivery attempts.

---

# 6. Scope

## 6.1 Included in This Slice

This slice includes:

- Notification data model
- Notification categories
- Notification priority levels
- Notification event codes
- Notification service layer
- Notification creation API
- Notification retrieval APIs
- Notification bell
- Notification unread badge
- Notification dropdown
- Full Notification Center page
- Notification details view
- Read/unread actions
- Archive actions
- Delete own notification action
- Mark all as read
- Deep link handling
- In-app notification delivery
- Toast notification display
- Basic real-time or near-real-time refresh
- User notification preferences
- Workspace notification settings
- Notification audit trail
- Integration readiness with previous slices
- Seed data for notification categories and common event types
- Testing instructions and acceptance criteria

## 6.2 Excluded from This Slice

This slice excludes:

- Email delivery
- Email templates
- Email queue workers
- External delivery provider integration
- SMS notifications
- WhatsApp notifications
- Push notifications
- Slack notifications
- Microsoft Teams notifications
- Reminder scheduling engine
- Escalation workflows
- Announcement management
- AI prioritization
- Notification digest emails

These excluded items are handled by later slices.

---

# 7. User Roles and Responsibilities

## 7.1 Super Admin

Super Admin responsibilities for this slice are limited.

Super Admin may:

- View global notification categories if admin panel support already exists.
- Review notification health in future slices.
- Manage global templates in Slice 10.2.

Super Admin does not need full advanced notification administration in this slice unless the current admin panel is already available.

## 7.2 Workspace Owner

Workspace Owner can:

- View own notifications.
- Manage own notification preferences.
- Configure workspace-level notification settings.
- Enable or disable non-mandatory notification categories at workspace level.
- Set basic notification retention preference if supported.

## 7.3 Workspace Admin

Workspace Admin can:

- View own notifications.
- Manage own notification preferences.
- Configure workspace notification settings if permission is granted.

## 7.4 User

User can:

- View own notifications.
- Mark own notifications as read/unread.
- Archive own notifications.
- Delete own notifications.
- Manage own notification preferences.

## 7.5 Viewer

Viewer can:

- View own notifications.
- Mark own notifications as read/unread.
- Archive own notifications.
- Delete own notifications.
- Manage own notification preferences.

Viewer cannot configure workspace-level notification settings.

---

# 8. Notification Architecture

## 8.1 Architecture Principle

Notifications must be handled as a centralized platform service.

Business modules must not directly insert notification database rows from UI or controller logic. They must use the Notification Service or a backend notification publisher abstraction.

## 8.2 Core Architecture Flow

```text
Business Action
      ↓
Backend Domain Logic
      ↓
Notification Service
      ↓
Notification Repository
      ↓
Notification Record
      ↓
In-App Delivery Layer
      ↓
Notification Bell / Dropdown / Center
      ↓
User Action / Audit
```

## 8.3 Decoupling Rule

Business modules should only provide:

- event code
- workspace ID
- recipient user ID or recipient resolution rule
- source module
- related entity type
- related entity ID
- title/message payload or generated content key
- target URL
- priority
- metadata

The Notification Service is responsible for:

- validation
- workspace isolation
- preference checks
- notification creation
- audit logging
- real-time delivery event emission

---

# 9. Notification Categories

## 9.1 Purpose

Categories group notifications consistently across the platform.

## 9.2 Required Categories

The system must seed the following notification categories:

| Category Code | Name | Purpose | Default Priority |
|---|---|---|---|
| SECURITY | Security | Authentication and account security events | Critical |
| WORKSPACE | Workspace | Workspace and user management activity | Medium |
| BILLING | Billing | Subscription, plan, and payment events | High |
| CUSTOMER | Customer | Customer lifecycle events | Low |
| INVOICE | Invoice | Invoice and receivable events | Medium |
| PAYMENT | Payment | Payment and allocation events | Medium |
| EXPENSE | Expense | Expense lifecycle events | Medium |
| APPROVAL | Approval | Approval requests and decisions | High |
| FILE | File | File upload and attachment events | Low |
| COMPLIANCE | Compliance | Compliance calendar and task events | High |
| SYSTEM | System | General system notices | Medium |
| AI | AI | Future AI-generated alerts and insights | Medium |

## 9.3 Category Rules

Each category must include:

- code
- name
- description
- default priority
- icon key
- color token or style key
- active flag
- mandatory flag where applicable

## 9.4 Mandatory Categories

The following categories cannot be disabled by the user:

- SECURITY
- BILLING critical events
- COMPLIANCE critical events
- SYSTEM critical events

---

# 10. Notification Priority Levels

## 10.1 Priority List

The system must support the following priority levels:

| Priority | Description | Example |
|---|---|---|
| LOW | Informational only | Customer created |
| MEDIUM | Action may be useful | Invoice created |
| HIGH | Action required | Expense approval required |
| CRITICAL | Immediate attention required | Security alert or payment failure |

## 10.2 UI Behavior by Priority

- LOW: normal display
- MEDIUM: normal display with category indicator
- HIGH: stronger visual emphasis
- CRITICAL: strongest emphasis and cannot be suppressed if mandatory

## 10.3 Sorting Behavior

Default sort must be newest first.

Users may optionally sort by priority if UI supports it.

---

# 11. Notification Event Registry

## 11.1 Purpose

The Notification Event Registry defines event codes that modules can publish.

This registry must be implemented as seed data or configuration so later slices can map events to templates, delivery channels, reminder rules, and escalation rules.

## 11.2 Authentication Events

| Event Code | Category | Priority | Target Recipient |
|---|---|---|---|
| USER_INVITED | WORKSPACE | Medium | Invited user |
| USER_ACTIVATED | WORKSPACE | Medium | Workspace owner/admin |
| PASSWORD_CHANGED | SECURITY | Critical | Account user |
| PASSWORD_RESET_REQUESTED | SECURITY | High | Account user |
| LOGIN_FROM_NEW_DEVICE | SECURITY | Critical | Account user |
| ACCOUNT_LOCKED | SECURITY | Critical | Account user |

## 11.3 Workspace Events

| Event Code | Category | Priority | Target Recipient |
|---|---|---|---|
| USER_ROLE_CHANGED | WORKSPACE | Medium | Affected user |
| USER_DISABLED | WORKSPACE | Medium | Workspace owner/admin |
| USER_REACTIVATED | WORKSPACE | Medium | Workspace owner/admin |
| WORKSPACE_PROFILE_UPDATED | WORKSPACE | Low | Owner/admin |
| WORKSPACE_SETTINGS_UPDATED | WORKSPACE | Low | Owner/admin |

## 11.4 Billing Events

| Event Code | Category | Priority | Target Recipient |
|---|---|---|---|
| SUBSCRIPTION_CREATED | BILLING | Medium | Owner |
| SUBSCRIPTION_RENEWED | BILLING | Medium | Owner |
| SUBSCRIPTION_UPGRADED | BILLING | Medium | Owner |
| SUBSCRIPTION_DOWNGRADED | BILLING | Medium | Owner |
| SUBSCRIPTION_CANCELLED | BILLING | High | Owner |
| PAYMENT_FAILED | BILLING | Critical | Owner |
| PLAN_LIMIT_REACHED | BILLING | High | Owner/admin |

## 11.5 Customer Events

| Event Code | Category | Priority | Target Recipient |
|---|---|---|---|
| CUSTOMER_CREATED | CUSTOMER | Low | Creator/owner |
| CUSTOMER_UPDATED | CUSTOMER | Low | Creator/owner |
| CUSTOMER_ARCHIVED | CUSTOMER | Low | Owner/admin |

## 11.6 Invoice and Payment Events

| Event Code | Category | Priority | Target Recipient |
|---|---|---|---|
| INVOICE_CREATED | INVOICE | Medium | Creator/owner |
| INVOICE_SENT | INVOICE | Medium | Creator/owner |
| INVOICE_UPDATED | INVOICE | Low | Creator/owner |
| INVOICE_CANCELLED | INVOICE | Medium | Creator/owner |
| PAYMENT_RECEIVED | PAYMENT | Medium | Owner/admin |
| PARTIAL_PAYMENT_RECEIVED | PAYMENT | Medium | Owner/admin |
| PAYMENT_ALLOCATED | PAYMENT | Low | Owner/admin |

## 11.7 Expense Events

| Event Code | Category | Priority | Target Recipient |
|---|---|---|---|
| EXPENSE_SUBMITTED | EXPENSE | Medium | Submitter/approver |
| EXPENSE_APPROVAL_REQUIRED | APPROVAL | High | Approver |
| EXPENSE_APPROVED | EXPENSE | Medium | Submitter |
| EXPENSE_REJECTED | EXPENSE | High | Submitter |
| EXPENSE_REIMBURSED | EXPENSE | Medium | Submitter |

## 11.8 File Events

| Event Code | Category | Priority | Target Recipient |
|---|---|---|---|
| FILE_UPLOADED | FILE | Low | Uploader |
| FILE_REJECTED | FILE | High | Uploader |
| STORAGE_LIMIT_REACHED | SYSTEM | High | Owner/admin |

## 11.9 Compliance Events

| Event Code | Category | Priority | Target Recipient |
|---|---|---|---|
| COMPLIANCE_TASK_CREATED | COMPLIANCE | Medium | Assigned user |
| COMPLIANCE_TASK_ASSIGNED | COMPLIANCE | High | Assigned user |
| COMPLIANCE_TASK_DUE_SOON | COMPLIANCE | High | Assigned user/owner |
| COMPLIANCE_TASK_DUE_TODAY | COMPLIANCE | High | Assigned user/owner |
| COMPLIANCE_TASK_OVERDUE | COMPLIANCE | Critical | Assigned user/owner |
| COMPLIANCE_TASK_COMPLETED | COMPLIANCE | Medium | Owner/admin |

---

# 12. Notification Service Requirements

## 12.1 Service Name

Recommended backend service name:

```text
notificationService
```

or equivalent project naming convention.

## 12.2 Core Service Methods

The backend should implement service methods equivalent to:

```ts
createNotification(input)
createBulkNotifications(input[])
markAsRead(notificationId, userContext)
markAsUnread(notificationId, userContext)
markAllAsRead(userContext, filters?)
archiveNotification(notificationId, userContext)
deleteNotification(notificationId, userContext)
getNotifications(userContext, filters)
getUnreadCount(userContext)
getNotificationById(notificationId, userContext)
```

## 12.3 Create Notification Input

The create notification input should support:

```ts
type CreateNotificationInput = {
  workspaceId: string;
  recipientUserId: string;
  eventCode: string;
  categoryCode: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  targetUrl?: string;
  sourceModule?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};
```

## 12.4 Validation Rules

The service must validate:

- workspace exists
- recipient user belongs to workspace
- category exists and is active
- event code is supported or safely accepted as custom if allowed
- title is not empty
- message is not empty
- target URL is internal or allowed
- metadata does not contain unsafe or oversized content

## 12.5 Failure Behavior

Notification creation failure must not break the originating business transaction unless the transaction itself requires notification as a mandatory compliance action.

Recommended behavior:

- Log the failure.
- Return non-blocking warning.
- Continue business operation.

---

# 13. Notification Bell Requirements

## 13.1 Location

The notification bell must appear in the authenticated application header.

It should be visible across all authenticated pages.

## 13.2 Badge Counter

The bell must display unread notification count.

Display rules:

```text
0    → no badge or subtle badge depending UI standard
1-99 → exact number
100+ → display 99+
```

## 13.3 Click Behavior

When the user clicks the bell:

- Open notification dropdown.
- Fetch latest notifications if stale.
- Mark nothing as read automatically.

## 13.4 Accessibility

The bell must include:

- accessible label
- keyboard focus support
- screen-reader-friendly unread count
- clear hover/focus state

---

# 14. Notification Dropdown Requirements

## 14.1 Purpose

The dropdown provides quick access to recent notifications.

## 14.2 Content

The dropdown must show:

- latest notifications
- unread visual state
- category icon
- title
- short message or summary
- timestamp
- priority indicator when high or critical

## 14.3 Maximum Items

Show latest 10 to 20 notifications.

Recommended default:

```text
10 items
```

## 14.4 Dropdown Actions

The dropdown must support:

- open notification
- mark as read
- mark all as read
- archive notification
- view all notifications

Delete can be included in the full Notification Center only if the dropdown becomes too crowded.

## 14.5 Empty State

If there are no notifications:

```text
No notifications yet.
You're all caught up.
```

## 14.6 Loading State

Show skeleton or loading spinner while retrieving notification data.

## 14.7 Error State

If loading fails:

```text
Unable to load notifications.
Try again.
```

---

# 15. Notification Center Requirements

## 15.1 Route

Recommended route:

```text
/app/notifications
```

or existing project routing convention.

## 15.2 Purpose

The Notification Center is the main inbox for all user notifications.

## 15.3 Page Sections

The Notification Center must include:

- All notifications
- Unread notifications
- Read notifications
- Archived notifications

Tabs may be used.

## 15.4 Notification List Fields

Each list item should show:

- category icon
- title
- message preview
- created date/time
- read/unread state
- priority
- related module/entity if available
- actions menu

## 15.5 Search

Users must be able to search by:

- title
- message
- event code
- related entity reference where available

## 15.6 Filters

Filters should include:

- category
- priority
- read status
- archived status
- date range
- source module

## 15.7 Sorting

Supported sorting:

- newest first
- oldest first
- priority

Default:

```text
newest first
```

## 15.8 Bulk Actions

Users must be able to:

- mark selected as read
- mark selected as unread
- archive selected
- delete selected

## 15.9 Pagination

Notification Center must support pagination or infinite scroll.

Recommended:

```text
Page size: 25
```

## 15.10 Empty States

All tab:

```text
No notifications yet.
```

Unread tab:

```text
No unread notifications.
```

Archived tab:

```text
No archived notifications.
```

---

# 16. Notification Detail Requirements

## 16.1 Purpose

The detail view shows complete notification content and contextual information.

## 16.2 Display Fields

The detail view must show:

- notification title
- full message
- category
- priority
- status
- created date
- read date if applicable
- source module
- related entity type
- related entity reference
- target URL action

## 16.3 Actions

Available actions:

- open related record
- mark as read
- mark as unread
- archive
- delete
- go back to Notification Center

## 16.4 Read Behavior

Opening notification detail should mark the notification as read.

Exception:

- If product owner prefers manual only, allow configuration.

Recommended default:

```text
Opening detail marks notification as read.
```

---

# 17. Deep Linking Requirements

## 17.1 Purpose

Notifications must allow users to jump directly to the related record.

Examples:

- Expense approval notification → Expense detail page
- Invoice notification → Invoice detail page
- Compliance task notification → Compliance task detail page
- User role change notification → User management page

## 17.2 Security Rule

Deep links must not bypass permissions.

If user does not have access:

```text
Show access denied message or redirect to safe page.
```

## 17.3 Invalid Target Handling

If the target record no longer exists:

```text
This related record is no longer available.
```

The notification itself should still remain visible.

---

# 18. In-App Delivery Requirements

## 18.1 Delivery Model

The slice must support near-real-time in-app notification updates.

Acceptable implementation approaches:

- WebSocket
- Server-Sent Events
- periodic polling
- React Query refetch interval

## 18.2 MVP Recommendation

For simplicity, MVP can use polling/refetch.

Recommended initial behavior:

```text
Refresh unread count every 30–60 seconds.
Refresh dropdown when opened.
Refresh Notification Center after actions.
```

WebSocket or SSE can be added later without changing the database design.

## 18.3 Real-Time Behavior

When a new notification is created:

- unread count updates
- notification appears in dropdown/list
- toast appears if user is active and preferences allow it

---

# 19. Toast Notification Requirements

## 19.1 Purpose

Toast notifications provide immediate on-screen visibility for new in-app events.

## 19.2 Toast Content

Toast should show:

- title
- short message
- category icon
- action button if target URL exists

## 19.3 Toast Actions

Actions:

- View
- Dismiss

## 19.4 Display Duration

Recommended defaults:

| Priority | Duration |
|---|---|
| LOW | 4 seconds |
| MEDIUM | 5 seconds |
| HIGH | 8 seconds |
| CRITICAL | 10 seconds or persistent until dismissed |

## 19.5 Preference Handling

If user disables a category, toast should not appear for that category unless mandatory.

---

# 20. User Notification Preferences

## 20.1 Route / Location

Recommended location:

```text
My Profile → Notification Preferences
```

## 20.2 Purpose

Allow each user to control which in-app notification categories they receive.

## 20.3 Preference Categories

Users can configure:

- Security notifications
- Workspace notifications
- Billing notifications
- Customer notifications
- Invoice notifications
- Payment notifications
- Expense notifications
- Approval notifications
- File notifications
- Compliance notifications
- System notifications
- AI notifications when available

## 20.4 Controls

For Slice 10.1, controls include:

```text
In-App Enabled: Yes/No
Toast Enabled: Yes/No
```

Email controls are introduced or activated in Slice 10.2.

## 20.5 Mandatory Preferences

Mandatory categories must be visible but locked.

Example UI copy:

```text
Security notifications are required and cannot be disabled.
```

## 20.6 Default User Preferences

When a user is created, default preferences should be generated.

Default:

- All in-app notifications enabled
- Toast enabled for medium/high/critical
- Mandatory categories locked

---

# 21. Workspace Notification Settings

## 21.1 Route / Location

Recommended location:

```text
Workspace Settings → Notifications
```

## 21.2 Purpose

Allow workspace owners/admins to configure workspace-level notification behavior.

## 21.3 Workspace-Level Controls

Settings include:

- Enable notification system
- Enable in-app notifications
- Enable toast notifications
- Default retention period
- Category-level enablement
- Priority threshold for toast display

## 21.4 Future-Ready Controls

The screen may show disabled future controls with labels if desired:

- Email notifications – coming in Slice 10.2
- Reminders – coming in Slice 10.3
- Escalations – coming in Slice 10.3

Do not implement inactive functionality prematurely.

## 21.5 Workspace Settings Defaults

For new workspaces:

```text
notifications_enabled = true
in_app_enabled = true
toast_enabled = true
retention_months = 24
```

---

# 22. Notification Lifecycle

## 22.1 Lifecycle States

Notification lifecycle:

```text
Created
      ↓
Delivered In-App
      ↓
Viewed / Opened
      ↓
Read
      ↓
Archived or Deleted
```

## 22.2 Status Fields

A notification can have:

- read/unread status
- archived/not archived status
- deleted/not deleted status

## 22.3 Soft Delete Requirement

Deletion should be implemented as soft delete.

Reason:

- audit trail
- compliance
- troubleshooting
- future analytics

---

# 23. Audit Trail Requirements

## 23.1 Purpose

Maintain traceability of notification events and user actions.

## 23.2 Audited Actions

Audit the following:

- notification created
- notification delivered in-app
- notification viewed
- notification marked read
- notification marked unread
- notification archived
- notification deleted
- preferences changed
- workspace notification settings changed

## 23.3 Audit Data

Audit records should include:

- notification ID
- workspace ID
- user ID
- action
- performed by
- timestamp
- metadata
- IP address if available
- user agent if available

## 23.4 Audit Immutability

Audit records must not be editable from UI.

---

# 24. Database Design

## 24.1 General Notes

The names below are recommended. Developers may align with existing naming conventions if needed, but the functional intent must remain the same.

## 24.2 notification_categories

```sql
CREATE TABLE notification_categories (
    id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_key VARCHAR(100),
    color_key VARCHAR(100),
    default_priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 24.3 notification_event_registry

```sql
CREATE TABLE notification_event_registry (
    id UUID PRIMARY KEY,
    event_code VARCHAR(150) NOT NULL UNIQUE,
    category_code VARCHAR(100) NOT NULL,
    source_module VARCHAR(100) NOT NULL,
    default_priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    default_title VARCHAR(255),
    default_message TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 24.4 notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    recipient_user_id UUID NOT NULL,
    event_code VARCHAR(150) NOT NULL,
    category_code VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    source_module VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    target_url TEXT,
    metadata JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 24.5 notification_preferences

```sql
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    category_code VARCHAR(100) NOT NULL,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    toast_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, user_id, category_code)
);
```

## 24.6 workspace_notification_settings

```sql
CREATE TABLE workspace_notification_settings (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL UNIQUE,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    toast_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    retention_months INTEGER NOT NULL DEFAULT 24,
    minimum_toast_priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 24.7 notification_audit_logs

```sql
CREATE TABLE notification_audit_logs (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    notification_id UUID,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    performed_by UUID,
    metadata JSONB,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 24.8 Recommended Indexes

```sql
CREATE INDEX idx_notifications_user_workspace ON notifications (workspace_id, recipient_user_id);
CREATE INDEX idx_notifications_unread ON notifications (workspace_id, recipient_user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX idx_notifications_category ON notifications (workspace_id, category_code);
CREATE INDEX idx_notifications_event ON notifications (event_code);
CREATE INDEX idx_notification_preferences_user ON notification_preferences (workspace_id, user_id);
CREATE INDEX idx_notification_audit_notification ON notification_audit_logs (notification_id);
```

---

# 25. Prisma Model Guidance

Developers should add Prisma models equivalent to:

```prisma
model NotificationCategory {
  id              String   @id @default(uuid())
  code            String   @unique
  name            String
  description     String?
  iconKey         String?
  colorKey        String?
  defaultPriority String   @default("MEDIUM")
  isActive        Boolean  @default(true)
  isMandatory     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model NotificationEventRegistry {
  id              String   @id @default(uuid())
  eventCode       String   @unique
  categoryCode    String
  sourceModule    String
  defaultPriority String   @default("MEDIUM")
  defaultTitle    String?
  defaultMessage  String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Notification {
  id              String    @id @default(uuid())
  workspaceId     String
  recipientUserId String
  eventCode       String
  categoryCode    String
  priority        String    @default("MEDIUM")
  title           String
  message         String
  sourceModule    String?
  entityType      String?
  entityId        String?
  targetUrl       String?
  metadata        Json?
  isRead          Boolean   @default(false)
  readAt          DateTime?
  isArchived      Boolean   @default(false)
  archivedAt      DateTime?
  isDeleted       Boolean   @default(false)
  deletedAt       DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model NotificationPreference {
  id            String   @id @default(uuid())
  workspaceId   String
  userId        String
  categoryCode  String
  inAppEnabled  Boolean  @default(true)
  toastEnabled  Boolean  @default(true)
  isLocked      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([workspaceId, userId, categoryCode])
}

model WorkspaceNotificationSettings {
  id                   String   @id @default(uuid())
  workspaceId           String   @unique
  notificationsEnabled Boolean  @default(true)
  inAppEnabled          Boolean  @default(true)
  toastEnabled          Boolean  @default(true)
  retentionMonths       Int      @default(24)
  minimumToastPriority  String   @default("MEDIUM")
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model NotificationAuditLog {
  id             String   @id @default(uuid())
  workspaceId    String
  notificationId String?
  userId         String?
  action         String
  performedBy    String?
  metadata       Json?
  ipAddress      String?
  userAgent      String?
  createdAt      DateTime @default(now())
}
```

Developers must align relation fields with existing Workspace and User models.

---

# 26. Backend API Requirements

## 26.1 Notification APIs

```http
GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
GET    /api/v1/notifications/:id
POST   /api/v1/notifications/:id/read
POST   /api/v1/notifications/:id/unread
POST   /api/v1/notifications/read-all
POST   /api/v1/notifications/:id/archive
POST   /api/v1/notifications/bulk/archive
DELETE /api/v1/notifications/:id
DELETE /api/v1/notifications/bulk
```

## 26.2 Preference APIs

```http
GET /api/v1/notification-preferences
PUT /api/v1/notification-preferences
```

## 26.3 Workspace Settings APIs

```http
GET /api/v1/workspace/notification-settings
PUT /api/v1/workspace/notification-settings
```

## 26.4 Category APIs

```http
GET /api/v1/notification-categories
```

## 26.5 Internal Notification Creation API

This may be an internal service method rather than public route.

If route is needed for internal backend use:

```http
POST /api/v1/internal/notifications
```

This must be protected and not exposed to normal users.

---

# 27. API Response Examples

## 27.1 Notification List Response

```json
{
  "items": [
    {
      "id": "uuid",
      "eventCode": "EXPENSE_APPROVAL_REQUIRED",
      "categoryCode": "APPROVAL",
      "priority": "HIGH",
      "title": "Expense approval required",
      "message": "A new expense is waiting for your approval.",
      "targetUrl": "/app/expenses/uuid",
      "isRead": false,
      "isArchived": false,
      "createdAt": "2026-05-25T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 1
  }
}
```

## 27.2 Unread Count Response

```json
{
  "unreadCount": 7
}
```

## 27.3 Preferences Response

```json
{
  "preferences": [
    {
      "categoryCode": "APPROVAL",
      "inAppEnabled": true,
      "toastEnabled": true,
      "isLocked": false
    },
    {
      "categoryCode": "SECURITY",
      "inAppEnabled": true,
      "toastEnabled": true,
      "isLocked": true
    }
  ]
}
```

---

# 28. Frontend UI Requirements

## 28.1 Components to Build

Required frontend components:

```text
NotificationBell
NotificationDropdown
NotificationList
NotificationListItem
NotificationCenterPage
NotificationDetailPanel
NotificationFilters
NotificationPreferencesPage
WorkspaceNotificationSettingsPage
NotificationToastHandler
```

## 28.2 UI Style

Use existing Tetri Copilot UI standards:

- shadcn/ui components
- existing layout shell
- existing typography
- existing spacing
- responsive design
- dark/light theme compatibility if already supported

## 28.3 Notification Bell UI

The bell should appear near the user profile menu.

## 28.4 Notification Dropdown UI

Use card/dropdown style consistent with the application.

## 28.5 Notification Center UI

The Notification Center should include:

- page title
- summary counters
- tabs
- search field
- filters
- notification list
- pagination
- bulk actions

## 28.6 Mobile Responsiveness

Notification dropdown should work on mobile.

On smaller screens, it may open as a sheet/drawer.

---

# 29. Permissions Matrix

| Feature | Owner | Admin | User | Viewer |
|---|---|---|---|---|
| View own notifications | Yes | Yes | Yes | Yes |
| View other users' notifications | No | No | No | No |
| Mark own notifications read/unread | Yes | Yes | Yes | Yes |
| Archive own notifications | Yes | Yes | Yes | Yes |
| Delete own notifications | Yes | Yes | Yes | Yes |
| Manage personal preferences | Yes | Yes | Yes | Yes |
| Manage workspace notification settings | Yes | Yes | No | No |
| Manage global categories | No | No | No | No |
| Create system notifications manually | No | No | No | No |

---

# 30. Security Requirements

## 30.1 Authentication

All notification APIs must require authenticated users.

## 30.2 Workspace Isolation

Users can only access notifications belonging to their current workspace.

## 30.3 Recipient Isolation

Users can only view their own notifications.

## 30.4 Deep Link Security

Deep links must not bypass module permissions.

## 30.5 Internal API Protection

If internal notification creation endpoint exists, it must be protected from normal user access.

## 30.6 Metadata Safety

Metadata must not store sensitive secrets, tokens, passwords, or private credentials.

## 30.7 Audit Safety

Audit records must not be modifiable through normal UI.

---

# 31. Performance Requirements

| Requirement | Target |
|---|---|
| Fetch unread count | Under 1 second |
| Load dropdown | Under 2 seconds |
| Load Notification Center | Under 3 seconds |
| Mark read/unread | Under 1 second |
| Archive/delete | Under 1 second |
| Create notification | Under 1 second |
| Polling/refetch interval | 30–60 seconds |

---

# 32. Data Retention Requirements

## 32.1 Default Retention

Default notification retention:

```text
24 months
```

## 32.2 Retention Scope

Retention applies to notification records.

Audit records may follow platform audit policy.

## 32.3 Future Cleanup Job

A cleanup job can be implemented later if scheduled jobs are not already available.

For this slice, the database must support retention but the cleanup job can be deferred unless simple to implement.

---

# 33. Seed Data Requirements

## 33.1 Category Seed Data

Seed all categories listed in Section 9.

## 33.2 Event Registry Seed Data

Seed all event codes listed in Section 11.

## 33.3 Workspace Settings Seed

For each existing workspace:

- create workspace notification settings if missing

## 33.4 User Preferences Seed

For each existing workspace user:

- create default notification preferences for each category
- mandatory categories locked

---

# 34. Backward Compatibility Requirements

## 34.1 No Breaking Changes

This slice must not break existing slices.

## 34.2 Optional Integration First

Existing modules may begin publishing notifications gradually.

## 34.3 Non-Blocking Notification Creation

If notification creation fails, existing business transaction should continue.

## 34.4 Future Slice 10.4

Full backward integration of all previous slices is completed in Slice 10.4.

This slice should provide the service and data model required for that integration.

---

# 35. Module Integration Readiness

## 35.1 Authentication Readiness

Support notification events for:

- user invitation
- password changes
- new device login

## 35.2 User Management Readiness

Support notification events for:

- role changes
- user disabled
- user reactivated

## 35.3 Billing Readiness

Support notification events for:

- plan changes
- payment failure
- subscription cancellation

## 35.4 Invoice Readiness

Support notification events for:

- invoice created
- invoice sent
- payment received

## 35.5 Expense Readiness

Support notification events for:

- expense submitted
- approval required
- approved/rejected

## 35.6 Compliance Readiness

Support notification events for:

- task assigned
- due soon
- overdue
- completed

---

# 36. Error Handling

## 36.1 API Errors

API errors should return standard error responses consistent with existing backend patterns.

Examples:

- 400 invalid request
- 401 unauthenticated
- 403 unauthorized
- 404 not found
- 500 server error

## 36.2 Frontend Errors

Frontend must show user-friendly error messages:

```text
Unable to load notifications.
Unable to update notification status.
Unable to save notification preferences.
```

## 36.3 Retry UX

Where useful, provide retry button.

---

# 37. Logging Requirements

Backend logs should capture:

- notification creation failure
- preference update failure
- workspace settings update failure
- invalid event code usage
- invalid recipient user
- deep link validation errors where applicable

Logs must not expose sensitive metadata.

---

# 38. Testing Requirements

## 38.1 Backend Unit Tests

Test:

- create notification
- create bulk notifications
- read notification list
- unread count
- mark read
- mark unread
- archive
- delete
- preference update
- workspace settings update
- workspace isolation
- recipient isolation

## 38.2 Backend Integration Tests

Test:

- database creation
- seeded categories
- seeded event registry
- migration scripts
- default settings initialization

## 38.3 Frontend Tests

Test:

- bell count display
- dropdown loading
- Notification Center filtering
- mark read action
- archive action
- empty states
- error states
- preferences save

## 38.4 Security Tests

Test:

- user cannot access another user's notification
- user cannot access another workspace notification
- viewer cannot manage workspace settings
- deep links respect existing module permissions

---

# 39. Acceptance Criteria

## 39.1 Foundation

- Notification tables are created successfully.
- Notification categories are seeded.
- Notification event registry is seeded.
- Notification Service exists and is reusable.
- Notification creation works through backend service.

## 39.2 Notification Bell

- Notification bell appears in global header.
- Unread count displays correctly.
- Unread count updates after read/unread actions.
- Count displays `99+` when above 99.

## 39.3 Notification Dropdown

- Dropdown opens from the bell.
- Dropdown displays recent notifications.
- Dropdown supports mark as read.
- Dropdown supports mark all as read.
- Dropdown links to Notification Center.
- Empty state displays correctly.

## 39.4 Notification Center

- Notification Center page exists.
- Users can view all notifications.
- Users can filter by category, status, priority, and date range.
- Users can search notifications.
- Users can mark read/unread.
- Users can archive notifications.
- Users can delete notifications.
- Pagination or infinite scroll works.

## 39.5 Notification Details

- Users can open notification details.
- Opening details marks notification as read.
- Deep link button opens related record when permitted.
- Invalid target records are handled gracefully.

## 39.6 Preferences

- Users can view notification preferences.
- Users can update non-mandatory preferences.
- Mandatory categories are locked.
- Preference changes affect future notifications/toasts.

## 39.7 Workspace Settings

- Owner/admin can view workspace notification settings.
- Owner/admin can update workspace notification settings.
- User/viewer cannot update workspace notification settings.

## 39.8 Audit

- Notification actions create audit logs.
- Preference changes create audit logs.
- Workspace settings changes create audit logs.

## 39.9 Security

- Users only see their own notifications.
- Workspace isolation is enforced.
- Deep links respect permissions.
- Internal creation endpoint, if created, is protected.

## 39.10 Non-Regression

- Existing slices continue functioning.
- Notification failures do not break existing business flows.

---

# 40. Developer Implementation Notes for Claude Code

## 40.1 General Instruction

Implement this slice as a clean platform service. Avoid placing notification logic directly inside individual frontend screens or unrelated controllers.

## 40.2 Backend Implementation Notes

Recommended backend folders:

```text
backend/src/modules/notifications
backend/src/modules/notifications/notification.service.ts
backend/src/modules/notifications/notification.controller.ts
backend/src/modules/notifications/notification.routes.ts
backend/src/modules/notifications/notification.repository.ts
backend/src/modules/notifications/notification.types.ts
backend/src/modules/notifications/notification.seed.ts
```

Adjust to existing folder conventions.

## 40.3 Frontend Implementation Notes

Recommended frontend folders:

```text
frontend/src/features/notifications
frontend/src/features/notifications/components
frontend/src/features/notifications/pages
frontend/src/features/notifications/hooks
frontend/src/features/notifications/api
frontend/src/features/notifications/types
```

Adjust to existing project conventions.

## 40.4 Reuse Existing Components

Use existing:

- app shell
- header
- buttons
- cards
- dropdowns
- dialogs
- table/list components
- toast system
- loading skeletons
- empty state components

## 40.5 Do Not Implement Yet

Do not implement:

- email provider
- email templates
- queue worker
- reminder engine
- escalation engine
- announcement management

Only build future-ready fields and architecture where needed.

---

# 41. Suggested Navigation Changes

## 41.1 Header

Add notification bell to global header.

## 41.2 Main Menu

Add optional Notifications menu item:

```text
Notifications
```

If side menu is already long, keep Notification Center accessible from bell dropdown only.

## 41.3 Profile Menu

Add:

```text
Notification Preferences
```

## 41.4 Workspace Settings

Add:

```text
Notifications
```

under workspace/company settings.

---

# 42. UX Copy Examples

## 42.1 Empty State

```text
No notifications yet.
Important updates will appear here.
```

## 42.2 Unread Empty State

```text
No unread notifications.
You're all caught up.
```

## 42.3 Archive Empty State

```text
No archived notifications.
```

## 42.4 Error State

```text
Unable to load notifications.
Please try again.
```

## 42.5 Mandatory Preference Note

```text
This notification category is required and cannot be disabled.
```

---

# 43. Future Enhancements

Future slices may add:

- email delivery
- template management
- queue processing
- delivery tracking
- reminders
- escalations
- announcements
- push notifications
- SMS notifications
- WhatsApp notifications
- Slack notifications
- Microsoft Teams notifications
- AI prioritization
- smart bundling
- notification digest
- predictive reminders
- automated follow-ups

---

# 44. Deliverables

Upon completion, Slice 10.1 must deliver:

- Notification database schema
- Notification category seed data
- Notification event registry seed data
- Notification Service
- Notification API endpoints
- Notification Bell
- Notification Dropdown
- Notification Center
- Notification Detail View
- In-app notification delivery behavior
- Toast notification support
- User notification preferences
- Workspace notification settings
- Deep linking support
- Audit trail for notification lifecycle
- Security and workspace isolation
- Testing coverage
- Foundation ready for Slices 10.2, 10.3, and 10.4

---

# 45. Final Definition of Done

Slice 10.1 is complete when:

1. The database schema is implemented and migrated.
2. Seed data exists for categories and event registry.
3. Notification Service can create and manage notifications.
4. Authenticated users can view and manage their own notifications.
5. Notification bell and dropdown work globally.
6. Notification Center is fully usable.
7. Preferences and workspace settings are implemented.
8. Audit trail captures key actions.
9. Workspace and recipient isolation are verified.
10. The implementation does not break existing slices.
11. The system is ready for email delivery in Slice 10.2.
12. The system is ready for reminder and escalation automation in Slice 10.3.
13. The system is ready for backward integration in Slice 10.4.

