const prisma = require('../../lib/prisma');
const repo = require('./activity.repository');

const DEFAULT_RETENTION_MONTHS = 24;

async function runRetentionCleanup() {
  try {
    const workspaces = await prisma.workspace.findMany({ select: { id: true } });

    let total = 0;
    for (const ws of workspaces) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - DEFAULT_RETENTION_MONTHS);
      const { count } = await repo.deleteOlderThan(ws.id, cutoff);
      total += count;
    }

    if (total > 0) console.log(`[ActivityRetention] purged ${total} records older than ${DEFAULT_RETENTION_MONTHS} months`);
  } catch (err) {
    console.error('[ActivityRetention] cleanup error:', err.message);
  }
}

function startRetentionJob() {
  // Run once 30s after startup, then every 24h
  setTimeout(runRetentionCleanup, 30_000);
  setInterval(runRetentionCleanup, 24 * 60 * 60 * 1000);
}

module.exports = { startRetentionJob };
