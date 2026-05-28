export const articles = [
  {
    slug: 'settings/overview',
    title: 'Settings Overview',
    description: 'What you can configure in the Tetri Copilot Settings area.',
    category: 'Settings',
    categorySlug: 'settings',
    keywords: ['settings', 'configuration', 'settings overview', 'configure'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Settings area is where you configure how your workspace operates. It is organized into sections covering your company profile, notification preferences, email templates, member management, and more. Only Owners and Admins can access Settings.',
      },
      {
        type: 'fields',
        title: 'Settings Sections',
        rows: [
          { field: 'General', required: false, description: 'Company profile, workspace name, currency, country, and fiscal year settings.', example: '' },
          { field: 'Notifications', required: false, description: 'Configure which events trigger in-app and email notifications.', example: '' },
          { field: 'Email Templates', required: false, description: 'Customize the automated emails sent by the system (invoice reminders, welcome emails, etc.).', example: '' },
          { field: 'Members', required: false, description: 'Invite, remove, and manage roles for workspace members.', example: '' },
          { field: 'Reminder Rules', required: false, description: 'Set up rules for when automatic reminders are sent for invoices and compliance.', example: '' },
          { field: 'Escalation Rules', required: false, description: 'Configure escalation workflows for critical reminders.', example: '' },
          { field: 'Announcements', required: false, description: 'Send workspace-wide announcements to all team members.', example: '' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'settings/general', title: 'General Settings' },
          { slug: 'settings/notification-settings', title: 'Notification Settings' },
          { slug: 'settings/members-roles', title: 'Members and Roles' },
        ],
      },
    ],
  },
  {
    slug: 'settings/general',
    title: 'General Settings',
    description: 'How to configure your workspace general settings in Tetri Copilot.',
    category: 'Settings',
    categorySlug: 'settings',
    keywords: ['general settings', 'workspace configuration', 'company settings', 'preferences'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'General Settings covers the foundational workspace configuration — your company details, financial settings, and system preferences.',
      },
      {
        type: 'steps',
        title: 'How to Update General Settings',
        items: [
          'Expand the Settings group in the sidebar.',
          'Click General.',
          'Update any settings you need to change.',
          'Click Save Changes to apply.',
        ],
      },
      {
        type: 'fields',
        title: 'General Settings Fields',
        rows: [
          { field: 'Company Name', required: true, description: 'Your business name as it appears on invoices.', example: 'Acme Trading Ltd' },
          { field: 'Country', required: true, description: 'Your business country.', example: 'United Kingdom' },
          { field: 'Currency', required: true, description: 'Your default billing currency.', example: 'GBP' },
          { field: 'Timezone', required: false, description: 'Your local timezone for scheduling reminders.', example: 'Europe/London' },
          { field: 'Date Format', required: false, description: 'How dates are displayed.', example: 'DD/MM/YYYY' },
          { field: 'Invoice Prefix', required: false, description: 'Prefix for auto-generated invoice numbers.', example: 'INV-' },
          { field: 'Default Payment Terms', required: false, description: 'Default days until payment due on invoices.', example: '30 days' },
          { field: 'Default Tax Rate', required: false, description: 'Default tax rate applied to new invoice line items.', example: '20%' },
          { field: 'Fiscal Year Start', required: false, description: 'Month your financial year begins.', example: 'April' },
        ],
      },
    ],
  },
  {
    slug: 'settings/notification-settings',
    title: 'Notification Settings',
    description: 'How to configure workspace notification rules and preferences.',
    category: 'Settings',
    categorySlug: 'settings',
    keywords: ['notification settings', 'configure notifications', 'email rules', 'alert settings'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Notification settings control which events trigger automatic alerts across your workspace. Workspace-level settings affect all members. Individual members can also control their own personal notification preferences.',
      },
      {
        type: 'fields',
        title: 'Configurable Notification Events',
        rows: [
          { field: 'Invoice Overdue', required: false, description: 'Notify when an invoice passes its due date without payment.', example: '' },
          { field: 'Invoice Paid', required: false, description: 'Notify when a payment is recorded against an invoice.', example: '' },
          { field: 'Expense Submitted', required: false, description: 'Notify approvers when an expense is submitted for review.', example: '' },
          { field: 'Expense Approved / Rejected', required: false, description: 'Notify the submitter when their expense is actioned.', example: '' },
          { field: 'Compliance Deadline', required: false, description: 'Send reminders before compliance obligation due dates.', example: '' },
          { field: 'Member Activity', required: false, description: 'Notify owners when a member joins or leaves the workspace.', example: '' },
        ],
      },
    ],
  },
  {
    slug: 'settings/email-templates',
    title: 'Email Templates',
    description: 'How to customize the automated email templates sent by Tetri Copilot.',
    category: 'Settings',
    categorySlug: 'settings',
    keywords: ['email templates', 'customize emails', 'automated emails', 'email settings'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Tetri Copilot sends automatic emails for events like invoice delivery, payment receipts, and compliance reminders. The Email Templates settings let you customize the content and branding of these emails.',
      },
      {
        type: 'steps',
        title: 'How to Edit an Email Template',
        items: [
          'Go to Settings → Email Templates.',
          'You see a list of all automated email types (Invoice Sent, Payment Receipt, Compliance Reminder, etc.).',
          'Click on a template to edit it.',
          'Modify the subject line and email body.',
          'Use template variables (like {{customer_name}} or {{invoice_number}}) to insert dynamic content.',
          'Preview the email before saving.',
          'Click Save Template.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content: 'Keep automated emails professional and on-brand. Include your company name, relevant details, and a clear call to action.',
      },
    ],
  },
  {
    slug: 'settings/members-roles',
    title: 'Members and Roles',
    description: 'How to manage team members and their roles in Tetri Copilot.',
    category: 'Settings',
    categorySlug: 'settings',
    keywords: ['members', 'roles', 'team', 'invite', 'permissions', 'access control'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Members settings page is where you manage who has access to your workspace. You can invite new members, update roles, and remove members who should no longer have access.',
      },
      {
        type: 'steps',
        title: 'How to Invite a Member',
        items: [
          'Go to Settings → Members.',
          'Click Invite Member.',
          'Enter the email address of the person to invite.',
          'Select their role.',
          'Click Send Invitation.',
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'workspace/members', title: 'Members and Access' },
          { slug: 'getting-started/user-roles', title: 'User Roles and Access Levels' },
        ],
      },
    ],
  },
]
