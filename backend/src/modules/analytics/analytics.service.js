const engine  = require('./analytics.engine');
const insight  = require('./analytics.insights');
const repo     = require('./analytics.repository');

async function getFullAnalytics(workspaceId) {
  const [rev, col, exp, comp, cust] = await Promise.all([
    engine.revenueAnalytics(workspaceId),
    engine.collectionAnalytics(workspaceId),
    engine.expenseAnalytics(workspaceId),
    engine.complianceAnalytics(workspaceId),
    engine.customerAnalytics(workspaceId),
  ]);

  const [health, insights, risks] = await Promise.all([
    engine.computeHealthScore(workspaceId, { rev, col, exp, comp }),
    repo.listInsights(workspaceId),
    repo.listRiskAlerts(workspaceId),
  ]);
  const cash     = engine.cashForecast(col.forecast, exp.forecast);
  const cashRisk = engine.cashRisk(cash);

  return { revenue: rev, collections: col, expenses: exp, compliance: comp, customers: cust, health, cash, cashRisk, insights, risks };
}

async function getHealthScore(workspaceId) {
  return engine.computeHealthScore(workspaceId);
}

async function refreshAnalytics(workspaceId) {
  const [rev, col, exp, comp, cust] = await Promise.all([
    engine.revenueAnalytics(workspaceId),
    engine.collectionAnalytics(workspaceId),
    engine.expenseAnalytics(workspaceId),
    engine.complianceAnalytics(workspaceId),
    engine.customerAnalytics(workspaceId),
  ]);

  const health = await engine.computeHealthScore(workspaceId, { rev, col, exp, comp });
  const cash   = engine.cashForecast(col.forecast, exp.forecast);
  const cashRiskLevel = engine.cashRisk(cash);

  // Persist snapshot
  await repo.saveSnapshot(workspaceId, { revenue: rev, collections: col, expenses: exp, compliance: comp, customers: cust });

  // Persist health score
  await repo.saveHealthScore(workspaceId, health.overall, health.components);

  // Save forecasts (one row per type/period)
  await Promise.all([
    repo.saveForecast(workspaceId, 'revenue',    'd30', { value: rev.forecast.d30 }, 0.8),
    repo.saveForecast(workspaceId, 'revenue',    'd60', { value: rev.forecast.d60 }, 0.7),
    repo.saveForecast(workspaceId, 'revenue',    'd90', { value: rev.forecast.d90 }, 0.6),
    repo.saveForecast(workspaceId, 'collection', 'd30', { value: col.forecast.d30 }, 0.8),
    repo.saveForecast(workspaceId, 'collection', 'd60', { value: col.forecast.d60 }, 0.7),
    repo.saveForecast(workspaceId, 'collection', 'd90', { value: col.forecast.d90 }, 0.6),
    repo.saveForecast(workspaceId, 'expense',    'd30', { value: exp.forecast.d30 }, 0.8),
    repo.saveForecast(workspaceId, 'expense',    'd60', { value: exp.forecast.d60 }, 0.7),
    repo.saveForecast(workspaceId, 'expense',    'd90', { value: exp.forecast.d90 }, 0.6),
  ]);

  // Generate + persist insights
  await repo.clearOldInsights(workspaceId);
  const insights = insight.generateInsights(rev, col, exp, comp, cust);
  await repo.saveInsights(workspaceId, insights);

  // Generate + persist risk alerts
  const alerts = insight.generateRiskAlerts(rev, col, cash);
  await repo.saveRiskAlerts(workspaceId, alerts);

  return { health, cashRisk: cashRiskLevel, insightCount: insights.length, alertCount: alerts.length };
}

async function listInsights(workspaceId, query = {}) {
  return repo.listInsights(workspaceId, query);
}

async function dismissInsight(workspaceId, id) {
  return repo.dismissInsight(workspaceId, id);
}

async function listRiskAlerts(workspaceId) {
  return repo.listRiskAlerts(workspaceId);
}

async function dismissRiskAlert(workspaceId, id) {
  return repo.dismissRiskAlert(workspaceId, id);
}

module.exports = {
  getFullAnalytics,
  getHealthScore,
  refreshAnalytics,
  listInsights,
  dismissInsight,
  listRiskAlerts,
  dismissRiskAlert,
};
