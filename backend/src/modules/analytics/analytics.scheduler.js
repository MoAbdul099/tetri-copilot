const prisma = require('../../lib/prisma');
const svc    = require('./analytics.service');

async function tickAnalytics() {
  const workspaces = await prisma.workspace.findMany({ select: { id: true } });
  for (const ws of workspaces) {
    await svc.refreshAnalytics(ws.id).catch(() => {});
  }
}

function startAnalyticsScheduler() {
  // Run once at startup (deferred), then every 6 hours
  setTimeout(() => tickAnalytics().catch(() => {}), 10000);
  setInterval(() => tickAnalytics().catch(() => {}), 6 * 60 * 60 * 1000);
}

module.exports = { startAnalyticsScheduler, tickAnalytics };
