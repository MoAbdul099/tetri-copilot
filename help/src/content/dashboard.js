export const articles = [
  {
    slug: 'dashboard/overview',
    title: 'Dashboard Overview',
    description: 'A guide to the Tetri Copilot Dashboard and what each section shows.',
    category: 'Dashboard',
    categorySlug: 'dashboard',
    keywords: ['dashboard', 'overview', 'home', 'kpi', 'metrics', 'summary'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Dashboard is the first page you see after signing in. It provides a real-time snapshot of your business health — including revenue, outstanding invoices, recent expenses, and compliance status. Everything on the Dashboard updates automatically as you add or change records.',
      },
      {
        type: 'steps',
        title: 'How to Open the Dashboard',
        items: [
          'Sign in to Tetri Copilot.',
          'The Dashboard opens automatically.',
          'To return to it at any time, click Dashboard in the left sidebar or click the Tetri Copilot logo.',
        ],
      },
      {
        type: 'fields',
        title: 'Dashboard Sections',
        rows: [
          { field: 'KPI Cards', required: false, description: 'Top-row summary cards showing total revenue, total expenses, outstanding invoices, and overdue amount.', example: 'Total Revenue: £45,200' },
          { field: 'Revenue Chart', required: false, description: 'A line or bar chart showing revenue trends over the past 30, 60, or 90 days.', example: '' },
          { field: 'Recent Invoices', required: false, description: 'A list of your most recently created or updated invoices with their status.', example: '' },
          { field: 'Recent Expenses', required: false, description: 'A list of your most recently added expenses.', example: '' },
          { field: 'Compliance Alerts', required: false, description: 'Upcoming compliance deadlines and overdue items shown as alerts.', example: 'VAT Return due in 5 days' },
          { field: 'Upcoming Payments', required: false, description: 'Invoices due soon or overdue, sorted by due date.', example: '' },
          { field: 'AI Insights', required: false, description: 'AI-generated observations about your business trends and recommended actions.', example: 'Expenses increased 12% this month' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'Click on any dashboard widget to navigate directly to the related page. For example, clicking on "Overdue Invoices" takes you to the Invoices page filtered to show overdue records.',
      },
      {
        type: 'related',
        links: [
          { slug: 'dashboard/key-metrics', title: 'Key Metrics' },
          { slug: 'reports-analytics/reports-overview', title: 'Reports Overview' },
          { slug: 'ai-assistant/overview', title: 'AI Assistant Overview' },
        ],
      },
    ],
  },
  {
    slug: 'dashboard/key-metrics',
    title: 'Key Metrics',
    description: 'Understand the KPI cards and financial metrics shown on the Dashboard.',
    category: 'Dashboard',
    categorySlug: 'dashboard',
    keywords: ['kpi', 'metrics', 'revenue', 'expenses', 'outstanding', 'overdue'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The KPI (Key Performance Indicator) cards at the top of the Dashboard give you an instant view of the numbers that matter most to your business operations.',
      },
      {
        type: 'fields',
        title: 'KPI Card Descriptions',
        rows: [
          { field: 'Total Revenue', required: false, description: 'The total value of all paid invoices for the current period.', example: '£45,200' },
          { field: 'Total Expenses', required: false, description: 'The total amount of all approved and paid expenses for the current period.', example: '£12,400' },
          { field: 'Outstanding Invoices', required: false, description: 'The total value of invoices that have been sent but not yet paid.', example: '£8,750' },
          { field: 'Overdue Amount', required: false, description: 'The total value of invoices that are past their due date.', example: '£2,100' },
          { field: 'Pending Expenses', required: false, description: 'The number of expenses waiting for approval.', example: '3 pending' },
          { field: 'Compliance Score', required: false, description: 'An AI-calculated score (0–100) reflecting how up to date your compliance obligations are.', example: '87 / 100' },
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content:
          'The period shown on KPI cards defaults to the current calendar month. You can change the reporting period using the date range selector at the top of the Dashboard.',
      },
    ],
  },
  {
    slug: 'dashboard/widgets',
    title: 'Activity Widgets',
    description: 'How to use the activity widgets on the Dashboard.',
    category: 'Dashboard',
    categorySlug: 'dashboard',
    keywords: ['widgets', 'activity', 'dashboard sections', 'charts'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Below the KPI cards, the Dashboard shows several activity widgets. Each widget focuses on a specific area of your business and links through to the relevant module for more detail.',
      },
      {
        type: 'fields',
        title: 'Available Widgets',
        rows: [
          { field: 'Revenue Trend', required: false, description: 'A chart showing your revenue over time. Helps identify growth patterns and seasonal trends.', example: '' },
          { field: 'Expense Breakdown', required: false, description: 'A breakdown of your spending by category for the current period.', example: '' },
          { field: 'Invoice Pipeline', required: false, description: 'A view of invoices at each status stage — Draft, Sent, Paid, Overdue.', example: '' },
          { field: 'Compliance Upcoming', required: false, description: 'The next 5 compliance deadlines, sorted by due date.', example: '' },
          { field: 'Recent Activity', required: false, description: 'A live feed of the most recent actions taken in your workspace.', example: '' },
        ],
      },
    ],
  },
  {
    slug: 'dashboard/quick-actions',
    title: 'Quick Actions',
    description: 'Use the Quick Actions on the Dashboard to jump to common tasks instantly.',
    category: 'Dashboard',
    categorySlug: 'dashboard',
    keywords: ['quick actions', 'shortcut', 'create invoice', 'add expense', 'fast'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Quick Actions let you jump straight to key workflows without navigating through the sidebar. They appear on the Dashboard and save time for your most common daily tasks.',
      },
      {
        type: 'fields',
        title: 'Available Quick Actions',
        rows: [
          { field: 'Create Invoice', required: false, description: 'Opens the Create Invoice form directly.', example: '' },
          { field: 'Add Expense', required: false, description: 'Opens the Add Expense form directly.', example: '' },
          { field: 'Add Customer', required: false, description: 'Opens the Add Customer form directly.', example: '' },
          { field: 'Record Payment', required: false, description: 'Opens the Record Payment dialog.', example: '' },
          { field: 'Ask AI', required: false, description: 'Opens the AI Assistant widget.', example: '' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'workflows/send-invoice', title: 'Create and Send an Invoice' },
          { slug: 'workflows/add-expense', title: 'Add and Categorize an Expense' },
        ],
      },
    ],
  },
]
