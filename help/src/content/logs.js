export const articles = [
  {
    slug: 'logs/activity-overview',
    title: 'Activity Log Overview',
    description: 'How to use the Activity Log to review workspace events.',
    category: 'Activity & Audit Logs',
    categorySlug: 'logs',
    keywords: ['activity log', 'activity', 'history', 'events', 'log overview'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Activity Log records every significant action taken in your workspace — invoices created, expenses approved, members added, settings changed, and more. It gives you a complete operational history.',
      },
      {
        type: 'steps',
        title: 'How to Open the Activity Log',
        items: [
          'Click Activity in the left sidebar (top-level navigation item).',
          'The Activity Log opens, showing the most recent events first.',
        ],
      },
      {
        type: 'fields',
        title: 'Activity Log Columns',
        rows: [
          { field: 'Timestamp', required: false, description: 'The date and time the action occurred.', example: '29 May 2026 at 14:32' },
          { field: 'User', required: false, description: 'Who performed the action.', example: 'Sarah Chen' },
          { field: 'Action', required: false, description: 'What was done.', example: 'Created Invoice INV-0042' },
          { field: 'Entity', required: false, description: 'The record that was affected.', example: 'Invoice: INV-0042' },
          { field: 'Details', required: false, description: 'Additional context about the action.', example: 'Amount: £1,200. Customer: ABC Trading' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'logs/audit-trail', title: 'Audit Trail' },
          { slug: 'logs/filtering', title: 'Filtering Logs' },
        ],
      },
    ],
  },
  {
    slug: 'logs/audit-trail',
    title: 'Audit Trail',
    description: 'How to use the Audit Trail for compliance and security reviews.',
    category: 'Activity & Audit Logs',
    categorySlug: 'logs',
    keywords: ['audit trail', 'audit log', 'security', 'compliance', 'audit'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Audit Trail provides a detailed, tamper-evident record of all data changes in your workspace. It is designed for compliance and security review purposes and shows who changed what, and when.',
      },
      {
        type: 'steps',
        title: 'How to Access the Audit Trail',
        items: [
          'In the sidebar, expand the Security group.',
          'Click Audit Log.',
          'Use filters to narrow down the events by user, date, or action type.',
          'Export the audit trail as CSV or PDF for external review.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'The Audit Log is read-only. Records cannot be edited or deleted. This ensures the integrity of your audit history.',
      },
    ],
  },
  {
    slug: 'logs/filtering',
    title: 'Filtering Logs',
    description: 'How to filter and search the Activity Log and Audit Trail.',
    category: 'Activity & Audit Logs',
    categorySlug: 'logs',
    keywords: ['filter logs', 'search logs', 'find activity', 'audit filter'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content: 'Both the Activity Log and Audit Trail support filtering so you can quickly find specific events.',
      },
      {
        type: 'fields',
        title: 'Filter Options',
        rows: [
          { field: 'Date Range', required: false, description: 'Filter events between a start and end date.', example: '01 May 2026 – 31 May 2026' },
          { field: 'User', required: false, description: 'Filter by the specific team member who performed the action.', example: 'Sarah Chen' },
          { field: 'Action Type', required: false, description: 'Filter by the type of action (created, updated, deleted, signed in, etc.).', example: 'Created, Deleted' },
          { field: 'Entity Type', required: false, description: 'Filter by the type of record affected (Invoice, Expense, Customer, etc.).', example: 'Invoice' },
          { field: 'Search', required: false, description: 'Free-text search across log entries.', example: 'INV-0042' },
        ],
      },
    ],
  },
  {
    slug: 'logs/security-events',
    title: 'Security Events',
    description: 'How to review security-related events like sign-ins and permission changes.',
    category: 'Activity & Audit Logs',
    categorySlug: 'logs',
    keywords: ['security events', 'sign in history', 'access log', 'security log'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Security events are a subset of the audit trail focusing on authentication and access control: sign-ins, sign-outs, failed login attempts, role changes, and member additions or removals.',
      },
      {
        type: 'steps',
        title: 'How to Review Security Events',
        items: [
          'Go to Security → Security in the sidebar.',
          'Select the Security tab or filter the audit log by Security event type.',
          'Review sign-in history and access changes.',
          'If you see unexpected events, contact your Workspace Owner immediately.',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content: 'If you see sign-in activity you do not recognize, change your password immediately and contact Support.',
      },
    ],
  },
]
