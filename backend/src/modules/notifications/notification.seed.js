const prisma = require('../../lib/prisma');

const CATEGORIES = [
  { code: 'security',   name: 'Security',    description: 'Authentication and account security events',          iconKey: 'ShieldAlert',  colorKey: 'red',     defaultPriority: 'critical', isActive: true, isMandatory: true  },
  { code: 'workspace',  name: 'Workspace',   description: 'Workspace and user management activity',              iconKey: 'Building2',    colorKey: 'slate',   defaultPriority: 'medium',   isActive: true, isMandatory: false },
  { code: 'billing',    name: 'Billing',     description: 'Subscription, plan, and payment events',              iconKey: 'CreditCard',   colorKey: 'violet',  defaultPriority: 'high',     isActive: true, isMandatory: true  },
  { code: 'customer',   name: 'Customer',    description: 'Customer lifecycle events',                           iconKey: 'Users',        colorKey: 'blue',    defaultPriority: 'low',      isActive: true, isMandatory: false },
  { code: 'invoice',    name: 'Invoice',     description: 'Invoice and receivable events',                       iconKey: 'FileText',     colorKey: 'blue',    defaultPriority: 'medium',   isActive: true, isMandatory: false },
  { code: 'payment',    name: 'Payment',     description: 'Payment and allocation events',                       iconKey: 'CreditCard',   colorKey: 'green',   defaultPriority: 'medium',   isActive: true, isMandatory: false },
  { code: 'expense',    name: 'Expense',     description: 'Expense lifecycle events',                            iconKey: 'ShoppingCart', colorKey: 'orange',  defaultPriority: 'medium',   isActive: true, isMandatory: false },
  { code: 'approval',   name: 'Approval',    description: 'Approval requests and decisions',                     iconKey: 'CheckSquare',  colorKey: 'amber',   defaultPriority: 'high',     isActive: true, isMandatory: false },
  { code: 'file',       name: 'File',        description: 'File upload and attachment events',                   iconKey: 'FolderOpen',   colorKey: 'teal',    defaultPriority: 'low',      isActive: true, isMandatory: false },
  { code: 'compliance', name: 'Compliance',  description: 'Compliance calendar and task events',                 iconKey: 'ShieldCheck',  colorKey: 'emerald', defaultPriority: 'high',     isActive: true, isMandatory: true  },
  { code: 'system',     name: 'System',      description: 'General system notices',                              iconKey: 'Bell',         colorKey: 'slate',   defaultPriority: 'medium',   isActive: true, isMandatory: false },
  { code: 'ai',         name: 'AI',          description: 'AI-generated alerts and insights',                    iconKey: 'Brain',        colorKey: 'indigo',  defaultPriority: 'medium',   isActive: true, isMandatory: false },
];

