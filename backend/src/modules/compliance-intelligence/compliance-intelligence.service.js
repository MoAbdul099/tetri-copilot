const repo   = require('./compliance-intelligence.repository');
const engine = require('./compliance-intelligence.engine');
const aiSvc  = require('../ai/ai.service');

async function runAnalysis(workspaceId) {
  const [healthData, risks] = await Promise.all([
    engine.calculateHealthScore(workspaceId),
    engine.detectRisks(workspaceId),
  ]);

  const recommendations = engine.generateRecommendations(risks, healthData.score);

  const [savedScore] = await Promise.all([
    repo.saveHealthScore(workspaceId, healthData),
    repo.replaceRisks(workspaceId, risks),
    repo.replaceRecommendations(workspaceId, recommendations),
  ]);

  const summary = buildSnapshotSummary(healthData, risks, recommendations);
  await repo.saveSnapshot(workspaceId, {
    summary,
    score: healthData.score,
    riskCount: risks.length,
    insights: null,
  });

  return { health: savedScore, risks, recommendations };
}

function buildSnapshotSummary(health, risks, recs) {
  const critical = risks.filter(r => r.severity === 'critical').length;
  const high     = risks.filter(r => r.severity === 'high').length;
  const lines = [
    `Compliance health: ${health.label} (${health.score}/100).`,
    risks.length > 0
      ? `${risks.length} risk${risks.length !== 1 ? 's' : ''} detected${critical ? ` (${critical} critical)` : high ? ` (${high} high)` : ''}.`
      : 'No active risks detected.',
    recs.length > 0
      ? `${recs.length} recommendation${recs.length !== 1 ? 's' : ''} generated.`
      : '',
  ];
  return lines.filter(Boolean).join(' ');
}

async function getDashboard(workspaceId) {
  const [health, risks, recommendations, snapshots] = await Promise.all([
    repo.getLatestHealthScore(workspaceId),
    repo.listRisks(workspaceId, { status: 'open' }),
    repo.listRecommendations(workspaceId),
    repo.listSnapshots(workspaceId, 12),
  ]);

  const trends = await engine.analyzeTrends(workspaceId, snapshots);

  const risksBySeverity = {
    critical: risks.items.filter(r => r.severity === 'critical').length,
    high:     risks.items.filter(r => r.severity === 'high').length,
    medium:   risks.items.filter(r => r.severity === 'medium').length,
    low:      risks.items.filter(r => r.severity === 'low').length,
  };

  return {
    health,
    riskSummary: { total: risks.total, bySeverity: risksBySeverity },
    topRisks: risks.items.slice(0, 10),
    recommendations,
    trends,
    lastAnalyzed: health?.calculatedAt || null,
  };
}

async function generateAiInsights(workspaceId, userId) {
  const [health, risks, recommendations] = await Promise.all([
    repo.getLatestHealthScore(workspaceId),
    repo.listRisks(workspaceId, { status: 'open' }),
    repo.listRecommendations(workspaceId),
  ]);

  if (!health) throw new Error('No analysis data available. Please run an analysis first.');

  const riskLines = risks.items.slice(0, 10).map(r =>
    `- [${r.severity.toUpperCase()}] ${r.category}: ${r.description}`
  ).join('\n');

  const recLines = recommendations.slice(0, 5).map(r =>
    `- [${r.priority}] ${r.recommendation}`
  ).join('\n');

  const prompt = `You are a compliance intelligence advisor for a business workspace.

Current compliance health score: ${health.score}/100 (${health.status})

Active risks:
${riskLines || 'None detected.'}

Top recommendations:
${recLines || 'None.'}

Provide 3-5 actionable compliance insights in plain language. Focus on:
1. The most pressing issue requiring immediate attention
2. A pattern or trend that may not be obvious
3. A practical improvement suggestion

Keep each insight concise (1-2 sentences). Do not give legal advice. Use clear, professional language.
Format as numbered insights.`;

  const result = await aiSvc.execute({
    workspaceId,
    userId,
    feature: 'compliance_assistant',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 600, temperature: 0.3 },
  });

  return { insights: result.response, generatedAt: new Date() };
}

async function generateExecutiveSummary(workspaceId, userId) {
  const [health, risks, recommendations, snapshots] = await Promise.all([
    repo.getLatestHealthScore(workspaceId),
    repo.listRisks(workspaceId, { status: 'open' }),
    repo.listRecommendations(workspaceId),
    repo.listSnapshots(workspaceId, 6),
  ]);

  if (!health) throw new Error('No analysis data available. Please run an analysis first.');

  const trends = await engine.analyzeTrends(workspaceId, snapshots);
  const critical = risks.items.filter(r => r.severity === 'critical').length;
  const high     = risks.items.filter(r => r.severity === 'high').length;

  const prompt = `Generate a concise executive compliance summary for senior management.

Data:
- Compliance Health Score: ${health.score}/100 (${health.label})
- Total active risks: ${risks.total} (${critical} critical, ${high} high priority)
- Compliance trend: ${trends.direction} (${trends.change > 0 ? '+' : ''}${trends.change} points)
- Top risks: ${risks.items.slice(0, 3).map(r => r.description).join('; ') || 'None'}
- Priority recommendations: ${recommendations.slice(0, 3).map(r => r.recommendation).join('; ') || 'None'}

Write a professional executive summary (3-4 short paragraphs) covering:
1. Current compliance health status
2. Key risks requiring attention
3. Trend and trajectory
4. Immediate recommended actions

Tone: professional, factual, action-oriented. No legal advice. No technical jargon.`;

  const result = await aiSvc.execute({
    workspaceId,
    userId,
    feature: 'compliance_assistant',
    messages: [{ role: 'user', content: prompt }],
    options: { maxTokens: 800, temperature: 0.3 },
  });

  return {
    summary: result.response,
    healthScore: health.score,
    healthStatus: health.status,
    riskCount: risks.total,
    trend: trends.direction,
    generatedAt: new Date(),
  };
}

module.exports = { runAnalysis, getDashboard, generateAiInsights, generateExecutiveSummary };
