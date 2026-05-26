const prisma = require('../../lib/prisma');

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date();

// ── Intent patterns ───────────────────────────────────────────────────────────

const INTENT_MAP = [
  {
    code: 'invoices_overdue',
    patterns: ['overdue invoice', 'unpaid invoice', 'outstanding invoice', 'past due', 'overdue receivable'],
    fetch: async (wid) => {
      const rows = await prisma.invoice.findMany({
        where: { workspaceId: wid, status: 'overdue' },
        include: { customer: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 10,
      });
      if (!rows.length) return 'No overdue invoices found.';
      const lines = rows.map((r) => `  - ${r.invoiceNumber}: $${fmt(r.totalAmount)} from ${r.customer?.name || 'Unknown'}, due ${r.dueDate?.toISOString().slice(0, 10)}`);
      return `Overdue Invoices (${rows.length}):\n${lines.join('\n')}`;
    },
  },
  {
    code: 'invoices_general',
    patterns: ['invoice', 'billing', 'receivable', 'unpaid'],
    fetch: async (wid) => {
      const [sent, paid, overdue] = await Promise.all([
        prisma.invoice.count({ where: { workspaceId: wid, status: 'sent' } }),
        prisma.invoice.count({ where: { workspaceId: wid, status: 'paid' } }),
        prisma.invoice.count({ where: { workspaceId: wid, status: 'overdue' } }),
      ]);
      const totals = await prisma.invoice.aggregate({ where: { workspaceId: wid, status: { in: ['sent', 'overdue'] } }, _sum: { totalAmount: true, paidAmount: true } });
      return `Invoice Summary:\n  - Sent (awaiting payment): ${sent}\n  - Overdue: ${overdue}\n  - Paid this period: ${paid}\n  - Outstanding balance: $${fmt(totals._sum.totalAmount || 0)}`;
    },
  },
  {
    code: 'payments',
    patterns: ['payment', 'received', 'collected', 'cash received', 'unallocated'],
    fetch: async (wid) => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const [total, unallocated, monthly] = await Promise.all([
        prisma.payment.count({ where: { workspaceId: wid, status: 'posted' } }),
        prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted', unallocatedAmount: { gt: 0 } }, _sum: { unallocatedAmount: true }, _count: { id: true } }),
        prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted', paymentDate: { gte: monthStart } }, _sum: { amount: true }, _count: { id: true } }),
      ]);
      return `Payment Summary:\n  - Total posted payments: ${total}\n  - Received this month: ${monthly._count.id} payments, $${fmt(monthly._sum.amount || 0)}\n  - Unallocated amounts: ${unallocated._count.id} payments, $${fmt(unallocated._sum.unallocatedAmount || 0)}`;
    },
  },
  {
    code: 'expenses_pending',
    patterns: ['expense approval', 'awaiting approval', 'pending expense', 'pending approval'],
    fetch: async (wid) => {
      const rows = await prisma.expense.findMany({
        where: { workspaceId: wid, status: 'submitted', isDeleted: false },
        orderBy: { amount: 'desc' },
        take: 10,
        select: { expenseNumber: true, description: true, amount: true, currencyCode: true },
      });
      if (!rows.length) return 'No expenses awaiting approval.';
      const lines = rows.map((r) => `  - ${r.expenseNumber || 'EXP'}: ${r.description?.substring(0, 40)} — $${fmt(r.amount)}`);
      return `Expenses Awaiting Approval (${rows.length}):\n${lines.join('\n')}`;
    },
  },
  {
    code: 'expenses_general',
    patterns: ['expense', 'spending', 'cost', 'reimburs'],
    fetch: async (wid) => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const [monthly, pending, total] = await Promise.all([
        prisma.expense.aggregate({ where: { workspaceId: wid, isDeleted: false, expenseDate: { gte: monthStart } }, _sum: { amount: true }, _count: { id: true } }),
        prisma.expense.count({ where: { workspaceId: wid, isDeleted: false, status: 'submitted' } }),
        prisma.expense.aggregate({ where: { workspaceId: wid, isDeleted: false }, _sum: { amount: true }, _count: { id: true } }),
      ]);
      return `Expense Summary:\n  - This month: ${monthly._count.id} expenses, $${fmt(monthly._sum.amount || 0)}\n  - Awaiting approval: ${pending}\n  - All time: ${total._count.id} expenses, $${fmt(total._sum.amount || 0)}`;
    },
  },
  {
    code: 'customers',
    patterns: ['customer', 'client', 'top customer', 'customer balance'],
    fetch: async (wid) => {
      const [total, active, top] = await Promise.all([
        prisma.customer.count({ where: { workspaceId: wid } }),
        prisma.customer.count({ where: { workspaceId: wid, status: 'active' } }),
        prisma.customer.findMany({ where: { workspaceId: wid, status: 'active' }, orderBy: { createdAt: 'desc' }, take: 5, select: { name: true, createdAt: true } }),
      ]);
      const topNames = top.map((c) => `  - ${c.name}`).join('\n');
      return `Customer Summary:\n  - Total customers: ${total} (${active} active)\n  - Recent customers:\n${topNames}`;
    },
  },
  {
    code: 'compliance',
    patterns: ['compliance', 'filing', 'deadline', 'regulation', 'due this week', 'overdue filing', 'upcoming'],
    fetch: async (wid) => {
      const now = today();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 3600_000);
      const monthEnd = new Date(now.getTime() + 30 * 24 * 3600_000);
      const [overdue, thisWeek, upcoming, total] = await Promise.all([
        prisma.complianceOccurrence.count({ where: { workspaceId: wid, dueDate: { lt: now }, status: { notIn: ['completed', 'cancelled'] } } }),
        prisma.complianceOccurrence.findMany({ where: { workspaceId: wid, dueDate: { gte: now, lte: weekEnd }, status: { notIn: ['completed', 'cancelled'] } }, take: 5, select: { name: true, dueDate: true, priority: true } }),
        prisma.complianceOccurrence.count({ where: { workspaceId: wid, dueDate: { gte: now, lte: monthEnd }, status: { notIn: ['completed', 'cancelled'] } } }),
        prisma.complianceOccurrence.count({ where: { workspaceId: wid, status: { notIn: ['completed', 'cancelled'] } } }),
      ]);
      const weekLines = thisWeek.map((o) => `  - ${o.name} (due ${o.dueDate?.toISOString().slice(0, 10)}, ${o.priority} priority)`).join('\n');
      return `Compliance Summary:\n  - Overdue: ${overdue}\n  - Due this week: ${thisWeek.length}\n  - Due this month: ${upcoming}\n  - Total open: ${total}\n${weekLines ? `\nThis week's deadlines:\n${weekLines}` : ''}`;
    },
  },
  {
    code: 'workspace_summary',
    patterns: ['summary', 'overview', 'this week', 'this month', 'business overview', 'show me', 'activity', 'dashboard'],
    fetch: async (wid) => {
      const now = today();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekEnd = new Date(now.getTime() + 7 * 24 * 3600_000);
      const [invoiceOverdue, expensePending, complianceDue, paymentsThisMonth] = await Promise.all([
        prisma.invoice.count({ where: { workspaceId: wid, status: 'overdue' } }),
        prisma.expense.count({ where: { workspaceId: wid, status: 'submitted', isDeleted: false } }),
        prisma.complianceOccurrence.count({ where: { workspaceId: wid, dueDate: { gte: now, lte: weekEnd }, status: { notIn: ['completed', 'cancelled'] } } }),
        prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted', paymentDate: { gte: monthStart } }, _sum: { amount: true }, _count: { id: true } }),
      ]);
      return `Workspace Summary (as of ${now.toISOString().slice(0, 10)}):\n  - Overdue invoices: ${invoiceOverdue}\n  - Expenses awaiting approval: ${expensePending}\n  - Compliance due this week: ${complianceDue}\n  - Payments received this month: ${paymentsThisMonth._count.id} ($${fmt(paymentsThisMonth._sum.amount || 0)})`;
    },
  },
];

// ── Resolve ───────────────────────────────────────────────────────────────────

async function resolve(userMessage, workspaceId) {
  const msg = userMessage.toLowerCase();

  // Find matching intents (no duplicate fetches for same data)
  const matched = new Set();
  const results = [];

  for (const intent of INTENT_MAP) {
    if (matched.has(intent.code)) continue;
    const hits = intent.patterns.some((p) => msg.includes(p));
    if (hits) {
      matched.add(intent.code);
      try {
        const data = await intent.fetch(workspaceId);
        results.push(data);
      } catch {
        // Skip failed data fetches — AI will answer without that data
      }
    }
  }

  return results.length > 0 ? results.join('\n\n') : null;
}

module.exports = { resolve };
