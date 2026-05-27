const prisma    = require('../../lib/prisma');
const registry  = require('./action.registry');
const actionRepo = require('./action.repository');

const fmt  = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date();

// ── Navigation help responses ─────────────────────────────────────────────────

const NAV_GUIDES = [
  { patterns: ['create invoice', 'new invoice', 'add invoice', 'issue invoice'],           text: 'To create an invoice, go to **Invoices** in the sidebar → click **+ New Invoice** in the top right.' },
  { patterns: ['record payment', 'add payment', 'log payment'],                            text: 'To record a payment, go to **Payments** → click **+ Record Payment**, or open any invoice and click **Record Payment** from there.' },
  { patterns: ['create expense', 'add expense', 'new expense', 'log expense'],             text: 'To add an expense, go to **Expenses** in the sidebar → click **+ New Expense**.' },
  { patterns: ['add customer', 'new customer', 'create customer', 'invite customer'],      text: 'To add a customer, go to **Customers** in the sidebar → click **+ New Customer**.' },
  { patterns: ['compliance', 'filing', 'deadline', 'obligation'],                          text: 'The **Compliance Calendar** is in the sidebar under Compliance. You can view deadlines, mark obligations complete, and see overdue items.' },
  { patterns: ['upload file', 'attach file', 'add file'],                                  text: 'Files can be uploaded in the **Files** section in the sidebar, or attached directly to invoices, expenses, and other records.' },
  { patterns: ['report', 'analytics', 'export data'],                                      text: 'Reports and analytics are in the **Reports** section. You can generate standard financial reports and export them as CSV or Excel.' },
  { patterns: ['dashboard', 'overview', 'kpi'],                                            text: 'The **Dashboard** gives you a real-time view of KPIs — revenue, receivables, expenses, and compliance status.' },
  { patterns: ['settings', 'configure', 'setup', 'configuration'],                        text: 'Workspace settings are under **Settings** in the sidebar. You can manage your company profile, localization, and integrations.' },
  { patterns: ['invite', 'team member', 'add user', 'add member'],                        text: 'To invite a team member, go to **Settings → Team Members** → click **+ Invite Member** and choose their role.' },
  { patterns: ['approve expense', 'expense approval'],                                     text: 'Expense approvals are managed under **Expenses → Approvals**. Submitted expenses appear there for review.' },
  { patterns: ['remind', 'notification', 'alert'],                                         text: 'Notifications and reminders are configured under **Settings → Notifications**. The bell icon in the top bar shows active alerts.' },
];

function navigationResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  for (const guide of NAV_GUIDES) {
    if (guide.patterns.some((p) => msg.includes(p))) return guide.text;
  }
  return 'I can help you navigate Tetri Copilot. Try asking something like "How do I create an invoice?", "Where is compliance?", or "How do I invite a team member?"';
}

// ── New 15.3 data fetchers ────────────────────────────────────────────────────

