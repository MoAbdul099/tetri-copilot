const prisma  = require('../../lib/prisma');
const repo    = require('./assistant.repository');

const QUICK_PROMPTS = [
  { id: 'overview',          label: 'Business Overview',          prompt: 'Give me a complete business overview for this workspace including revenue, expenses, and key metrics.' },
  { id: 'invoices_overdue',  label: 'Outstanding Invoices',       prompt: 'Show me all outstanding and overdue invoices.' },
  { id: 'expenses_pending',  label: 'Expenses Awaiting Approval', prompt: 'What expenses are currently awaiting approval?' },
  { id: 'compliance',        label: 'Compliance Status',          prompt: 'What compliance deadlines are coming up this week and this month?' },
  { id: 'customers',         label: 'Customer Insights',          prompt: 'Who are our top customers and which customers have overdue balances?' },
  { id: 'revenue',           label: 'Revenue Overview',           prompt: 'Summarize our revenue and payments received this month.' },
  { id: 'payments',          label: 'Payment Summary',            prompt: 'Show me recent payments and any unallocated amounts.' },
  { id: 'activity',          label: "Today's Activity",           prompt: "What has happened in our workspace today?" },
];

async function getQuickPrompts() {
  return QUICK_PROMPTS;
}

async function generateSuggestions(workspaceId) {
  const suggestions = [];
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 3600_000);

  try {
    const [overdueInvoices, pendingExpenses, complianceDue] = await Promise.all([
      prisma.invoice.count({ where: { workspaceId, status: 'overdue' } }),
      prisma.expense.count({ where: { workspaceId, status: 'submitted', isDeleted: false } }),
      prisma.complianceOccurrence.count({ where: { workspaceId, dueDate: { gte: now, lte: weekEnd }, status: { notIn: ['completed', 'cancelled'] } } }),
    ]);

    if (overdueInvoices > 0) {
      suggestions.push({
        suggestionType: 'alert',
        content: { title: 'Overdue Invoices', body: `${overdueInvoices} invoice${overdueInvoices > 1 ? 's are' : ' is'} overdue.`, prompt: 'Show me all overdue invoices.', icon: 'file-text' },
        status: 'active',
      });
    }
    if (pendingExpenses > 0) {
      suggestions.push({
        suggestionType: 'action',
        content: { title: 'Expenses Pending Approval', body: `${pendingExpenses} expense${pendingExpenses > 1 ? 's need' : ' needs'} approval.`, prompt: 'What expenses are awaiting approval?', icon: 'check-square' },
        status: 'active',
      });
    }
    if (complianceDue > 0) {
      suggestions.push({
        suggestionType: 'alert',
        content: { title: 'Compliance Deadlines', body: `${complianceDue} compliance item${complianceDue > 1 ? 's are' : ' is'} due this week.`, prompt: 'Show compliance deadlines due this week.', icon: 'shield-check' },
        status: 'active',
      });
    }
  } catch {
    // non-critical; return empty on DB error
  }

  await repo.upsertSuggestions(workspaceId, suggestions);
  return suggestions;
}

module.exports = { getQuickPrompts, generateSuggestions };
