// Central read-only action catalog for Slice 15.3

const ACTIONS = [
  // ── Customer ─────────────────────────────────────────────────────────────────
  {
    code:     'customer_top',
    name:     'Top Customers by Revenue',
    category: 'customers',
    patterns: ['top customer', 'biggest customer', 'largest customer', 'best customer', 'highest revenue customer', 'most valuable customer', 'revenue by customer'],
  },
  {
    code:     'customer_inactive',
    name:     'Inactive Customer Review',
    category: 'customers',
    patterns: ['inactive customer', 'no invoice customer', 'lost customer', 'churned customer', 'customer with no invoice', 'customers without'],
  },

  // ── Invoice ──────────────────────────────────────────────────────────────────
  {
    code:     'invoice_aging',
    name:     'Invoice Aging Analysis',
    category: 'invoices',
    patterns: ['invoice aging', 'aging report', 'aging analysis', '30 days', '60 days', '90 days', 'days overdue', 'aging bucket'],
  },
  {
    code:     'invoice_paid_recent',
    name:     'Recently Collected Invoices',
    category: 'invoices',
    patterns: ['paid invoice', 'collected invoice', 'invoice paid this month', 'recently paid', 'payment collected'],
  },

  // ── Payments ─────────────────────────────────────────────────────────────────
  {
    code:     'collection_performance',
    name:     'Collection Performance',
    category: 'payments',
    patterns: ['collection rate', 'collection performance', 'payment rate', 'collection efficiency', 'how fast', 'days to pay', 'average payment time'],
  },

  // ── Expenses ─────────────────────────────────────────────────────────────────
  {
    code:     'expense_by_category',
    name:     'Expenses by Category',
    category: 'expenses',
    patterns: ['expense by category', 'category spending', 'spending category', 'expense breakdown', 'top expense category', 'biggest expense category', 'expense split'],
  },
  {
    code:     'expense_top',
    name:     'Largest Expenses',
    category: 'expenses',
    patterns: ['largest expense', 'biggest expense', 'top expense', 'highest expense', 'most expensive', 'expense list'],
  },

  // ── Dashboard / Analytics ────────────────────────────────────────────────────
  {
    code:     'financial_summary',
    name:     'Financial Summary',
    category: 'dashboard',
    patterns: ['financial summary', 'revenue summary', 'p&l', 'profit and loss', 'income and expense', 'financial overview', 'financial health', 'financial position'],
  },
  {
    code:     'compare_monthly',
    name:     'Month-over-Month Comparison',
    category: 'analytics',
    patterns: ['compare month', 'month over month', 'last month vs this month', 'compared to last month', 'month comparison', 'vs last month', 'previous month'],
  },
  {
    code:     'exec_summary',
    name:     'Executive Summary',
    category: 'dashboard',
    patterns: ['executive summary', 'business summary', 'status report', 'business status', 'management summary', 'state of the business', 'give me a summary'],
  },

  // ── Workspace ────────────────────────────────────────────────────────────────
  {
    code:     'workspace_status',
    name:     'Workspace Status',
    category: 'workspace',
    patterns: ['workspace status', 'team status', 'how many user', 'user count', 'member count', 'workspace info', 'workspace detail', 'team size'],
  },

  // ── Help / Navigation ────────────────────────────────────────────────────────
  {
    code:     'navigation_help',
    name:     'Navigation Assistance',
    category: 'help',
    patterns: ['how to', 'how do i', 'where is', 'where can i', 'how can i', 'where do i', 'how to create', 'how to find', 'navigate to', 'where to find'],
  },

  // ── Recommendations ──────────────────────────────────────────────────────────
  {
    code:     'recommendations',
    name:     'Workspace Recommendations',
    category: 'recommendations',
    patterns: ['recommendation', 'what should i do', 'priorities', 'what needs attention', 'action items', 'what should i focus', 'what is urgent', 'what is important', 'suggest'],
  },
];

// Fallback codes that map context.service intents to action registry codes
const CONTEXT_TO_ACTION = {
  invoice_specific:    { code: 'invoice_lookup',      name: 'Invoice Lookup',        category: 'invoices'    },
  customer_specific:   { code: 'customer_lookup',     name: 'Customer Lookup',       category: 'customers'   },
  invoices_overdue:    { code: 'invoice_overdue',     name: 'Overdue Invoices',      category: 'invoices'    },
  invoices_recent:     { code: 'invoice_recent',      name: 'Recent Invoices',       category: 'invoices'    },
  invoices_general:    { code: 'invoice_summary',     name: 'Invoice Summary',       category: 'invoices'    },
  payments_general:    { code: 'payment_summary',     name: 'Payment Summary',       category: 'payments'    },
  expenses_pending:    { code: 'expense_pending',     name: 'Pending Expenses',      category: 'expenses'    },
  expenses_general:    { code: 'expense_summary',     name: 'Expense Summary',       category: 'expenses'    },
  customers_general:   { code: 'customer_summary',   name: 'Customer Summary',      category: 'customers'   },
  compliance_upcoming: { code: 'compliance_upcoming', name: 'Upcoming Compliance',   category: 'compliance'  },
  compliance_overdue:  { code: 'compliance_overdue',  name: 'Overdue Compliance',    category: 'compliance'  },
  compliance_general:  { code: 'compliance_summary',  name: 'Compliance Summary',    category: 'compliance'  },
  workspace_summary:   { code: 'workspace_overview',  name: 'Workspace Overview',    category: 'dashboard'   },
  reports:             { code: 'reports',              name: 'Reports',               category: 'reports'     },
};

function detect(userMessage) {
  const msg = userMessage.toLowerCase();
  for (const action of ACTIONS) {
    if (action.patterns.some((p) => msg.includes(p))) return action;
  }
  return null;
}

function resolveFromContext(intents = []) {
  for (const intent of intents) {
    if (CONTEXT_TO_ACTION[intent]) return CONTEXT_TO_ACTION[intent];
  }
  return null;
}

module.exports = { ACTIONS, CONTEXT_TO_ACTION, detect, resolveFromContext };
