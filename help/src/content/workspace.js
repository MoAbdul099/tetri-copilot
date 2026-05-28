export const articles = [
  {
    slug: 'workspace/overview',
    title: 'Workspace Overview',
    description: 'What a workspace is in Tetri Copilot and how it relates to your company.',
    category: 'Workspace & Company Setup',
    categorySlug: 'workspace',
    keywords: ['workspace', 'company', 'organization', 'tenant', 'overview'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'A workspace in Tetri Copilot represents your company or organization. All your customers, invoices, expenses, compliance records, and team members belong to your workspace. If you operate multiple companies, each company has its own separate workspace.',
      },
      {
        type: 'text',
        title: 'Workspace Isolation',
        content:
          'Data from one workspace is never visible to users of another workspace. This ensures complete data security and separation between organizations. Each workspace has its own settings, members, billing plan, and operational data.',
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          'If you need to manage multiple businesses, you can create separate workspaces for each. Contact Support for guidance on multi-workspace setups.',
      },
      {
        type: 'related',
        links: [
          { slug: 'workspace/company-profile', title: 'Company Profile' },
          { slug: 'workspace/members', title: 'Members and Access' },
        ],
      },
    ],
  },
  {
    slug: 'workspace/company-profile',
    title: 'Company Profile',
    description: 'How to set up and update your company profile in Tetri Copilot.',
    category: 'Workspace & Company Setup',
    categorySlug: 'workspace',
    keywords: ['company profile', 'business name', 'address', 'tax number', 'company setup'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Your company profile contains the core business information that appears on invoices, documents, and compliance records. Keeping this accurate ensures your documents look professional and your compliance tracking is correct.',
      },
      {
        type: 'steps',
        title: 'How to Update Your Company Profile',
        items: [
          'Go to Settings in the left sidebar.',
          'Click General.',
          'You will see the Company Profile section.',
          'Update the fields as needed.',
          'Click Save Changes.',
        ],
      },
      {
        type: 'fields',
        title: 'Company Profile Fields',
        rows: [
          { field: 'Company Name', required: true, description: 'Your legal or trading name. Appears on all invoices and documents.', example: 'Acme Trading Ltd' },
          { field: 'Email', required: false, description: 'Your business contact email. Used in automated communications.', example: 'info@acme.com' },
          { field: 'Phone', required: false, description: 'Your business phone number.', example: '+44 20 7946 0958' },
          { field: 'Address', required: false, description: 'Your registered business address. Printed on invoices.', example: '123 Business St, London, UK' },
          { field: 'Tax / VAT Number', required: false, description: 'Your tax registration number. Printed on invoices if provided.', example: 'GB123456789' },
          { field: 'Registration Number', required: false, description: 'Your company registration number (Companies House number in the UK, etc.).', example: '12345678' },
          { field: 'Industry', required: false, description: 'Your business sector. Used for compliance pack recommendations.', example: 'Professional Services' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'workspace/localization', title: 'Country, Currency & Language' },
          { slug: 'settings/general', title: 'General Settings' },
        ],
      },
    ],
  },
  {
    slug: 'workspace/localization',
    title: 'Country, Currency and Language',
    description: 'How to set your workspace country, currency, and language preferences.',
    category: 'Workspace & Company Setup',
    categorySlug: 'workspace',
    keywords: ['currency', 'country', 'language', 'locale', 'localization', 'timezone'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Your workspace localization settings determine how dates, currency amounts, and compliance obligations are displayed and calculated throughout the platform.',
      },
      {
        type: 'fields',
        title: 'Localization Settings',
        rows: [
          { field: 'Country', required: true, description: 'Your business country. Used to determine applicable compliance packs and default tax rules.', example: 'United Kingdom' },
          { field: 'Currency', required: true, description: 'Your primary currency for invoices and financial reporting.', example: 'GBP (£)' },
          { field: 'Language', required: false, description: 'The display language for the application interface.', example: 'English (UK)' },
          { field: 'Date Format', required: false, description: 'How dates are displayed across the platform.', example: 'DD/MM/YYYY' },
          { field: 'Timezone', required: false, description: 'Used for scheduling reminders and deadline notifications.', example: 'Europe/London' },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'Changing the currency after you have already created invoices or expenses is not recommended. Historical records will still show the currency at the time they were created. Contact Support before making this change if you have existing data.',
      },
    ],
  },
  {
    slug: 'workspace/members',
    title: 'Members and Access',
    description: 'How to invite team members and manage their roles and access.',
    category: 'Workspace & Company Setup',
    categorySlug: 'workspace',
    keywords: ['members', 'invite', 'team', 'roles', 'access', 'permissions', 'users'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Members page shows all users who have access to your workspace. You can invite new members, change their roles, or remove them at any time. Only Owners and Admins can manage members.',
      },
      {
        type: 'steps',
        title: 'How to Invite a Team Member',
        items: [
          'Go to Settings in the sidebar.',
          'Click Members (or go to the Members page directly).',
          'Click the Invite Member button.',
          'Enter the person\'s email address.',
          'Select their role (Admin, User, or Viewer).',
          'Click Send Invitation.',
          'The person receives an email invitation. Once they accept, they appear in your Members list.',
        ],
      },
      {
        type: 'fields',
        title: 'Member Actions',
        rows: [
          { field: 'Invite Member', required: false, description: 'Send an invitation email to a new user.', example: '' },
          { field: 'Change Role', required: false, description: 'Update a member\'s role at any time. Click the role dropdown next to their name.', example: '' },
          { field: 'Remove Member', required: false, description: 'Remove a member\'s access. They will no longer be able to sign in to this workspace.', example: '' },
          { field: 'Resend Invitation', required: false, description: 'If an invitation expires, you can resend it from the pending invitations list.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          'Invitation links expire after 7 days. If a member has not accepted their invitation, use the Resend option to send a fresh link.',
      },
      {
        type: 'related',
        links: [
          { slug: 'getting-started/user-roles', title: 'User Roles and Access Levels' },
          { slug: 'workflows/invite-member', title: 'Invite a Team Member (Workflow)' },
        ],
      },
    ],
  },
  {
    slug: 'workspace/workspace-settings',
    title: 'Workspace Settings',
    description: 'How to manage general workspace settings and configurations.',
    category: 'Workspace & Company Setup',
    categorySlug: 'workspace',
    keywords: ['workspace settings', 'configure', 'settings', 'general settings'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Workspace settings let you configure how the platform behaves for your organization. This includes invoice numbering, default payment terms, and compliance preferences.',
      },
      {
        type: 'fields',
        title: 'Workspace Settings Options',
        rows: [
          { field: 'Invoice Number Prefix', required: false, description: 'A prefix added to all invoice numbers (e.g., INV-). Helps identify your invoices easily.', example: 'INV-' },
          { field: 'Default Payment Terms', required: false, description: 'The default number of days for invoice payment (e.g., Net 30). Applied automatically when creating new invoices.', example: '30 days' },
          { field: 'Fiscal Year Start', required: false, description: 'The month your financial year begins. Used in reporting and analytics.', example: 'April (UK tax year)' },
          { field: 'Default Tax Rate', required: false, description: 'The default tax percentage applied to new invoice line items.', example: '20% (VAT)' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'workspace/company-profile', title: 'Company Profile' },
          { slug: 'settings/general', title: 'General Settings' },
        ],
      },
    ],
  },
]
