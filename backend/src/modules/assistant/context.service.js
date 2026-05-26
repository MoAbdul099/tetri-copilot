const prisma     = require('../../lib/prisma');
const ctxRepo    = require('./context.repository');

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date();

// ── Route map for citations ───────────────────────────────────────────────────

const ROUTE_MAP = {
  invoices:   '/invoices',
  payments:   '/payments',
  expenses:   '/expenses',
  customers:  '/customers',
  compliance: '/compliance',
  dashboard:  '/dashboard',
  reports:    '/reports',
  files:      '/files',
};

// ── Entity extraction ─────────────────────────────────────────────────────────

function extractEntities(msg) {
  const entities = [];
  // Invoice number patterns: INV-xxxx, INV/xxxx, invoice #123
  const invMatches = msg.match(/(?:inv[-/]?\d{4,}|invoice\s*#?\s*\d+)/gi) || [];
  for (const m of invMatches) entities.push({ type: 'invoice_number', value: m.trim() });

  // Customer name patterns — quoted strings or "customer <name>"
  const custQuoted = msg.match(/"([^"]{2,60})"/g) || [];
  for (const m of custQuoted) entities.push({ type: 'customer_name', value: m.replace(/"/g, '').trim() });

  const custKeyword = msg.match(/(?:customer|client|company)\s+([A-Z][A-Za-z0-9 &]{1,40})/g) || [];
  for (const m of custKeyword) {
    const name = m.replace(/^(?:customer|client|company)\s+/i, '').trim();
    if (name.length > 1) entities.push({ type: 'customer_name', value: name });
  }

  return entities;
}

// ── Intent definitions ────────────────────────────────────────────────────────

const INTENT_DEFS = [
  // Entity-specific (checked first)
  {
    code: 'invoice_specific',
    test: (msg, entities) => entities.some((e) => e.type === 'invoice_number'),
    fetch: async (wid, msg, entities) => {
      const invNums = entities.filter((e) => e.type === 'invoice_number').map((e) => e.value.toUpperCase());
      const rows = await prisma.invoice.findMany({
        where: { workspaceId: wid, invoiceNumber: { in: invNums } },
        include: { customer: { select: { name: true } } },
        take: 5,
      });
      if (!rows.length) return { text: `No invoices found matching: ${invNums.join(', ')}.`, sources: [] };
      const lines = rows.map((r) =>
        `  - ${r.invoiceNumber}: $${fmt(r.totalAmount)} | Status: ${r.status} | Customer: ${r.customer?.name || 'N/A'} | Due: ${r.dueDate?.toISOString().slice(0, 10) || 'N/A'}`
      );
      return {
        text: `Invoice Details:\n${lines.join('\n')}`,
        sources: [{ type: 'invoices', name: 'Invoices', routePath: ROUTE_MAP.invoices, count: rows.length }],
      };
    },
  },
  {
    code: 'customer_specific',
    test: (msg, entities) => entities.some((e) => e.type === 'customer_name'),
    fetch: async (wid, msg, entities) => {
      const names = entities.filter((e) => e.type === 'customer_name').map((e) => e.value);
      const orClauses = names.map((n) => ({ name: { contains: n, mode: 'insensitive' } }));
      const rows = await prisma.customer.findMany({
        where: { workspaceId: wid, OR: orClauses },
        include: {
          invoices: {
            where:   { status: { in: ['sent', 'overdue'] } },
            orderBy: { createdAt: 'desc' },
            take:    5,
            select:  { invoiceNumber: true, totalAmount: true, status: true, dueDate: true },
          },
        },
        take: 5,
      });
      if (!rows.length) return { text: `No customers found matching: ${names.join(', ')}.`, sources: [] };
      const lines = rows.map((r) => {
        const outstanding = r.invoices.map((i) => `    ${i.invoiceNumber} ($${fmt(i.totalAmount)}, ${i.status})`).join('\n');
        return `  - ${r.name} | Status: ${r.status} | Email: ${r.email || 'N/A'}\n${outstanding ? `    Open invoices:\n${outstanding}` : ''}`;
      });
      return {
        text: `Customer Information:\n${lines.join('\n')}`,
        sources: [{ type: 'customers', name: 'Customers', routePath: ROUTE_MAP.customers, count: rows.length }],
      };
    },
  },

  // Domain intents
  {
    code: 'invoices_overdue',
    patterns: ['overdue invoice', 'unpaid invoice', 'outstanding invoice', 'past due', 'overdue receivable'],
    fetch: async (wid) => {
      const rows = await prisma.invoice.findMany({
        where:   { workspaceId: wid, status: 'overdue' },
        include: { customer: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
        take:    10,
      });
      if (!rows.length) return { text: 'No overdue invoices found.', sources: [] };
      const lines = rows.map((r) =>
        `  - ${r.invoiceNumber}: $${fmt(r.totalAmount)} from ${r.customer?.name || 'Unknown'}, due ${r.dueDate?.toISOString().slice(0, 10)}`
      );
      return {
        text: `Overdue Invoices (${rows.length}):\n${lines.join('\n')}`,
        sources: [{ type: 'invoices', name: 'Overdue Invoices', routePath: ROUTE_MAP.invoices, count: rows.length }],
      };
    },
  },
  {
    code: 'invoices_recent',
    patterns: ['recent invoice', 'latest invoice', 'new invoice', 'invoice this month', 'invoice today'],
    fetch: async (wid) => {
      const monthStart = new Date(today().getFullYear(), today().getMonth(), 1);
      const rows = await prisma.invoice.findMany({
        where:   { workspaceId: wid, createdAt: { gte: monthStart } },
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take:    10,
      });
      if (!rows.length) return { text: 'No invoices created this month.', sources: [] };
      const lines = rows.map((r) =>
        `  - ${r.invoiceNumber}: $${fmt(r.totalAmount)} | ${r.status} | ${r.customer?.name || 'N/A'}`
      );
      return {
        text: `Recent Invoices (this month, ${rows.length}):\n${lines.join('\n')}`,
        sources: [{ type: 'invoices', name: 'Recent Invoices', routePath: ROUTE_MAP.invoices, count: rows.length }],
      };
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
      const totals = await prisma.invoice.aggregate({
        where: { workspaceId: wid, status: { in: ['sent', 'overdue'] } },
        _sum:  { totalAmount: true },
      });
      const count = sent + overdue;
      return {
        text: `Invoice Summary:\n  - Sent (awaiting payment): ${sent}\n  - Overdue: ${overdue}\n  - Paid: ${paid}\n  - Outstanding balance: $${fmt(totals._sum.totalAmount || 0)}`,
        sources: [{ type: 'invoices', name: 'Invoices', routePath: ROUTE_MAP.invoices, count }],
      };
    },
  },
  {
    code: 'payments_general',
    patterns: ['payment', 'received', 'collected', 'cash received', 'unallocated'],
    fetch: async (wid) => {
      const now = today();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const [total, unallocated, monthly] = await Promise.all([
        prisma.payment.count({ where: { workspaceId: wid, status: 'posted' } }),
        prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted', unallocatedAmount: { gt: 0 } }, _sum: { unallocatedAmount: true }, _count: { id: true } }),
        prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted', paymentDate: { gte: monthStart } }, _sum: { amount: true }, _count: { id: true } }),
      ]);
      return {
        text: `Payment Summary:\n  - Total posted: ${total}\n  - Received this month: ${monthly._count.id} payments, $${fmt(monthly._sum.amount || 0)}\n  - Unallocated: ${unallocated._count.id} payments, $${fmt(unallocated._sum.unallocatedAmount || 0)}`,
        sources: [{ type: 'payments', name: 'Payments', routePath: ROUTE_MAP.payments, count: total }],
      };
    },
  },
  {
    code: 'expenses_pending',
    patterns: ['expense approval', 'awaiting approval', 'pending expense', 'pending approval'],
    fetch: async (wid) => {
      const rows = await prisma.expense.findMany({
        where:   { workspaceId: wid, status: 'submitted', isDeleted: false },
        orderBy: { amount: 'desc' },
        take:    10,
        select:  { expenseNumber: true, description: true, amount: true },
      });
      if (!rows.length) return { text: 'No expenses awaiting approval.', sources: [] };
      const lines = rows.map((r) => `  - ${r.expenseNumber || 'EXP'}: ${r.description?.substring(0, 40)} — $${fmt(r.amount)}`);
      return {
        text: `Expenses Awaiting Approval (${rows.length}):\n${lines.join('\n')}`,
        sources: [{ type: 'expenses', name: 'Pending Expenses', routePath: ROUTE_MAP.expenses, count: rows.length }],
      };
    },
  },
  {
    code: 'expenses_general',
    patterns: ['expense', 'spending', 'cost', 'reimburs'],
    fetch: async (wid) => {
      const now = today();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const [monthly, pending, total] = await Promise.all([
        prisma.expense.aggregate({ where: { workspaceId: wid, isDeleted: false, expenseDate: { gte: monthStart } }, _sum: { amount: true }, _count: { id: true } }),
        prisma.expense.count({ where: { workspaceId: wid, isDeleted: false, status: 'submitted' } }),
        prisma.expense.aggregate({ where: { workspaceId: wid, isDeleted: false }, _sum: { amount: true }, _count: { id: true } }),
      ]);
      return {
        text: `Expense Summary:\n  - This month: ${monthly._count.id} expenses, $${fmt(monthly._sum.amount || 0)}\n  - Awaiting approval: ${pending}\n  - All time: ${total._count.id} expenses, $${fmt(total._sum.amount || 0)}`,
        sources: [{ type: 'expenses', name: 'Expenses', routePath: ROUTE_MAP.expenses, count: total._count.id }],
      };
    },
  },
  {
    code: 'customers_general',
    patterns: ['customer', 'client', 'top customer', 'customer balance'],
    fetch: async (wid) => {
      const [total, active, top] = await Promise.all([
        prisma.customer.count({ where: { workspaceId: wid } }),
        prisma.customer.count({ where: { workspaceId: wid, status: 'active' } }),
        prisma.customer.findMany({ where: { workspaceId: wid, status: 'active' }, orderBy: { createdAt: 'desc' }, take: 5, select: { name: true } }),
      ]);
      const topNames = top.map((c) => `  - ${c.name}`).join('\n');
      return {
        text: `Customer Summary:\n  - Total: ${total} (${active} active)\n  - Recent:\n${topNames}`,
        sources: [{ type: 'customers', name: 'Customers', routePath: ROUTE_MAP.customers, count: total }],
      };
    },
  },
  {
    code: 'compliance_upcoming',
    patterns: ['compliance due', 'upcoming filing', 'due this week', 'upcoming deadline', 'compliance this month'],
    fetch: async (wid) => {
      const now = today();
      const weekEnd  = new Date(now.getTime() + 7  * 24 * 3600_000);
      const monthEnd = new Date(now.getTime() + 30 * 24 * 3600_000);
      const [thisWeek, upcoming] = await Promise.all([
        prisma.complianceOccurrence.findMany({ where: { workspaceId: wid, dueDate: { gte: now, lte: weekEnd  }, status: { notIn: ['completed', 'cancelled'] } }, take: 5, select: { name: true, dueDate: true, priority: true } }),
        prisma.complianceOccurrence.count(  { where: { workspaceId: wid, dueDate: { gte: now, lte: monthEnd }, status: { notIn: ['completed', 'cancelled'] } } }),
      ]);
      const lines = thisWeek.map((o) => `  - ${o.name} (due ${o.dueDate?.toISOString().slice(0, 10)}, ${o.priority} priority)`);
      return {
        text: `Upcoming Compliance:\n  - Due this week: ${thisWeek.length}\n  - Due this month: ${upcoming}\n${lines.join('\n')}`,
        sources: [{ type: 'compliance', name: 'Compliance Calendar', routePath: ROUTE_MAP.compliance, count: upcoming }],
      };
    },
  },
  {
    code: 'compliance_overdue',
    patterns: ['overdue compliance', 'overdue filing', 'missed deadline', 'late filing'],
    fetch: async (wid) => {
      const now = today();
      const rows = await prisma.complianceOccurrence.findMany({
        where:   { workspaceId: wid, dueDate: { lt: now }, status: { notIn: ['completed', 'cancelled'] } },
        orderBy: { dueDate: 'asc' },
        take:    10,
        select:  { name: true, dueDate: true, priority: true },
      });
      if (!rows.length) return { text: 'No overdue compliance obligations.', sources: [] };
      const lines = rows.map((o) => `  - ${o.name} (overdue since ${o.dueDate?.toISOString().slice(0, 10)}, ${o.priority})`);
      return {
        text: `Overdue Compliance (${rows.length}):\n${lines.join('\n')}`,
        sources: [{ type: 'compliance', name: 'Overdue Compliance', routePath: ROUTE_MAP.compliance, count: rows.length }],
      };
    },
  },
  {
    code: 'compliance_general',
    patterns: ['compliance', 'filing', 'deadline', 'regulation'],
    fetch: async (wid) => {
      const now     = today();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 3600_000);
      const [overdue, thisWeek, total] = await Promise.all([
        prisma.complianceOccurrence.count({ where: { workspaceId: wid, dueDate: { lt: now  }, status: { notIn: ['completed', 'cancelled'] } } }),
        prisma.complianceOccurrence.count({ where: { workspaceId: wid, dueDate: { gte: now, lte: weekEnd }, status: { notIn: ['completed', 'cancelled'] } } }),
        prisma.complianceOccurrence.count({ where: { workspaceId: wid, status: { notIn: ['completed', 'cancelled'] } } }),
      ]);
      return {
        text: `Compliance Summary:\n  - Total open: ${total}\n  - Overdue: ${overdue}\n  - Due this week: ${thisWeek}`,
        sources: [{ type: 'compliance', name: 'Compliance', routePath: ROUTE_MAP.compliance, count: total }],
      };
    },
  },
  {
    code: 'workspace_summary',
    patterns: ['summary', 'overview', 'this week', 'this month', 'business overview', 'show me', 'activity', 'dashboard'],
    fetch: async (wid) => {
      const now        = today();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekEnd    = new Date(now.getTime() + 7 * 24 * 3600_000);
      const [invoiceOverdue, expensePending, complianceDue, paymentsThisMonth] = await Promise.all([
        prisma.invoice.count({ where: { workspaceId: wid, status: 'overdue' } }),
        prisma.expense.count({ where: { workspaceId: wid, status: 'submitted', isDeleted: false } }),
        prisma.complianceOccurrence.count({ where: { workspaceId: wid, dueDate: { gte: now, lte: weekEnd }, status: { notIn: ['completed', 'cancelled'] } } }),
        prisma.payment.aggregate({ where: { workspaceId: wid, status: 'posted', paymentDate: { gte: monthStart } }, _sum: { amount: true }, _count: { id: true } }),
      ]);
      return {
        text: `Workspace Summary (${now.toISOString().slice(0, 10)}):\n  - Overdue invoices: ${invoiceOverdue}\n  - Expenses awaiting approval: ${expensePending}\n  - Compliance due this week: ${complianceDue}\n  - Payments received this month: ${paymentsThisMonth._count.id} ($${fmt(paymentsThisMonth._sum.amount || 0)})`,
        sources: [
          { type: 'invoices',   name: 'Invoices',   routePath: ROUTE_MAP.invoices,   count: invoiceOverdue },
          { type: 'expenses',   name: 'Expenses',   routePath: ROUTE_MAP.expenses,   count: expensePending },
          { type: 'compliance', name: 'Compliance', routePath: ROUTE_MAP.compliance, count: complianceDue },
          { type: 'dashboard',  name: 'Dashboard',  routePath: ROUTE_MAP.dashboard,  count: 0 },
        ],
      };
    },
  },
  {
    code: 'reports',
    patterns: ['report', 'analytics', 'trend', 'forecast', 'analysis'],
    fetch: async () => ({
      text: 'For detailed reports and analytics, visit the Reports section in the sidebar.',
      sources: [{ type: 'reports', name: 'Reports', routePath: ROUTE_MAP.reports, count: 0 }],
    }),
  },
];

// ── File context builder ──────────────────────────────────────────────────────

async function buildFileContext(workspaceId, sessionId) {
  const files = await ctxRepo.getSessionFileTexts(workspaceId, sessionId);
  if (!files.length) return { text: null, sources: [] };

  const parts = files
    .filter((f) => f.extractedText)
    .map((f) => `[FILE: ${f.fileName}]\n${f.extractedText.substring(0, 3000)}`);

  if (!parts.length) return { text: null, sources: [] };

  return {
    text: parts.join('\n\n'),
    sources: files.map((f) => ({ type: 'file', name: f.fileName, routePath: null, count: 1 })),
  };
}

// ── Confidence scoring ────────────────────────────────────────────────────────

function scoreConfidence(intents, recordsCount, hasFileContext) {
  if (intents.length === 0 && !hasFileContext) return 'low';
  if (recordsCount > 0 || hasFileContext)       return 'high';
  return 'medium';
}

// ── Main resolve function ─────────────────────────────────────────────────────

async function resolve(userMessage, workspaceId, sessionId) {
  const start   = Date.now();
  const msg     = userMessage.toLowerCase();
  const entities = extractEntities(userMessage);

  const matched  = new Set();
  const parts    = [];
  const sources  = [];
  const intents  = [];

  // Entity-specific intents first
  for (const def of INTENT_DEFS) {
    if (def.test && !def.test(msg, entities)) continue;
    if (def.test) {
      matched.add(def.code);
      try {
        const result = await def.fetch(workspaceId, msg, entities);
        if (result.text) { parts.push(result.text); sources.push(...result.sources); }
        intents.push(def.code);
      } catch { /* skip failed fetch */ }
    }
  }

  // Pattern-based intents
  for (const def of INTENT_DEFS) {
    if (!def.patterns || matched.has(def.code)) continue;
    const hits = def.patterns.some((p) => msg.includes(p));
    if (!hits) continue;
    matched.add(def.code);
    try {
      const result = await def.fetch(workspaceId, msg, entities);
      if (result.text) { parts.push(result.text); sources.push(...result.sources); }
      intents.push(def.code);
    } catch { /* skip */ }
  }

  // File context
  let fileCtx = { text: null, sources: [] };
  if (sessionId) {
    try {
      fileCtx = await buildFileContext(workspaceId, sessionId);
      if (fileCtx.text) {
        parts.push('[ATTACHED FILES]\n' + fileCtx.text);
        sources.push(...fileCtx.sources);
      }
    } catch { /* skip */ }
  }

  const contextText  = parts.length > 0 ? parts.join('\n\n') : null;
  const recordsCount = sources.reduce((sum, s) => sum + (s.count || 0), 0);
  const confidence   = scoreConfidence(intents, recordsCount, !!fileCtx.text);
  const durationMs   = Date.now() - start;
  const tokenEstimate = contextText ? Math.ceil(contextText.length / 4) : 0;

  // Deduplicate sources by type+name
  const seen     = new Set();
  const uniqSrcs = sources.filter((s) => {
    const key = `${s.type}:${s.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { contextText, sources: uniqSrcs, confidence, intents, recordsCount, tokenEstimate, durationMs };
}

// ── Context log (non-blocking) ────────────────────────────────────────────────

async function logContext({ workspaceId, sessionId, messageId, userId, resolved }) {
  try {
    const log = await ctxRepo.createContextLog({
      workspaceId,
      sessionId,
      messageId,
      userId,
      intents:       resolved.intents,
      contextText:   resolved.contextText,
      confidence:    resolved.confidence,
      recordsCount:  resolved.recordsCount,
      tokenEstimate: resolved.tokenEstimate,
      durationMs:    resolved.durationMs,
    });
    if (resolved.sources.length) {
      await ctxRepo.createContextSources(log.id, resolved.sources);
    }
  } catch { /* non-blocking */ }
}

module.exports = { resolve, logContext };
