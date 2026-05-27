const prisma     = require('../../lib/prisma');
const actionRepo = require('./action.repository');

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Generators ────────────────────────────────────────────────────────────────

async function generateRecommendations(workspaceId) {
  const now     = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 86400_000);

  const [invoiceOverdue, expensePending, complianceDue, complianceOverdue, unallocated] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId, status: 'overdue' },
      _sum:  { totalAmount: true },
      _count: { id: true },
    }),
    prisma.expense.count({
      where: { workspaceId, status: 'submitted', isDeleted: false },
    }),
    prisma.complianceOccurrence.findMany({
      where:   { workspaceId, dueDate: { gte: now, lte: weekEnd }, status: { notIn: ['completed', 'cancelled'] } },
      orderBy: { dueDate: 'asc' },
      take:    3,
      select:  { name: true, dueDate: true, priority: true },
    }),
    prisma.complianceOccurrence.count({
      where: { workspaceId, dueDate: { lt: now }, status: { notIn: ['completed', 'cancelled'] } },
    }),
    prisma.payment.aggregate({
      where:  { workspaceId, status: 'posted', unallocatedAmount: { gt: 0 } },
      _sum:   { unallocatedAmount: true },
      _count: { id: true },
    }),
  ]);

  const recs = [];

  if (invoiceOverdue._count.id > 0) {
    recs.push({
      category:      'invoices',
      priority:      'high',
      title:         `${invoiceOverdue._count.id} overdue invoice${invoiceOverdue._count.id > 1 ? 's' : ''} need attention`,
      body:          `You have $${fmt(invoiceOverdue._sum.totalAmount || 0)} in overdue invoices. Follow up with customers to improve cash collection.`,
      actionHint:    'View overdue invoices',
      routePath:     '/invoices',
      supportingData: { count: invoiceOverdue._count.id, amount: invoiceOverdue._sum.totalAmount },
    });
  }

  if (complianceOverdue > 0) {
    recs.push({
      category:      'compliance',
      priority:      'high',
      title:         `${complianceOverdue} overdue compliance obligation${complianceOverdue > 1 ? 's' : ''}`,
      body:          `You have overdue compliance items that require immediate action to avoid penalties.`,
      actionHint:    'View overdue compliance',
      routePath:     '/compliance',
      supportingData: { count: complianceOverdue },
    });
  }

  if (complianceDue.length > 0) {
    const names = complianceDue.map((c) => c.name).slice(0, 2).join(', ');
    recs.push({
      category:      'compliance',
      priority:      'medium',
      title:         `${complianceDue.length} compliance deadline${complianceDue.length > 1 ? 's' : ''} due this week`,
      body:          `Upcoming: ${names}${complianceDue.length > 2 ? ', and more' : ''}. Prepare and submit on time.`,
      actionHint:    'View compliance calendar',
      routePath:     '/compliance',
      supportingData: { count: complianceDue.length, items: complianceDue },
    });
  }

  if (expensePending > 0) {
    recs.push({
      category:      'expenses',
      priority:      'medium',
      title:         `${expensePending} expense${expensePending > 1 ? 's' : ''} awaiting approval`,
      body:          `Review and approve pending expense submissions to keep your team reimbursements on track.`,
      actionHint:    'Review pending expenses',
      routePath:     '/expenses',
      supportingData: { count: expensePending },
    });
  }

  if (unallocated._count.id > 0) {
    recs.push({
      category:      'payments',
      priority:      'low',
      title:         `${unallocated._count.id} payment${unallocated._count.id > 1 ? 's' : ''} with unallocated amounts`,
      body:          `$${fmt(unallocated._sum.unallocatedAmount || 0)} in payments have not been allocated to invoices. Allocate them to keep your accounts accurate.`,
      actionHint:    'View payments',
      routePath:     '/payments',
      supportingData: { count: unallocated._count.id, amount: unallocated._sum.unallocatedAmount },
    });
  }

  return recs;
}

// ── Public API ────────────────────────────────────────────────────────────────

async function refreshRecommendations(workspaceId) {
  try {
    const recs = await generateRecommendations(workspaceId);
    return actionRepo.saveRecommendations(workspaceId, recs);
  } catch { return []; }
}

async function getRecommendations(workspaceId) {
  const existing = await actionRepo.getActiveRecommendations(workspaceId);
  if (existing.length > 0) return existing;
  // Auto-generate on first access
  await refreshRecommendations(workspaceId);
  return actionRepo.getActiveRecommendations(workspaceId);
}

async function dismissRecommendation(id, workspaceId) {
  return actionRepo.dismissRecommendation(id, workspaceId);
}

async function getAsContext(workspaceId) {
  try {
    const recs = await getRecommendations(workspaceId);
    if (!recs.length) return null;
    const lines = recs.map((r, i) => `  ${i + 1}. [${r.priority.toUpperCase()}] ${r.title}: ${r.body}`);
    return `Workspace Recommendations:\n${lines.join('\n')}`;
  } catch { return null; }
}

module.exports = { refreshRecommendations, getRecommendations, dismissRecommendation, getAsContext };
