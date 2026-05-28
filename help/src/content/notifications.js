export const articles = [
  {
    slug: 'notifications/overview',
    title: 'Notifications Overview',
    description: 'How the notifications system works in Tetri Copilot.',
    category: 'Notifications',
    categorySlug: 'notifications',
    keywords: ['notifications', 'alerts', 'bell', 'notification center', 'overview'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Tetri Copilot sends automatic notifications to keep you informed about important events — invoice payments received, expenses pending approval, compliance deadlines approaching, and more. Notifications appear as in-app alerts and can also be sent by email.',
      },
      {
        type: 'fields',
        title: 'Notification Types',
        rows: [
          { field: 'Invoice Events', required: false, description: 'Alerts when invoices become overdue, are paid, or when new invoices are created.', example: 'Invoice INV-0042 is now overdue' },
          { field: 'Expense Events', required: false, description: 'Alerts when expenses need approval or when expenses are approved/rejected.', example: 'Expense submitted by John Smith needs your approval' },
          { field: 'Compliance Events', required: false, description: 'Reminders for upcoming compliance deadlines.', example: 'VAT Return due in 7 days' },
          { field: 'Payment Events', required: false, description: 'Notifications when payments are received or recorded.', example: 'Payment of £1,200 received from ABC Trading' },
          { field: 'System Events', required: false, description: 'Workspace updates, member activity, and system announcements.', example: 'Sarah joined your workspace' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'notifications/in-app', title: 'In-App Notifications' },
          { slug: 'notifications/email-notifications', title: 'Email Notifications' },
          { slug: 'notifications/preferences', title: 'Notification Preferences' },
        ],
      },
    ],
  },
  {
    slug: 'notifications/in-app',
    title: 'In-App Notifications',
    description: 'How to view and manage your in-app notification center.',
    category: 'Notifications',
    categorySlug: 'notifications',
    keywords: ['in-app notifications', 'notification bell', 'notification center', 'alerts'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The notification bell icon in the top bar shows a count of your unread notifications. Click it to open the notification center panel, which lists all recent alerts.',
      },
      {
        type: 'steps',
        title: 'How to View Notifications',
        items: [
          'Look for the bell icon in the top-right area of the page.',
          'A red badge shows the number of unread notifications.',
          'Click the bell icon to open the notification panel.',
          'Each notification shows what happened, when, and a link to the relevant record.',
          'Click a notification to open the related record (e.g., click an invoice notification to open that invoice).',
          'Click "Mark all as read" to clear the unread count.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content: 'Notifications older than 30 days are automatically archived. You can still view them but they will not appear in your unread count.',
      },
    ],
  },
  {
    slug: 'notifications/email-notifications',
    title: 'Email Notifications',
    description: 'How email notifications work and how to configure them.',
    category: 'Notifications',
    categorySlug: 'notifications',
    keywords: ['email notifications', 'email alerts', 'email settings'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'In addition to in-app notifications, Tetri Copilot can send email notifications for important events. You can choose which events trigger email alerts in your Notification Preferences.',
      },
      {
        type: 'text',
        title: 'Email Notification Categories',
        content:
          'You can enable or disable email notifications for these categories: Invoice reminders and overdue alerts, Expense approval requests, Compliance deadline reminders, Payment confirmations, Workspace announcements, and Security alerts.',
      },
      {
        type: 'steps',
        title: 'How to Configure Email Notifications',
        items: [
          'Click your avatar in the top right.',
          'Select Notification Preferences.',
          'Or go to Settings → Notifications in the sidebar.',
          'Toggle each notification type on or off.',
          'Click Save Preferences.',
        ],
      },
    ],
  },
  {
    slug: 'notifications/preferences',
    title: 'Notification Preferences',
    description: 'How to customize which notifications you receive.',
    category: 'Notifications',
    categorySlug: 'notifications',
    keywords: ['notification preferences', 'notification settings', 'customize notifications', 'mute'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Notification Preferences let you control exactly which events trigger in-app alerts and which trigger emails. This is a personal setting — each workspace member has their own preferences.',
      },
      {
        type: 'steps',
        title: 'How to Access Notification Preferences',
        items: [
          'Click your user avatar in the top right.',
          'Select Notification Preferences from the dropdown.',
          'Or navigate to Settings → Notifications.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'Workspace-level notification rules (such as compliance reminders) are managed by Admins and Owners in Settings → Reminder Rules. Your personal preferences only affect what you receive, not what gets sent workspace-wide.',
      },
    ],
  },
  {
    slug: 'notifications/announcements',
    title: 'Announcements',
    description: 'How workspace announcements work in Tetri Copilot.',
    category: 'Notifications',
    categorySlug: 'notifications',
    keywords: ['announcements', 'workspace announcements', 'broadcast', 'message'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Announcements are broadcast messages sent to all workspace members. They are used to communicate important workspace-level information — such as policy changes, system updates, or compliance reminders from management.',
      },
      {
        type: 'steps',
        title: 'How to Send an Announcement',
        items: [
          'Go to Settings → Announcements in the sidebar.',
          'Click Create Announcement.',
          'Write your announcement message.',
          'Choose the audience (all members, specific roles).',
          'Choose the delivery method (in-app, email, or both).',
          'Click Send.',
          'All selected members receive the announcement notification immediately.',
        ],
      },
    ],
  },
]
