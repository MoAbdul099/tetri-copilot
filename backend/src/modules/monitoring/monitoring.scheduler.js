const { collectMetrics } = require('./monitoring.service');
const repo = require('./monitoring.repository');
const { logger } = require('../../middleware/requestLogger');

const METRICS_INTERVAL_MS = 5 * 60 * 1000;   // 5 minutes
const PURGE_INTERVAL_MS   = 24 * 60 * 60 * 1000; // 24 hours

let metricsTimer = null;
let purgeTimer   = null;

async function runMetrics() {
  try {
    await collectMetrics();
    logger.info('Monitoring metrics collected');
  } catch (err) {
    logger.error('Monitoring metrics collection failed', { error: err.message });
  }
}

async function runPurge() {
  try {
    const result = await repo.purgeOldMetrics(7);
    logger.info('Old metrics purged', { count: result.count });
  } catch (err) {
    logger.error('Metrics purge failed', { error: err.message });
  }
}

function start() {
  if (metricsTimer) return;
  runMetrics();
  metricsTimer = setInterval(runMetrics, METRICS_INTERVAL_MS);
  purgeTimer   = setInterval(runPurge,   PURGE_INTERVAL_MS);
  logger.info('Monitoring scheduler started');
}

function stop() {
  if (metricsTimer) { clearInterval(metricsTimer); metricsTimer = null; }
  if (purgeTimer)   { clearInterval(purgeTimer);   purgeTimer   = null; }
  logger.info('Monitoring scheduler stopped');
}

module.exports = { start, stop };
