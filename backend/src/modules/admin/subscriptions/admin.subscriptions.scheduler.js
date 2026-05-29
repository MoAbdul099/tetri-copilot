const { expireStaleTrials } = require('./admin.subscriptions.repository');
const { logger } = require('../../../middleware/requestLogger');

const INTERVAL_MS = 60 * 60 * 1000; // hourly
let timer = null;

async function run() {
  try {
    const count = await expireStaleTrials();
    if (count > 0) logger.info(`Trial expiry: ${count} subscription(s) marked expired`);
  } catch (err) {
    logger.error('Trial expiry scheduler error', { error: err.message });
  }
}

function start() {
  if (timer) return;
  run(); // run immediately on startup
  timer = setInterval(run, INTERVAL_MS);
  logger.info('Trial expiry scheduler started');
}

function stop() {
  if (timer) { clearInterval(timer); timer = null; }
}

module.exports = { start, stop };
