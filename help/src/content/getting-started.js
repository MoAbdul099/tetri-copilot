export const articles = [
  {
    slug: 'getting-started/welcome',
    title: 'Welcome to Tetri Copilot',
    description: 'An overview of what Tetri Copilot is and who it is for.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
    keywords: ['welcome', 'overview', 'introduction', 'what is tetri copilot', 'getting started'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Tetri Copilot is an AI-powered operating assistant designed for small and medium businesses. It brings together finance operations, invoicing, expense management, compliance tracking, and AI-powered automation in one clean, modern platform. Whether you are a business owner, finance manager, or operations team member, Tetri Copilot is designed to help you work faster and smarter.',
      },
      {
        type: 'text',
        title: 'What Makes Tetri Copilot Different',
        content:
          'Most accounting or finance tools require manual data entry and provide no intelligent guidance. Tetri Copilot uses AI throughout the platform to help you categorize expenses automatically, generate professional documents, stay on top of compliance deadlines, and get instant answers about your business data — all without needing a dedicated finance team.',
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'If this is your first time using Tetri Copilot, start with the Workspace Setup Overview to configure your company profile, then move on to adding your first customer and creating an invoice.',
      },
      {
        type: 'steps',
        title: 'Recommended Getting Started Path',
        items: [
          'Sign up and verify your email address.',
          'Complete the workspace setup wizard — enter your company name, country, currency, and tax details.',
          'Invite your team members if needed.',
          'Add your first customer.',
          'Create and send your first invoice.',
          'Add an expense record.',
          'Explore the AI Assistant for help with any task.',
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'getting-started/first-login', title: 'First Login' },
          { slug: 'getting-started/workspace-setup-overview', title: 'Workspace Setup Overview' },
          { slug: 'getting-started/user-roles', title: 'User Roles and Access Levels' },
        ],
      },
    ],
  },
  {
    slug: 'getting-started/what-tetri-does',
    title: 'What Tetri Copilot Does',
    description: 'A complete overview of all Tetri Copilot modules and capabilities.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
    keywords: ['features', 'modules', 'capabilities', 'what can tetri do', 'overview'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Tetri Copilot covers the core operational needs of a growing business. Here is a summary of everything the platform can do.',
      },
      {
        type: 'fields',
        title: 'Platform Modules',
        rows: [
          { field: 'Dashboard', required: false, description: 'Live overview of your key business metrics — revenue, expenses, outstanding invoices, and compliance status.', example: '' },
          { field: 'Customers', required: false, description: 'Manage your customer database. Store contact details, track activity, and view invoice history per customer.', example: '' },
          { field: 'Invoices', required: false, description: 'Create professional invoices, track statuses (Draft, Sent, Paid, Overdue), and manage line items.', example: '' },
          { field: 'Payments', required: false, description: 'Record customer payments, allocate payments to invoices, and track outstanding balances.', example: '' },
          { field: 'Receivables', required: false, description: 'Monitor outstanding amounts owed to you. View aging reports and follow up on overdue invoices.', example: '' },
          { field: 'Expenses', required: false, description: 'Track all business expenses with categories, attachments, approval workflows, and AI categorization.', example: '' },
          { field: 'Compliance', required: false, description: 'Track regulatory obligations, filing deadlines, tax reminders, and compliance history via templates and a calendar view.', example: '' },
          { field: 'AI Assistant', required: false, description: 'Ask natural language questions about your workspace data. Get AI-powered answers about invoices, expenses, and compliance.', example: '' },
          { field: 'Reports & Analytics', required: false, description: 'Generate standard reports (P&L, expense summaries, receivables aging), export to CSV/Excel, and view AI-powered forecasts.', example: '' },
          { field: 'Notifications', required: false, description: 'Receive alerts for overdue invoices, upcoming compliance deadlines, expense approvals, and system events.', example: '' },
          { field: 'Documents', required: false, description: 'Upload and manage files. Generate AI-powered business documents from templates.', example: '' },
          { field: 'Settings', required: false, description: 'Configure your workspace, members, billing, email templates, notification preferences, and more.', example: '' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'getting-started/welcome', title: 'Welcome to Tetri Copilot' },
          { slug: 'getting-started/user-roles', title: 'User Roles and Access Levels' },
        ],
      },
    ],
  },
  {
    slug: 'getting-started/user-roles',
    title: 'User Roles and Access Levels',
    description: 'Understand the different user roles in Tetri Copilot and what each role can access.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
    keywords: ['roles', 'permissions', 'access', 'owner', 'admin', 'user', 'viewer'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Tetri Copilot uses a role-based access system. Every workspace member is assigned a role that determines what they can see and do inside the platform. This helps you control who can make changes to sensitive data.',
      },
      {
        type: 'fields',
        title: 'Roles Overview',
        rows: [
          { field: 'Owner', required: false, description: 'Full access to everything, including billing, workspace deletion, and all settings. There is one owner per workspace.', example: 'Business owner, founder' },
          { field: 'Admin', required: false, description: 'Full access to all operational features. Can manage members and settings but cannot access billing or delete the workspace.', example: 'Operations manager, finance director' },
          { field: 'User', required: false, description: 'Can access operational features like invoices, expenses, and compliance but cannot manage workspace settings or members.', example: 'Accountant, finance team member' },
          { field: 'Viewer', required: false, description: 'Read-only access. Can view records but cannot create, edit, or delete anything.', example: 'Auditor, external consultant' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          'Roles are assigned when you invite a member to your workspace. The workspace owner can change any member\'s role at any time from the Members page under Settings.',
      },
      {
        type: 'text',
        title: 'Which Pages Are Restricted',
        content:
          'Pages like Billing, Audit Logs, System Status, AI Platform Settings, and Security are restricted to Owners and Admins. Regular Users and Viewers will not see these menu items. If you need access to a restricted page, ask your workspace Admin or Owner to update your role.',
      },
      {
        type: 'related',
        links: [
          { slug: 'workspace/members', title: 'Members and Access' },
          { slug: 'settings/members-roles', title: 'Members and Roles Settings' },
        ],
      },
    ],
  },
  {
    slug: 'getting-started/first-login',
    title: 'First Login',
    description: 'What to expect when you log in to Tetri Copilot for the first time.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
    keywords: ['first login', 'onboarding', 'getting started', 'setup wizard'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'When you first log in to Tetri Copilot, you will be guided through a short workspace setup process. This takes about 2–3 minutes and ensures the platform is configured for your business.',
      },
      {
        type: 'steps',
        title: 'What Happens at First Login',
        items: [
          'You land on the sign-in page at app.tetrisuite.com.',
          'Enter your email and password, or use the magic link option.',
          'After authentication, you are taken to the workspace setup wizard.',
          'Enter your company name, select your country, and choose your currency.',
          'Optionally add your tax registration number and compliance jurisdiction.',
          'Click Finish Setup to enter the main application.',
          'You are now on the Dashboard — your operational command center.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'If you were invited by another workspace owner, you will skip the setup wizard and go directly to the Dashboard after accepting the invitation.',
      },
      {
        type: 'related',
        links: [
          { slug: 'account/sign-in', title: 'Sign In' },
          { slug: 'getting-started/workspace-setup-overview', title: 'Workspace Setup Overview' },
          { slug: 'dashboard/overview', title: 'Dashboard Overview' },
        ],
      },
    ],
  },
  {
    slug: 'getting-started/workspace-setup-overview',
    title: 'Workspace Setup Overview',
    description: 'How to complete the initial workspace setup for your company.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
    keywords: ['workspace', 'setup', 'company', 'configure', 'onboarding'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The workspace is your company\'s environment inside Tetri Copilot. Every record — invoices, expenses, customers, and compliance items — belongs to your workspace. A complete workspace setup ensures correct currency formatting, tax calculations, and compliance tracking.',
      },
      {
        type: 'fields',
        title: 'Setup Steps',
        rows: [
          { field: 'Company Name', required: true, description: 'Your legal or trading business name. Appears on invoices and documents.', example: 'Acme Trading Ltd' },
          { field: 'Country', required: true, description: 'Your business country. Used for currency defaults and compliance jurisdiction.', example: 'United Kingdom' },
          { field: 'Currency', required: true, description: 'Your primary billing and reporting currency.', example: 'GBP' },
          { field: 'Tax Number', required: false, description: 'Your VAT, GST, or tax registration number. Printed on invoices if provided.', example: 'GB123456789' },
          { field: 'Language', required: false, description: 'The language for the application interface.', example: 'English' },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'Choose your currency carefully. Changing the workspace currency after creating invoices and expenses can cause reporting inconsistencies. If you need to change it, contact Support first.',
      },
      {
        type: 'related',
        links: [
          { slug: 'workspace/company-profile', title: 'Company Profile' },
          { slug: 'workspace/localization', title: 'Country, Currency & Language' },
          { slug: 'workspace/members', title: 'Members and Access' },
        ],
      },
    ],
  },
  {
    slug: 'getting-started/basic-navigation',
    title: 'Basic Navigation',
    description: 'How to navigate around Tetri Copilot — sidebar, menus, and key pages.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
    keywords: ['navigation', 'sidebar', 'menu', 'how to navigate', 'layout'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Tetri Copilot uses a left sidebar for navigation. The sidebar is divided into groups of related features. Click a group header to expand it and see its individual pages.',
      },
      {
        type: 'fields',
        title: 'Navigation Elements',
        rows: [
          { field: 'Logo / Home', required: false, description: 'The Tetri Copilot logo at the top of the sidebar. Click it to go to the Dashboard.', example: '' },
          { field: 'Sidebar Groups', required: false, description: 'Grouped navigation sections — Revenue, Expenses, Compliance, Documents, etc. Click the group name to expand or collapse it.', example: 'Revenue → Invoices' },
          { field: 'Active Link', required: false, description: 'The currently active page is highlighted in blue in the sidebar.', example: '' },
          { field: 'Top Bar', required: false, description: 'The horizontal bar at the top shows your workspace name, a notification bell, and your user avatar.', example: '' },
          { field: 'Notification Bell', required: false, description: 'Click the bell icon in the top bar to see recent notifications.', example: '' },
          { field: 'User Menu', required: false, description: 'Click your avatar or name in the top bar to access notification preferences or sign out.', example: '' },
          { field: 'AI Assistant Button', required: false, description: 'A floating button in the bottom-right corner opens the AI Assistant widget.', example: '' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'On mobile devices, the sidebar is hidden by default. Tap the menu icon (three horizontal lines) in the top-left corner to open it.',
      },
      {
        type: 'related',
        links: [
          { slug: 'dashboard/overview', title: 'Dashboard Overview' },
          { slug: 'ai-assistant/overview', title: 'AI Assistant Overview' },
        ],
      },
    ],
  },
]
