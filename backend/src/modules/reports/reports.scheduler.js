const { tickScheduler } = require('./reports.service');

function startReportScheduler() {
  // Check every 5 minutes for due scheduled reports
  setInterval(() => {
    tickScheduler().catch(() => {});
  }, 5 * 60 * 1000);
}

module.exports = { startReportScheduler };
