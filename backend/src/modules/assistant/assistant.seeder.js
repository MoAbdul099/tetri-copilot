const prisma = require('../../lib/prisma');

const CAPABILITIES = [
  { capabilityCode: 'search_invoices',     capabilityName: 'Search Invoices',              module: 'invoices',    permissionScope: 'invoices:read',     enabled: true },
  { capabilityCode: 'search_payments',     capabilityName: 'Search Payments',              module: 'payments',    permissionScope: 'payments:read',     enabled: true },
  { capabilityCode: 'search_expenses',     capabilityName: 'Search Expenses',              module: 'expenses',    permissionScope: 'expenses:read',     enabled: true },
  { capabilityCode: 'search_customers',    capabilityName: 'Search Customers',             module: 'customers',   permissionScope: 'customers:read',    enabled: true },
  { capabilityCode: 'search_compliance',   capabilityName: 'Search Compliance Activities', module: 'compliance',  permissionScope: 'compliance:read',   enabled: true },
  { capabilityCode: 'workspace_summary',   capabilityName: 'Generate Workspace Summary',   module: 'dashboard',   permissionScope: 'dashboard:read',    enabled: true },
  { capabilityCode: 'revenue_summary',     capabilityName: 'Generate Revenue Summary',     module: 'invoices',    permissionScope: 'invoices:read',     enabled: true },
];

const ACTIONS = [
  { actionCode: 'send_reminder',    actionName: 'Send Payment Reminder',  description: 'Send reminder emails to customers with overdue invoices', riskLevel: 'medium', confirmationRequired: true,  enabled: false },
  { actionCode: 'approve_expense',  actionName: 'Approve Expense',        description: 'Approve a submitted expense record',                       riskLevel: 'medium', confirmationRequired: true,  enabled: false },
  { actionCode: 'create_invoice',   actionName: 'Create Invoice',         description: 'Create a new invoice for a customer',                      riskLevel: 'high',   confirmationRequired: true,  enabled: false },
  { actionCode: 'create_expense',   actionName: 'Create Expense',         description: 'Create a new expense record',                              riskLevel: 'medium', confirmationRequired: true,  enabled: false },
  { actionCode: 'create_customer',  actionName: 'Create Customer',        description: 'Create a new customer profile',                            riskLevel: 'low',    confirmationRequired: false, enabled: false },
];

const GOVERNANCE_RULES = [
  { ruleName: 'Prompt Injection Guard',    ruleType: 'security',    configuration: { patterns: ['ignore.*instructions', 'you are now', 'system prompt', 'reveal.*prompt', 'DAN mode'] }, enabled: true },
  { ruleName: 'Write Operation Block',     ruleType: 'read_only',   configuration: { message: 'This assistant operates in read-only mode.' },                                             enabled: true },
  { ruleName: 'Credential Leak Detection', ruleType: 'data_safety', configuration: { patterns: ['password', 'secret', 'api_key', 'token', 'private_key'] },                              enabled: true },
  { ruleName: 'Response Length Limit',     ruleType: 'output',      configuration: { maxTokens: 1500 },                                                                                   enabled: true },
  { ruleName: 'Workspace Isolation',       ruleType: 'tenant',      configuration: { enforce: true },                                                                                     enabled: true },
];

let seeded = false;

async function seedAssistantData() {
  if (seeded) return;
  seeded = true;

  try {
    for (const cap of CAPABILITIES) {
      await prisma.aiCapabilityRegistry.upsert({
        where: { capabilityCode: cap.capabilityCode },
        update: { capabilityName: cap.capabilityName, module: cap.module, permissionScope: cap.permissionScope },
        create: cap,
      });
    }

    for (const action of ACTIONS) {
      await prisma.aiActionRegistry.upsert({
        where: { actionCode: action.actionCode },
        update: { actionName: action.actionName, description: action.description, riskLevel: action.riskLevel },
        create: action,
      });
    }

    for (const rule of GOVERNANCE_RULES) {
      await prisma.aiGovernanceRule.upsert({
        where: { ruleName: rule.ruleName },
        update: { configuration: rule.configuration, enabled: rule.enabled },
        create: rule,
      });
    }
  } catch {
    // non-blocking
  }
}

module.exports = { seedAssistantData };
