const prisma = require('../../lib/prisma');

const today     = () => new Date();
const fmtDate   = (d) => d ? new Date(d).toISOString().split('T')[0] : 'N/A';
const daysUntil = (d) => Math.ceil((new Date(d) - today()) / 86400000);
const isOverdue = (d) => new Date(d) < today();

async function buildComplianceContext(workspaceId) {
  const sources = [];
  const parts   = [];

  try {
    // 1. Company + workspace profile
    const [workspace, company] = await Promise.all([
      prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true, country: true } }).catch(() => null),
      prisma.company.findFirst({ where: { workspaceId }, select: { name: true, industry: true, country: true, taxNumber: true } }).catch(() => null),
    ]);

    if (workspace || company) {
      const co = company?.name || workspace?.name || 'This workspace';
      parts.push(`Company: ${co}`);
      if (company?.country || workspace?.country) parts.push(`Country: ${company?.country || workspace?.country}`);
      if (company?.industry) parts.push(`Industry: ${company.industry}`);
      sources.push('Workspace Profile');
    }

    // 2. Active compliance templates
    const templates = await prisma.complianceTemplate.findMany({
      where:   { workspaceId, isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, frequency: true, priority: true,
        jurisdiction: { select: { name: true } },
        category:     { select: { name: true } },
        authority:    { select: { name: true } },
      },
    }).catch(() => []);

    if (templates.length) {
      parts.push(`\nActive Compliance Obligations (${templates.length} total):`);
      for (const t of templates.slice(0, 20)) {
        const meta = [t.frequency, t.jurisdiction?.name, t.authority?.name, t.category?.name].filter(Boolean).join(' | ');
        parts.push(`  • ${t.name}${meta ? ` (${meta})` : ''}`);
      }
      sources.push('Compliance Templates');
    }

    // 3. Overdue occurrences
    const overdue = await prisma.complianceOccurrence.findMany({
      where: {
        workspaceId,
        dueDate: { lt: today() },
        status:  { notIn: ['completed', 'cancelled', 'waived'] },
      },
      orderBy: { dueDate: 'asc' },
      select: {
        name: true, dueDate: true, priority: true, status: true,
        category: { select: { name: true } },
      },
      take: 10,
    }).catch(() => []);

    if (overdue.length) {
      parts.push(`\nOVERDUE Compliance Items (${overdue.length}):`);
      for (const o of overdue) {
        const days = Math.abs(daysUntil(o.dueDate));
        parts.push(`  ⚠ ${o.name} — was due ${fmtDate(o.dueDate)} (${days} days ago) [${o.priority}]`);
      }
      sources.push('Compliance Calendar');
    }

    // 4. Upcoming deadlines (next 60 days)
    const upcoming = await prisma.complianceOccurrence.findMany({
      where: {
        workspaceId,
        dueDate: { gte: today(), lte: new Date(Date.now() + 60 * 86400000) },
        status:  { notIn: ['completed', 'cancelled'] },
      },
      orderBy: { dueDate: 'asc' },
      select: {
        name: true, dueDate: true, priority: true, status: true,
        category: { select: { name: true } },
      },
      take: 15,
    }).catch(() => []);

    if (upcoming.length) {
      parts.push(`\nUpcoming Compliance Deadlines (next 60 days):`);
      for (const o of upcoming) {
        const days = daysUntil(o.dueDate);
        const urgency = days <= 7 ? '🔴' : days <= 14 ? '🟡' : '🟢';
        parts.push(`  ${urgency} ${o.name} — due ${fmtDate(o.dueDate)} (in ${days} days) [${o.priority}]`);
      }
      if (!sources.includes('Compliance Calendar')) sources.push('Compliance Calendar');
    }

    // 5. Summary statistics
    const [totalActive, totalCompleted, totalPendingMonth] = await Promise.all([
      prisma.complianceOccurrence.count({
        where: { workspaceId, status: { notIn: ['completed', 'cancelled'] } },
      }).catch(() => 0),
      prisma.complianceOccurrence.count({
        where: { workspaceId, status: 'completed' },
      }).catch(() => 0),
      prisma.complianceOccurrence.count({
        where: {
          workspaceId,
          status: { notIn: ['completed', 'cancelled'] },
          dueDate: {
            gte: new Date(today().getFullYear(), today().getMonth(), 1),
            lte: new Date(today().getFullYear(), today().getMonth() + 1, 0),
          },
        },
      }).catch(() => 0),
    ]);

    parts.push(`\nCompliance Summary:`);
    parts.push(`  Total active obligations: ${totalActive}`);
    parts.push(`  Overdue: ${overdue.length}`);
    parts.push(`  Due this month: ${totalPendingMonth}`);
    parts.push(`  Completed (all time): ${totalCompleted}`);

  } catch { /* silent — return what we have */ }

  const today_str = today().toISOString().split('T')[0];
  const contextText = parts.length
    ? `Today: ${today_str}\n\n${parts.join('\n')}`
    : null;

  return { contextText, sources };
}

module.exports = { buildComplianceContext };
