export const articles = [
  {
    slug: 'expenses/overview',
    title: 'Expenses Overview',
    description: 'How the Expenses module works in Tetri Copilot.',
    category: 'Expenses',
    categorySlug: 'expenses',
    keywords: ['expenses', 'spending', 'costs', 'overview', 'expense management'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Expenses module lets you record, categorize, and manage all business expenses. You can attach receipts, route expenses for approval, track reimbursements, and get AI-powered categorization suggestions. The Expenses module connects to budgets, analytics, and compliance reporting.',
      },
      {
        type: 'steps',
        title: 'How to Open Expenses',
        items: [
          'In the left sidebar, expand the Expenses group.',
          'Click Expenses.',
          'You see a list of all expense records.',
        ],
      },
      {
        type: 'fields',
        title: 'Expense List Columns',
        rows: [
          { field: 'Date', required: false, description: 'The date the expense was incurred.', example: '15 May 2026' },
          { field: 'Supplier', required: false, description: 'Who the expense was paid to.', example: 'Office Depot' },
          { field: 'Category', required: false, description: 'The expense category (e.g., Office Supplies, Travel, Software).', example: 'Software Subscriptions' },
          { field: 'Amount', required: false, description: 'The expense amount.', example: '£250.00' },
          { field: 'Status', required: false, description: 'Current approval/payment status.', example: 'Approved' },
          { field: 'Actions', required: false, description: 'Options to view, edit, or delete the expense record.', example: '' },
        ],
      },
      {
        type: 'related',
        links: [
          { slug: 'expenses/add-expense', title: 'Add an Expense' },
          { slug: 'expenses/categories', title: 'Expense Categories' },
          { slug: 'expenses/approvals', title: 'Approvals and Reimbursements' },
        ],
      },
    ],
  },
  {
    slug: 'expenses/add-expense',
    title: 'Add an Expense',
    description: 'How to record a new expense in Tetri Copilot.',
    category: 'Expenses',
    categorySlug: 'expenses',
    keywords: ['add expense', 'record expense', 'new expense', 'enter expense', 'receipt'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Recording an expense takes about 30 seconds. At minimum you need a date, amount, and category. You can also attach a receipt photo or file for full documentation.',
      },
      {
        type: 'steps',
        title: 'How to Add an Expense',
        items: [
          'Go to Expenses → Expenses in the sidebar.',
          'Click Add Expense (top right).',
          'Fill in the expense details (see fields below).',
          'Optionally upload a receipt or document.',
          'Click Save to record the expense.',
          'If your workspace uses approval workflows, the expense will be submitted for approval automatically.',
        ],
      },
      {
        type: 'fields',
        title: 'Expense Form Fields',
        rows: [
          { field: 'Date', required: true, description: 'The date the expense was incurred (not necessarily the date you are entering it).', example: '15 May 2026' },
          { field: 'Amount', required: true, description: 'The total expense amount.', example: '£85.50' },
          { field: 'Currency', required: false, description: 'The currency of the expense. Defaults to workspace currency.', example: 'GBP' },
          { field: 'Category', required: true, description: 'Select the expense category. The AI may suggest one automatically.', example: 'Travel & Transport' },
          { field: 'Supplier', required: false, description: 'Who you paid (vendor or supplier name).', example: 'British Rail' },
          { field: 'Description', required: false, description: 'A brief description of what the expense was for.', example: 'Train to client meeting in Manchester' },
          { field: 'Tax Amount', required: false, description: 'The VAT or tax portion of the expense.', example: '£14.25' },
          { field: 'Receipt', required: false, description: 'Upload a photo or PDF of the receipt. Strongly recommended for audit purposes.', example: 'receipt-may-15.pdf' },
          { field: 'Notes', required: false, description: 'Any additional notes for approvers or your own reference.', example: 'Client meeting with Acme Ltd' },
          { field: 'Billable', required: false, description: 'Mark if this expense should be billed to a customer (for pass-through billing).', example: 'Yes — bill to ABC Trading' },
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        content:
          'After you fill in the amount and supplier, the AI Expense Categorization feature will suggest a category. You can accept or override this suggestion.',
      },
      {
        type: 'related',
        links: [
          { slug: 'expenses/categories', title: 'Expense Categories' },
          { slug: 'expenses/approvals', title: 'Approvals and Reimbursements' },
          { slug: 'ai-assistant/expense-categorization', title: 'AI Expense Categorization' },
          { slug: 'workflows/add-expense', title: 'Add and Categorize an Expense (Workflow)' },
        ],
      },
    ],
  },
  {
    slug: 'expenses/categories',
    title: 'Expense Categories',
    description: 'How to manage expense categories in Tetri Copilot.',
    category: 'Expenses',
    categorySlug: 'expenses',
    keywords: ['expense categories', 'category', 'categorize', 'classify expenses'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Expense categories help you organize your spending for reporting and analysis. Tetri Copilot comes with a set of standard categories, and you can create custom ones to match your business needs.',
      },
      {
        type: 'text',
        title: 'Default Categories',
        content:
          'Tetri Copilot includes common categories such as: Travel & Transport, Office Supplies, Software & Subscriptions, Marketing & Advertising, Professional Services, Meals & Entertainment, Utilities, Payroll, Equipment, and Other. These cover most SME expense types out of the box.',
      },
      {
        type: 'steps',
        title: 'How to Add a Custom Category',
        items: [
          'Go to Settings in the sidebar.',
          'Look for Expense Categories in the settings menu.',
          'Click Add Category.',
          'Enter a name for the category.',
          'Optionally set a budget limit for this category.',
          'Click Save.',
          'The new category is now available when adding expenses.',
        ],
      },
    ],
  },
  {
    slug: 'expenses/approvals',
    title: 'Approvals and Reimbursements',
    description: 'How expense approvals and employee reimbursements work in Tetri Copilot.',
    category: 'Expenses',
    categorySlug: 'expenses',
    keywords: ['approvals', 'approve expense', 'reimbursement', 'expense approval workflow'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'If your workspace has approval workflows configured, expenses above certain thresholds or in certain categories must be approved before they are recorded. Approvers are notified automatically.',
      },
      {
        type: 'fields',
        title: 'Expense Statuses',
        rows: [
          { field: 'Draft', required: false, description: 'Saved but not yet submitted for approval.', example: '' },
          { field: 'Pending', required: false, description: 'Submitted and waiting for an approver to review.', example: '' },
          { field: 'Approved', required: false, description: 'Approved by the designated approver.', example: '' },
          { field: 'Rejected', required: false, description: 'Rejected by the approver. A reason should be provided.', example: '' },
          { field: 'Reimbursed', required: false, description: 'The expense has been approved and the employee has been reimbursed.', example: '' },
        ],
      },
      {
        type: 'steps',
        title: 'How to Approve an Expense',
        items: [
          'Go to Expenses → Approvals in the sidebar.',
          'You see a list of expenses waiting for your approval.',
          'Click on an expense to review the details and attached receipts.',
          'Click Approve or Reject.',
          'If rejecting, enter a reason.',
          'The submitter is notified of the outcome automatically.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        content: 'Only users with Approver permissions can approve expenses. Approver status is configured by Owners and Admins in the approval rules settings.',
      },
    ],
  },
  {
    slug: 'expenses/budgets',
    title: 'Budgets',
    description: 'How to set and monitor expense budgets in Tetri Copilot.',
    category: 'Expenses',
    categorySlug: 'expenses',
    keywords: ['budget', 'spending limit', 'budget tracking', 'budget management'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Budgets let you set spending limits by category or department. Tetri Copilot tracks actual spending against your budgets and alerts you when you are approaching or exceeding limits.',
      },
      {
        type: 'steps',
        title: 'How to Set a Budget',
        items: [
          'Go to Expenses → Budgets in the sidebar.',
          'Click Add Budget.',
          'Select the expense category.',
          'Enter the budget amount and the period (monthly or annual).',
          'Set the alert threshold (e.g., alert at 80% usage).',
          'Click Save.',
        ],
      },
    ],
  },
  {
    slug: 'expenses/recurring',
    title: 'Recurring Expenses',
    description: 'How to set up recurring expenses that are automatically recorded each period.',
    category: 'Expenses',
    categorySlug: 'expenses',
    keywords: ['recurring expenses', 'repeat expenses', 'subscriptions', 'automatic expenses'],
    roles: ['Owner', 'Admin', 'User'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'Recurring expenses are bills that repeat on a regular schedule — monthly subscriptions, rent, utilities, etc. Instead of manually adding them each period, you can set them up once and Tetri Copilot will create the expense record automatically.',
      },
      {
        type: 'steps',
        title: 'How to Set Up a Recurring Expense',
        items: [
          'Go to Expenses → Recurring in the sidebar.',
          'Click Add Recurring Expense.',
          'Fill in the expense details as normal.',
          'Set the frequency (weekly, monthly, quarterly, annually).',
          'Set the start date.',
          'Optionally set an end date.',
          'Click Save.',
          'The expense will be automatically created on schedule.',
        ],
      },
    ],
  },
  {
    slug: 'expenses/insights',
    title: 'Expense Insights',
    description: 'How to use AI-powered expense insights and analytics.',
    category: 'Expenses',
    categorySlug: 'expenses',
    keywords: ['expense insights', 'analytics', 'spending trends', 'ai insights', 'expense report'],
    roles: ['Owner', 'Admin'],
    lastUpdated: 'May 2026',
    sections: [
      {
        type: 'overview',
        content:
          'The Expense Insights page uses AI to analyze your spending patterns and surface useful observations. It identifies trends, anomalies, and cost-saving opportunities automatically.',
      },
      {
        type: 'fields',
        title: 'Insights Available',
        rows: [
          { field: 'Spending Trends', required: false, description: 'Charts showing how your spending by category has changed over time.', example: '' },
          { field: 'Top Vendors', required: false, description: 'Your highest spending suppliers, ranked by total amount.', example: '' },
          { field: 'Anomaly Detection', required: false, description: 'Unusual expenses that are significantly above your normal pattern are flagged automatically.', example: 'Software spend 200% above average this month' },
          { field: 'AI Recommendations', required: false, description: 'Suggestions for reducing costs or improving categorization accuracy.', example: '' },
          { field: 'Forecast', required: false, description: 'Projected expenses for the next 30–90 days based on historical patterns.', example: '' },
        ],
      },
    ],
  },
]
