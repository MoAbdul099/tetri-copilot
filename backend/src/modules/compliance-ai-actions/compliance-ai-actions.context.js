const repo    = require('./compliance-ai-actions.repository');
const intRepo = require('../compliance-intelligence/compliance-intelligence.repository');

async function assembleContext(workspaceId) {
  const [health, risks, recommendations, overdue, nearDue] = await Promise.all([
    intRepo.getLatestHealthScore(workspaceId),
    intRepo.listRisks(workspaceId, { status: 'open' }),
    intRepo.listRecommendations(workspaceId),
    repo.getOverdueOccurrences(workspaceId, 5),
    repo.getNearDueOccurrences(workspaceId, 14, 5),
  ]);

  const healthSummary = health
    ? `Score: ${health.score}/100 (${health.status})`
    : 'No health score available.';

  const overdueLines = overdue.map(o =>
    `- ${o.name} (due ${new Date(o.dueDate).toLocaleDateString()}, ${o.status})`
  );
  const nearDueLines = nearDue.map(o =>
    `- ${o.name} (due ${new Date(o.dueDate).toLocaleDateString()})`
  );
  const riskLines = risks.items.slice(0, 8).map(r =>
    `- [${r.severity.toUpperCase()}] ${r.category}: ${r.description}`
  );
  const recLines = recommendations.slice(0, 5).map(r =>
    `- [${r.priority}] ${r.recommendation}`
  );

  const text = [
    `Compliance Health: ${healthSummary}`,
    overdue.length > 0
      ? `Overdue obligations (${overdue.length}):\n${overdueLines.join('\n')}`
      : 'No overdue obligations.',
    nearDue.length > 0
      ? `Near-due obligations within 14 days (${nearDue.length}):\n${nearDueLines.join('\n')}`
      : 'No obligations due in the next 14 days.',
    risks.total > 0
      ? `Active risks (${risks.total} total, top ${riskLines.length} shown):\n${riskLines.join('\n')}`
      : 'No active risks.',
    recommendations.length > 0
      ? `Current recommendations (${recommendations.length} total, top ${recLines.length} shown):\n${recLines.join('\n')}`
      : 'No recommendations.',
  ].join('\n\n');

  return {
    text,
    raw: { health, topRisks: risks.items.slice(0, 5), topRecommendations: recommendations.slice(0, 5), overdue, nearDue },
  };
}

async function assembleOccurrenceContext(workspaceId, occurrenceId) {
  const occ = await repo.getOccurrenceById(workspaceId, occurrenceId);
  if (!occ) return null;

  const daysUntilDue = Math.ceil((new Date(occ.dueDate) - Date.now()) / 86400000);
  const urgency = daysUntilDue < 0 ? 'OVERDUE' : daysUntilDue <= 3 ? 'URGENT' : daysUntilDue <= 7 ? 'HIGH' : 'NORMAL';

  return {
    occurrence: occ,
    daysUntilDue,
    urgency,
    text: `Obligation: ${occ.name}
Template: ${occ.template?.name || 'N/A'}
Due Date: ${new Date(occ.dueDate).toLocaleDateString()}
Status: ${occ.status}
Priority: ${occ.priority}
Days Until Due: ${daysUntilDue} (${urgency})
Department: ${occ.department || 'N/A'}
Notes: ${occ.notes || 'None'}`,
  };
}

module.exports = { assembleContext, assembleOccurrenceContext };
