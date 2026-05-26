// Standard domain event name constants
// Convention: <Module>.<Action>  (PascalCase.PascalCase)

const EVENTS = {
  // Authentication
  USER_SIGNED_IN:             'Auth.SignedIn',
  USER_SIGNED_OUT:            'Auth.SignedOut',
  USER_REGISTERED:            'Auth.Registered',
  PASSWORD_RESET_REQUESTED:   'Auth.PasswordResetRequested',

  // Workspace
  WORKSPACE_CREATED:          'Workspace.Created',
  WORKSPACE_UPDATED:          'Workspace.Updated',
  WORKSPACE_SETUP_COMPLETED:  'Workspace.SetupCompleted',

  // Users / Members
  MEMBER_INVITED:             'Members.Invited',
  MEMBER_JOINED:              'Members.Joined',
  MEMBER_REMOVED:             'Members.Removed',
  MEMBER_ROLE_CHANGED:        'Members.RoleChanged',

  // Customers
  CUSTOMER_CREATED:           'Customers.Created',
  CUSTOMER_UPDATED:           'Customers.Updated',
  CUSTOMER_DELETED:           'Customers.Deleted',

  // Invoices
  INVOICE_CREATED:            'Invoices.Created',
  INVOICE_UPDATED:            'Invoices.Updated',
  INVOICE_ISSUED:             'Invoices.Issued',
  INVOICE_PAID:               'Invoices.Paid',
  INVOICE_VOIDED:             'Invoices.Voided',
  INVOICE_DELETED:            'Invoices.Deleted',

  // Payments
  PAYMENT_RECORDED:           'Payments.Recorded',
  PAYMENT_ALLOCATED:          'Payments.Allocated',
  PAYMENT_DELETED:            'Payments.Deleted',

  // Expenses
  EXPENSE_CREATED:            'Expenses.Created',
  EXPENSE_UPDATED:            'Expenses.Updated',
  EXPENSE_SUBMITTED:          'Expenses.Submitted',
  EXPENSE_APPROVED:           'Expenses.Approved',
  EXPENSE_REJECTED:           'Expenses.Rejected',
  EXPENSE_REIMBURSED:         'Expenses.Reimbursed',
  EXPENSE_DELETED:            'Expenses.Deleted',

  // Files
  FILE_UPLOADED:              'Files.Uploaded',
  FILE_DELETED:               'Files.Deleted',

  // Compliance
  COMPLIANCE_TASK_CREATED:    'Compliance.TaskCreated',
  COMPLIANCE_TASK_COMPLETED:  'Compliance.TaskCompleted',
  COMPLIANCE_TASK_OVERDUE:    'Compliance.TaskOverdue',
  COMPLIANCE_TEMPLATE_CREATED:'Compliance.TemplateCreated',

  // Notifications
  NOTIFICATION_SENT:          'Notifications.Sent',

  // Billing / Subscription
  SUBSCRIPTION_CREATED:       'Billing.SubscriptionCreated',
  SUBSCRIPTION_UPDATED:       'Billing.SubscriptionUpdated',
  SUBSCRIPTION_CANCELLED:     'Billing.SubscriptionCancelled',
  PAYMENT_RECEIVED:           'Billing.PaymentReceived',

  // System
  SETTINGS_UPDATED:           'System.SettingsUpdated',
  REPORT_GENERATED:           'System.ReportGenerated',
};

// Map event name → { module, category }
const EVENT_META = {
  'Auth.SignedIn':                     { module: 'authentication', category: 'Authentication' },
  'Auth.SignedOut':                    { module: 'authentication', category: 'Authentication' },
  'Auth.Registered':                   { module: 'authentication', category: 'Authentication' },
  'Auth.PasswordResetRequested':       { module: 'authentication', category: 'Authentication' },
  'Workspace.Created':                 { module: 'workspaces',     category: 'Workspace' },
  'Workspace.Updated':                 { module: 'workspaces',     category: 'Workspace' },
  'Workspace.SetupCompleted':          { module: 'workspaces',     category: 'Workspace' },
  'Members.Invited':                   { module: 'members',        category: 'Users' },
  'Members.Joined':                    { module: 'members',        category: 'Users' },
  'Members.Removed':                   { module: 'members',        category: 'Users' },
  'Members.RoleChanged':               { module: 'members',        category: 'Users' },
  'Customers.Created':                 { module: 'customers',      category: 'Customers' },
  'Customers.Updated':                 { module: 'customers',      category: 'Customers' },
  'Customers.Deleted':                 { module: 'customers',      category: 'Customers' },
  'Invoices.Created':                  { module: 'invoices',       category: 'Invoices' },
  'Invoices.Updated':                  { module: 'invoices',       category: 'Invoices' },
  'Invoices.Issued':                   { module: 'invoices',       category: 'Invoices' },
  'Invoices.Paid':                     { module: 'invoices',       category: 'Invoices' },
  'Invoices.Voided':                   { module: 'invoices',       category: 'Invoices' },
  'Invoices.Deleted':                  { module: 'invoices',       category: 'Invoices' },
  'Payments.Recorded':                 { module: 'payments',       category: 'Payments' },
  'Payments.Allocated':                { module: 'payments',       category: 'Payments' },
  'Payments.Deleted':                  { module: 'payments',       category: 'Payments' },
  'Expenses.Created':                  { module: 'expenses',       category: 'Expenses' },
  'Expenses.Updated':                  { module: 'expenses',       category: 'Expenses' },
  'Expenses.Submitted':                { module: 'expenses',       category: 'Expenses' },
  'Expenses.Approved':                 { module: 'expenses',       category: 'Expenses' },
  'Expenses.Rejected':                 { module: 'expenses',       category: 'Expenses' },
  'Expenses.Reimbursed':               { module: 'expenses',       category: 'Expenses' },
  'Expenses.Deleted':                  { module: 'expenses',       category: 'Expenses' },
  'Files.Uploaded':                    { module: 'files',          category: 'Files' },
  'Files.Deleted':                     { module: 'files',          category: 'Files' },
  'Compliance.TaskCreated':            { module: 'compliance',     category: 'Compliance' },
  'Compliance.TaskCompleted':          { module: 'compliance',     category: 'Compliance' },
  'Compliance.TaskOverdue':            { module: 'compliance',     category: 'Compliance' },
  'Compliance.TemplateCreated':        { module: 'compliance',     category: 'Compliance' },
  'Notifications.Sent':               { module: 'notifications',   category: 'Notifications' },
  'Billing.SubscriptionCreated':       { module: 'billing',        category: 'Subscription' },
  'Billing.SubscriptionUpdated':       { module: 'billing',        category: 'Subscription' },
  'Billing.SubscriptionCancelled':     { module: 'billing',        category: 'Subscription' },
  'Billing.PaymentReceived':           { module: 'billing',        category: 'Billing' },
  'System.SettingsUpdated':            { module: 'settings',       category: 'Administration' },
  'System.ReportGenerated':            { module: 'reports',        category: 'System' },
};

module.exports = { EVENTS, EVENT_META };