const EVENTS = [
  // Authentication / Security
  { eventCode: 'USER_INVITED',               categoryCode: 'workspace',  sourceModule: 'workspace',   defaultPriority: 'medium',   defaultTitle: 'You have been invited',             defaultMessage: 'You have been invited to join a workspace.' },
  { eventCode: 'USER_ACTIVATED',             categoryCode: 'workspace',  sourceModule: 'workspace',   defaultPriority: 'medium',   defaultTitle: 'User activated',                    defaultMessage: 'A new user has activated their account.' },
  { eventCode: 'PASSWORD_CHANGED',           categoryCode: 'security',   sourceModule: 'security',    defaultPriority: 'critical', defaultTitle: 'Password changed',                  defaultMessage: 'Your account password has been changed.' },
  { eventCode: 'PASSWORD_RESET_REQUESTED',   categoryCode: 'security',   sourceModule: 'security',    defaultPriority: 'high',     defaultTitle: 'Password reset requested',          defaultMessage: 'A password reset has been requested for your account.' },
  { eventCode: 'LOGIN_FROM_NEW_DEVICE',      categoryCode: 'security',   sourceModule: 'security',    defaultPriority: 'critical', defaultTitle: 'New device login',                  defaultMessage: 'Your account was accessed from a new device.' },
  { eventCode: 'ACCOUNT_LOCKED',            categoryCode: 'security',   sourceModule: 'security',    defaultPriority: 'critical', defaultTitle: 'Account locked',                    defaultMessage: 'Your account has been locked.' },
  // Workspace
  { eventCode: 'USER_ROLE_CHANGED',          categoryCode: 'workspace',  sourceModule: 'workspace',   defaultPriority: 'medium',   defaultTitle: 'Your role has changed',             defaultMessage: 'Your workspace role has been updated.' },
  { eventCode: 'USER_DISABLED',              categoryCode: 'workspace',  sourceModule: 'workspace',   defaultPriority: 'medium',   defaultTitle: 'User disabled',                     defaultMessage: 'A workspace member has been disabled.' },
  { eventCode: 'USER_REACTIVATED',           categoryCode: 'workspace',  sourceModule: 'workspace',   defaultPriority: 'medium',   defaultTitle: 'User reactivated',                  defaultMessage: 'A workspace member has been reactivated.' },
  { eventCode: 'WORKSPACE_PROFILE_UPDATED',  categoryCode: 'workspace',  sourceModule: 'workspace',   defaultPriority: 'low',      defaultTitle: 'Workspace profile updated',         defaultMessage: 'The workspace profile has been updated.' },
  { eventCode: 'WORKSPACE_SETTINGS_UPDATED', categoryCode: 'workspace',  sourceModule: 'workspace',   defaultPriority: 'low',      defaultTitle: 'Workspace settings updated',        defaultMessage: 'Workspace settings have been changed.' },
  // Billing
  { eventCode: 'SUBSCRIPTION_CREATED',       categoryCode: 'billing',    sourceModule: 'billing',     defaultPriority: 'medium',   defaultTitle: 'Subscription created',              defaultMessage: 'Your subscription has been created.' },
  { eventCode: 'SUBSCRIPTION_RENEWED',       categoryCode: 'billing',    sourceModule: 'billing',     defaultPriority: 'medium',   defaultTitle: 'Subscription renewed',              defaultMessage: 'Your subscription has been renewed.' },
  { eventCode: 'SUBSCRIPTION_UPGRADED',      categoryCode: 'billing',    sourceModule: 'billing',     defaultPriority: 'medium',   defaultTitle: 'Plan upgraded',                     defaultMessage: 'Your workspace plan has been upgraded.' },
  { eventCode: 'SUBSCRIPTION_DOWNGRADED',    categoryCode: 'billing',    sourceModule: 'billing',     defaultPriority: 'medium',   defaultTitle: 'Plan downgraded',                   defaultMessage: 'Your workspace plan has been downgraded.' },
  { eventCode: 'SUBSCRIPTION_CANCELLED',     categoryCode: 'billing',    sourceModule: 'billing',     defaultPriority: 'high',     defaultTitle: 'Subscription cancelled',            defaultMessage: 'Your subscription has been cancelled.' },
  { eventCode: 'PAYMENT_FAILED',             categoryCode: 'billing',    sourceModule: 'billing',     defaultPriority: 'critical', defaultTitle: 'Payment failed',                    defaultMessage: 'A billing payment has failed. Please update your payment method.' },
  { eventCode: 'PLAN_LIMIT_REACHED',         categoryCode: 'billing',    sourceModule: 'billing',     defaultPriority: 'high',     defaultTitle: 'Plan limit reached',                defaultMessage: 'Your workspace has reached a plan usage limit.' },
  // Customer
  { eventCode: 'CUSTOMER_CREATED',           categoryCode: 'customer',   sourceModule: 'customers',   defaultPriority: 'low',      defaultTitle: 'Customer created',                  defaultMessage: 'A new customer record has been created.' },
  { eventCode: 'CUSTOMER_UPDATED',           categoryCode: 'customer',   sourceModule: 'customers',   defaultPriority: 'low',      defaultTitle: 'Customer updated',                  defaultMessage: 'A customer record has been updated.' },
  { eventCode: 'CUSTOMER_ARCHIVED',          categoryCode: 'customer',   sourceModule: 'customers',   defaultPriority: 'low',      defaultTitle: 'Customer archived',                 defaultMessage: 'A customer record has been archived.' },
  // Invoice & Payment
  { eventCode: 'INVOICE_CREATED',            categoryCode: 'invoice',    sourceModule: 'invoices',    defaultPriority: 'medium',   defaultTitle: 'Invoice created',                   defaultMessage: 'A new invoice has been created.' },
  { eventCode: 'INVOICE_SENT',               categoryCode: 'invoice',    sourceModule: 'invoices',    defaultPriority: 'medium',   defaultTitle: 'Invoice sent',                      defaultMessage: 'An invoice has been sent to the customer.' },
  { eventCode: 'INVOICE_UPDATED',            categoryCode: 'invoice',    sourceModule: 'invoices',    defaultPriority: 'low',      defaultTitle: 'Invoice updated',                   defaultMessage: 'An invoice has been updated.' },
  { eventCode: 'INVOICE_CANCELLED',          categoryCode: 'invoice',    sourceModule: 'invoices',    defaultPriority: 'medium',   defaultTitle: 'Invoice cancelled',                 defaultMessage: 'An invoice has been cancelled.' },
  { eventCode: 'INVOICE_OVERDUE',            categoryCode: 'invoice',    sourceModule: 'invoices',    defaultPriority: 'high',     defaultTitle: 'Invoice overdue',                   defaultMessage: 'An invoice is now overdue.' },
  { eventCode: 'PAYMENT_RECEIVED',           categoryCode: 'payment',    sourceModule: 'payments',    defaultPriority: 'medium',   defaultTitle: 'Payment received',                  defaultMessage: 'A payment has been received.' },
  { eventCode: 'PARTIAL_PAYMENT_RECEIVED',   categoryCode: 'payment',    sourceModule: 'payments',    defaultPriority: 'medium',   defaultTitle: 'Partial payment received',          defaultMessage: 'A partial payment has been received.' },
  { eventCode: 'PAYMENT_ALLOCATED',          categoryCode: 'payment',    sourceModule: 'payments',    defaultPriority: 'low',      defaultTitle: 'Payment allocated',                 defaultMessage: 'A payment has been allocated to an invoice.' },
  // Expense
  { eventCode: 'EXPENSE_SUBMITTED',          categoryCode: 'expense',    sourceModule: 'expenses',    defaultPriority: 'medium',   defaultTitle: 'Expense submitted',                 defaultMessage: 'An expense has been submitted for review.' },
  { eventCode: 'EXPENSE_APPROVAL_REQUIRED',  categoryCode: 'approval',   sourceModule: 'expenses',    defaultPriority: 'high',     defaultTitle: 'Expense approval required',         defaultMessage: 'An expense is waiting for your approval.' },
  { eventCode: 'EXPENSE_APPROVED',           categoryCode: 'expense',    sourceModule: 'expenses',    defaultPriority: 'medium',   defaultTitle: 'Expense approved',                  defaultMessage: 'Your expense has been approved.' },
  { eventCode: 'EXPENSE_REJECTED',           categoryCode: 'expense',    sourceModule: 'expenses',    defaultPriority: 'high',     defaultTitle: 'Expense rejected',                  defaultMessage: 'Your expense has been rejected.' },
  { eventCode: 'EXPENSE_REIMBURSED',         categoryCode: 'expense',    sourceModule: 'expenses',    defaultPriority: 'medium',   defaultTitle: 'Expense reimbursed',                defaultMessage: 'Your expense has been reimbursed.' },
  // File
  { eventCode: 'FILE_UPLOADED',              categoryCode: 'file',       sourceModule: 'files',       defaultPriority: 'low',      defaultTitle: 'File uploaded',                     defaultMessage: 'A new file has been uploaded.' },
  { eventCode: 'FILE_REJECTED',              categoryCode: 'file',       sourceModule: 'files',       defaultPriority: 'high',     defaultTitle: 'File rejected',                     defaultMessage: 'A file upload has been rejected.' },
  { eventCode: 'STORAGE_LIMIT_REACHED',      categoryCode: 'system',     sourceModule: 'files',       defaultPriority: 'high',     defaultTitle: 'Storage limit reached',             defaultMessage: 'Your workspace is approaching its storage limit.' },
  // Compliance
  { eventCode: 'COMPLIANCE_TASK_CREATED',    categoryCode: 'compliance', sourceModule: 'compliance',  defaultPriority: 'medium',   defaultTitle: 'Compliance task created',           defaultMessage: 'A new compliance task has been created.' },
  { eventCode: 'COMPLIANCE_TASK_ASSIGNED',   categoryCode: 'compliance', sourceModule: 'compliance',  defaultPriority: 'high',     defaultTitle: 'Compliance task assigned',          defaultMessage: 'A compliance task has been assigned to you.' },
  { eventCode: 'COMPLIANCE_TASK_DUE_SOON',   categoryCode: 'compliance', sourceModule: 'compliance',  defaultPriority: 'high',     defaultTitle: 'Compliance task due soon',          defaultMessage: 'A compliance task is due soon.' },
  { eventCode: 'COMPLIANCE_TASK_DUE_TODAY',  categoryCode: 'compliance', sourceModule: 'compliance',  defaultPriority: 'high',     defaultTitle: 'Compliance task due today',         defaultMessage: 'A compliance task is due today.' },
  { eventCode: 'COMPLIANCE_TASK_OVERDUE',    categoryCode: 'compliance', sourceModule: 'compliance',  defaultPriority: 'critical', defaultTitle: 'Compliance task overdue',           defaultMessage: 'A compliance task is now overdue.' },
  { eventCode: 'COMPLIANCE_TASK_COMPLETED',  categoryCode: 'compliance', sourceModule: 'compliance',  defaultPriority: 'medium',   defaultTitle: 'Compliance task completed',         defaultMessage: 'A compliance task has been marked as complete.' },
];