async function fetchCustomerTop(wid) {
  const rows = await prisma.invoice.groupBy({
    by:      ['customerId'],
    where:   { workspaceId: wid, status: { in: ['paid', 'sent', 'overdue'] } },
    _sum:    { totalAmount: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
    take:    10,
  });
  if (!rows.length) return { text: 'No customer invoice data available.', count: 0 };
  const customerIds = rows.map((r) => r.customerId).filter(Boolean);
  const customers   = await prisma.customer.findMany({
    where:  { id: { in: customerIds }, workspaceId: wid },
    select: { id: true, name: true, status: true },
  });
  const byId = Object.fromEntries(customers.map((c) => [c.id, c]));
  const lines = rows.map((r, i) => {
    const name = byId[r.customerId]?.name || 'Unknown';
    return `  ${i + 1}. ${name}: $${fmt(r._sum.totalAmount || 0)}`;
  });
  return { text: `Top Customers by Invoice Volume:\n${lines.join('\n')}`, count: rows.length };
}

async function fetchInvoiceAging(wid) {
  const now  = today();
  const d30  = new Date(now.getTime() - 30  * 86400_000);
  const d60  = new Date(now.getTime() - 60  * 86400_000);
  const d90  = new Date(now.getTime() - 90  * 86400_000);
  const base = { workspaceId: wid, status: { in: ['sent', 'overdue'] } };

  const [current, days30, days60, days90, days90plus] = await Promise.all([
    prisma.invoice.aggregate({ where: { ...base, dueDate: { gte: now }                          }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.invoice.aggregate({ where: { ...base, dueDate: { gte: d30, lt: now }                 }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.invoice.aggregate({ where: { ...base, dueDate: { gte: d60, lt: d30 }                 }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.invoice.aggregate({ where: { ...base, dueDate: { gte: d90, lt: d60 }                 }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.invoice.aggregate({ where: { ...base, dueDate: { lt: d90 }                           }, _sum: { totalAmount: true }, _count: { id: true } }),
  ]);

  const total = (current._count.id + days30._count.id + days60._count.id + days90._count.id + days90plus._count.id);
  return {
    text: [
      `Invoice Aging Analysis (${total} open invoices):`,
      `  - Current (not yet due):      ${current._count.id} invoices — $${fmt(current._sum.totalAmount || 0)}`,
      `  - 1–30 days overdue:          ${days30._count.id} invoices — $${fmt(days30._sum.totalAmount || 0)}`,
      `  - 31–60 days overdue:         ${days60._count.id} invoices — $${fmt(days60._sum.totalAmount || 0)}`,
      `  - 61–90 days overdue:         ${days90._count.id} invoices — $${fmt(days90._sum.totalAmount || 0)}`,
      `  - 90+ days overdue:           ${days90plus._count.id} invoices — $${fmt(days90plus._sum.totalAmount || 0)}`,
    ].join('\n'),
    count: total,
  };
}

async function fetchCollectionPerformance(wid) {
  const [invoiced, collected, payments] = await Promise.all([
    prisma.invoice.aggregate({ where: { workspaceId: wid }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, status: 'paid' }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted' }, _sum: { amount: true }, _count: { id: true } }),
  ]);
  const rate = invoiced._sum.totalAmount > 0
    ? ((collected._sum.totalAmount || 0) / invoiced._sum.totalAmount * 100).toFixed(1)
    : '0.0';
  return {
    text: [
      `Collection Performance:`,
      `  - Total invoiced:      $${fmt(invoiced._sum.totalAmount || 0)} across ${invoiced._count.id} invoices`,
      `  - Total collected:     $${fmt(collected._sum.totalAmount || 0)} (${rate}% collection rate)`,
      `  - Total payments posted: ${payments._count.id} payments, $${fmt(payments._sum.amount || 0)}`,
      `  - Outstanding balance: $${fmt((invoiced._sum.totalAmount || 0) - (collected._sum.totalAmount || 0))}`,
    ].join('\n'),
    count: payments._count.id,
  };
}

async function fetchExpenseByCategory(wid) {
  const monthStart = new Date(today().getFullYear(), today().getMonth(), 1);
  const rows = await prisma.expense.groupBy({
    by:      ['categoryId'],
    where:   { workspaceId: wid, isDeleted: false, expenseDate: { gte: monthStart } },
    _sum:    { amount: true },
    _count:  { id: true },
    orderBy: { _sum: { amount: 'desc' } },
    take:    10,
  });
  if (!rows.length) return { text: 'No expense category data for this month.', count: 0 };
  const catIds = rows.map((r) => r.categoryId).filter(Boolean);
  const cats   = await prisma.expenseCategory.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true } });
  const byId   = Object.fromEntries(cats.map((c) => [c.id, c]));
  const lines  = rows.map((r, i) => {
    const name = (r.categoryId && byId[r.categoryId]?.name) || 'Uncategorised';
    return `  ${i + 1}. ${name}: $${fmt(r._sum.amount || 0)} (${r._count.id} expenses)`;
  });
  return { text: `Expenses by Category (this month):\n${lines.join('\n')}`, count: rows.length };
}

async function fetchExpenseTop(wid) {
  const rows = await prisma.expense.findMany({
    where:   { workspaceId: wid, isDeleted: false },
    include: { category: { select: { name: true } } },
    orderBy: { amount: 'desc' },
    take:    10,
  });
  if (!rows.length) return { text: 'No expenses found.', count: 0 };
  const lines = rows.map((r, i) =>
    `  ${i + 1}. ${r.description?.substring(0, 40) || 'Expense'} — $${fmt(r.amount)} (${r.category?.name || 'N/A'}, ${r.expenseDate?.toISOString().slice(0, 10) || ''})`
  );
  return { text: `Top Expenses by Amount:\n${lines.join('\n')}`, count: rows.length };
}

async function fetchFinancialSummary(wid) {
  const now        = today();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart  = new Date(now.getFullYear(), 0, 1);

  const [invoicedMtd, collectedMtd, expensesMtd, invoicedYtd, collectedYtd, expensesYtd, outstanding] = await Promise.all([
    prisma.invoice.aggregate({ where: { workspaceId: wid, createdAt: { gte: monthStart }                }, _sum: { totalAmount: true } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, status: 'paid', updatedAt: { gte: monthStart }}, _sum: { totalAmount: true } }),
    prisma.expense.aggregate({ where: { workspaceId: wid, isDeleted: false, expenseDate: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, createdAt: { gte: yearStart }                  }, _sum: { totalAmount: true } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, status: 'paid', updatedAt: { gte: yearStart }  }, _sum: { totalAmount: true } }),
    prisma.expense.aggregate({ where: { workspaceId: wid, isDeleted: false, expenseDate: { gte: yearStart } }, _sum: { amount: true } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, status: { in: ['sent', 'overdue'] }             }, _sum: { totalAmount: true } }),
  ]);

  return {
    text: [
      `Financial Summary (${now.toISOString().slice(0, 10)}):`,
      ``,
      `  This Month:`,
      `  - Invoiced:    $${fmt(invoicedMtd._sum.totalAmount || 0)}`,
      `  - Collected:   $${fmt(collectedMtd._sum.totalAmount || 0)}`,
      `  - Expenses:    $${fmt(expensesMtd._sum.amount || 0)}`,
      `  - Net (est.):  $${fmt((collectedMtd._sum.totalAmount || 0) - (expensesMtd._sum.amount || 0))}`,
      ``,
      `  Year-to-Date:`,
      `  - Invoiced:    $${fmt(invoicedYtd._sum.totalAmount || 0)}`,
      `  - Collected:   $${fmt(collectedYtd._sum.totalAmount || 0)}`,
      `  - Expenses:    $${fmt(expensesYtd._sum.amount || 0)}`,
      `  - Net (est.):  $${fmt((collectedYtd._sum.totalAmount || 0) - (expensesYtd._sum.amount || 0))}`,
      ``,
      `  Outstanding receivables: $${fmt(outstanding._sum.totalAmount || 0)}`,
    ].join('\n'),
    count: 0,
  };
}

async function fetchMonthlyComparison(wid) {
  const now          = today();
  const thisStart    = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd      = thisStart;

  const [invThis, invLast, expThis, expLast, custThis, custLast, payThis, payLast] = await Promise.all([
    prisma.invoice.aggregate({ where: { workspaceId: wid, createdAt: { gte: thisStart }                }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, createdAt: { gte: lastStart, lt: lastEnd }   }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.expense.aggregate({ where: { workspaceId: wid, isDeleted: false, expenseDate: { gte: thisStart }             }, _sum: { amount: true }, _count: { id: true } }),
    prisma.expense.aggregate({ where: { workspaceId: wid, isDeleted: false, expenseDate: { gte: lastStart, lt: lastEnd }}, _sum: { amount: true }, _count: { id: true } }),
    prisma.customer.count({    where: { workspaceId: wid, createdAt: { gte: thisStart }                } }),
    prisma.customer.count({    where: { workspaceId: wid, createdAt: { gte: lastStart, lt: lastEnd }   } }),
    prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted', paymentDate: { gte: thisStart }             }, _sum: { amount: true }, _count: { id: true } }),
    prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted', paymentDate: { gte: lastStart, lt: lastEnd }}, _sum: { amount: true }, _count: { id: true } }),
  ]);

  const diff = (a, b) => {
    if (b === 0) return a > 0 ? '▲ new' : '—';
    const pct = ((a - b) / b * 100).toFixed(0);
    return `${pct > 0 ? '▲' : pct < 0 ? '▼' : '—'} ${Math.abs(pct)}%`;
  };

  const thisMonth = now.toLocaleString('default', { month: 'long' });
  const lastMonth = new Date(lastStart).toLocaleString('default', { month: 'long' });

  return {
    text: [
      `Month-over-Month Comparison (${lastMonth} vs ${thisMonth}):`,
      ``,
      `  Invoiced:        $${fmt(invLast._sum.totalAmount || 0)} → $${fmt(invThis._sum.totalAmount || 0)} ${diff(invThis._sum.totalAmount || 0, invLast._sum.totalAmount || 0)}`,
      `  Invoices issued: ${invLast._count.id} → ${invThis._count.id} ${diff(invThis._count.id, invLast._count.id)}`,
      `  Payments in:     $${fmt(payLast._sum.amount || 0)} → $${fmt(payThis._sum.amount || 0)} ${diff(payThis._sum.amount || 0, payLast._sum.amount || 0)}`,
      `  Expenses:        $${fmt(expLast._sum.amount || 0)} → $${fmt(expThis._sum.amount || 0)} ${diff(expThis._sum.amount || 0, expLast._sum.amount || 0)}`,
      `  New customers:   ${custLast} → ${custThis} ${diff(custThis, custLast)}`,
    ].join('\n'),
    count: 0,
  };
}

async function fetchExecSummary(wid) {
  const now        = today();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekEnd    = new Date(now.getTime() + 7 * 86400_000);

  const [invoiceOverdue, expensePending, complianceDue, customers, paymentsMonth, outstanding, members] = await Promise.all([
    prisma.invoice.aggregate({ where: { workspaceId: wid, status: 'overdue' }, _sum: { totalAmount: true }, _count: { id: true } }),
    prisma.expense.count({ where: { workspaceId: wid, status: 'submitted', isDeleted: false } }),
    prisma.complianceOccurrence.count({ where: { workspaceId: wid, dueDate: { gte: now, lte: weekEnd }, status: { notIn: ['completed', 'cancelled'] } } }),
    prisma.customer.count({ where: { workspaceId: wid, status: 'active' } }),
    prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted', paymentDate: { gte: monthStart } }, _sum: { amount: true }, _count: { id: true } }),
    prisma.invoice.aggregate({ where: { workspaceId: wid, status: { in: ['sent', 'overdue'] } }, _sum: { totalAmount: true } }),
    prisma.workspaceMember.count({ where: { workspaceId: wid, status: 'active' } }).catch(() => 0),
  ]);

  const alerts = [];
  if (invoiceOverdue._count.id > 0) alerts.push(`⚠ ${invoiceOverdue._count.id} overdue invoices ($${fmt(invoiceOverdue._sum.totalAmount || 0)})`);
  if (expensePending > 0)           alerts.push(`⚠ ${expensePending} expenses awaiting approval`);
  if (complianceDue > 0)            alerts.push(`⚠ ${complianceDue} compliance deadlines due this week`);

  return {
    text: [
      `Executive Summary — ${now.toISOString().slice(0, 10)}:`,
      ``,
      `  Business:`,
      `  - Active customers:     ${customers}`,
      `  - Team members:         ${members}`,
      `  - Outstanding AR:       $${fmt(outstanding._sum.totalAmount || 0)}`,
      `  - Payments this month:  ${paymentsMonth._count.id} payments ($${fmt(paymentsMonth._sum.amount || 0)})`,
      ``,
      ...(alerts.length ? ['  Attention Required:', ...alerts.map((a) => `  ${a}`), ''] : ['  No urgent alerts.', '']),
    ].join('\n'),
    count: 0,
  };
}

async function fetchWorkspaceStatus(wid) {
  const [members, company, workspace] = await Promise.all([
    prisma.workspaceMember.groupBy({ by: ['role'], where: { workspaceId: wid, status: 'active' }, _count: { id: true } }).catch(() => []),
    prisma.company.findFirst({ where: { workspaceId: wid }, select: { name: true, industry: true, country: true } }).catch(() => null),
    prisma.workspace.findUnique({ where: { id: wid }, select: { name: true, createdAt: true } }).catch(() => null),
  ]);
  const total   = members.reduce((s, m) => s + m._count.id, 0);
  const byRole  = members.map((m) => `${m._count.id} ${m.role}`).join(', ');
  const created = workspace?.createdAt ? workspace.createdAt.toISOString().slice(0, 10) : 'N/A';
  return {
    text: [
      `Workspace Status:`,
      `  - Name:     ${workspace?.name || 'N/A'}`,
      `  - Company:  ${company?.name || 'N/A'}`,
      `  - Industry: ${company?.industry || 'N/A'}`,
      `  - Country:  ${company?.country || 'N/A'}`,
      `  - Created:  ${created}`,
      `  - Team:     ${total} active member${total !== 1 ? 's' : ''} (${byRole || 'N/A'})`,
    ].join('\n'),
    count: total,
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

const FETCHERS = {
  customer_top:          fetchCustomerTop,
  customer_inactive:     null, // lightweight — no specific enrichment needed
  invoice_aging:         fetchInvoiceAging,
  invoice_paid_recent:   null,
  collection_performance: fetchCollectionPerformance,
  expense_by_category:   fetchExpenseByCategory,
  expense_top:           fetchExpenseTop,
  financial_summary:     fetchFinancialSummary,
  compare_monthly:       fetchMonthlyComparison,
  exec_summary:          fetchExecSummary,
  workspace_status:      fetchWorkspaceStatus,
};

// ── Main entry ────────────────────────────────────────────────────────────────

async function detectAndEnrich({ userMessage, workspaceId, existingIntents = [], existingContextText }) {
  const start = Date.now();

  // Detect primary action
  const detected = registry.detect(userMessage);
  const fallback = registry.resolveFromContext(existingIntents);

  const actionMeta = detected || fallback || { code: 'general_query', name: 'General Query', category: 'general' };

  let additionalContext   = null;
  let additionalSources   = [];
  let recordsRetrieved    = 0;

  // Navigation help — static response, no DB
  if (detected?.code === 'navigation_help') {
    additionalContext = `[NAVIGATION GUIDANCE]\n${navigationResponse(userMessage)}`;
    additionalSources = [{ type: 'help', name: 'Navigation Help', routePath: null, count: 0 }];
  }

  // Recommendations are generated by recommendation.service and injected by assistant.service

  // New 15.3 data fetchers
  const fetcher = FETCHERS[detected?.code];
  if (fetcher) {
    try {
      const result = await fetcher(workspaceId);
      if (result.text) {
        additionalContext = result.text;
        recordsRetrieved = result.count || 0;
        additionalSources = [{
          type:      detected.category,
          name:      detected.name,
          routePath: `/${detected.category}`,
          count:     recordsRetrieved,
        }];
      }
    } catch { /* non-blocking — AI will still respond */ }
  }

  return {
    actionCode:       actionMeta.code,
    actionName:       actionMeta.name,
    actionCategory:   actionMeta.category,
    additionalContext,
    additionalSources,
    recordsRetrieved,
    executionMs:      Date.now() - start,
  };
}

async function logAction(params) {
  return actionRepo.logAction(params).catch(() => {});
}

module.exports = { detectAndEnrich, logAction };
