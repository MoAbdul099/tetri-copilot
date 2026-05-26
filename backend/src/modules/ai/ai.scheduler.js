const { runHealthChecks } = require('./ai.service');
const repo = require('./ai.repository');
const { logger } = require('../../middleware/requestLogger');

const HEALTH_INTERVAL_MS = 5 * 60 * 1000;  // 5 minutes
const PURGE_INTERVAL_MS  = 24 * 60 * 60 * 1000;

let healthTimer = null;
let purgeTimer  = null;

async function runHealth() {
  try {
    const results = await runHealthChecks();
    const down = results.filter((r) => r.status === 'down').length;
    if (down > 0) logger.warn(`AI health check: ${down} provider(s) down`);
    else logger.info('AI health checks passed', { providers: results.length });
  } catch (err) {
    logger.error('AI health check failed', { error: err.message });
  }
}

async function runPurge() {
  try {
    const result = await repo.purgeOldHealthChecks(7);
    logger.info('AI health check history purged', { count: result.count });
  } catch (err) {
    logger.error('AI health check purge failed', { error: err.message });
  }
}

function start() {
  if (healthTimer) return;
  runHealth();
  healthTimer = setInterval(runHealth, HEALTH_INTERVAL_MS);
  purgeTimer  = setInterval(runPurge,  PURGE_INTERVAL_MS);
  logger.info('AI scheduler started');
}

function stop() {
  if (healthTimer) { clearInterval(healthTimer); healthTimer = null; }
  if (purgeTimer)  { clearInterval(purgeTimer);  purgeTimer  = null; }
}

module.exports = { start, stop };