const seedNotificationFoundation = async () => {
  console.log('[NotificationSeed] Seeding notification categories…');
  for (const cat of CATEGORIES) {
    await prisma.notificationCategory.upsert({
      where:  { code: cat.code },
      create: cat,
      update: { name: cat.name, description: cat.description, defaultPriority: cat.defaultPriority, isActive: cat.isActive, isMandatory: cat.isMandatory },
    });
  }

  console.log('[NotificationSeed] Seeding notification event registry…');
  for (const evt of EVENTS) {
    await prisma.notificationEventRegistry.upsert({
      where:  { eventCode: evt.eventCode },
      create: evt,
      update: { categoryCode: evt.categoryCode, sourceModule: evt.sourceModule, defaultPriority: evt.defaultPriority, defaultTitle: evt.defaultTitle, defaultMessage: evt.defaultMessage },
    });
  }

  console.log('[NotificationSeed] Seeding workspace notification settings…');
  const workspaces = await prisma.workspace.findMany({ select: { id: true } });
  for (const ws of workspaces) {
    await prisma.workspaceNotificationSettings.upsert({
      where:  { workspaceId: ws.id },
      create: { workspaceId: ws.id },
      update: {},
    });
  }

  console.log('[NotificationSeed] Done.');
};

module.exports = { seedNotificationFoundation };

if (require.main === module) {
  seedNotificationFoundation()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); });
}
