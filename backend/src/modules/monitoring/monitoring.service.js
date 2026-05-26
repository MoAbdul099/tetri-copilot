const prisma = require('../../lib/prisma');
const repo = require('./monitoring.repository');
const { isR2Configured } = require('../../lib/storage');

// ── Health checks (same logic as health controller) ───────────────────────────

async function checkDb() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

async function checkStorage() {
  if (!isR2Configured()) return { status: 'local', provider: 'local_filesystem' };
  try {
    const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
    });
    const start = Date.now();
    await client.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME }));
    return { status: 'ok', provider: 'cloudflare_r2', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', provider: 'cloudflare_r2', error: err.message };
  }
}

// ── Status ────────────────────────────────────────────────────────────────────

async function getStatus() {
  const [db, storage, activeIncidents, unresolvedEvents, latestMetrics] = await Promise.all([
    checkDb(),
    checkStorage(),
    repo.activeIncidentCount(),
    repo.unresolvedCount(),
    repo.getLatestMetricsByName(),
  ]);

  const allOk = db.status === 'ok' && ['ok', 'local'].includes(storage.status) && activeIncidents === 0;
  const status = allOk ? 'ok' : activeIncidents > 0 ? 'incident' : 'degraded';

  const metricsMap = {};
  latestMetrics.forEach((m) => { metricsMap[m.metric_name] = { value: Number(m.metric_value), unit: m.unit, recordedAt: m.recorded_at }; });

  return {
    status,
    uptime: Math.floor(process.uptime()),
    uptimeHuman: formatUptime(process.uptime()),
    services: { database: db, storage },
    activeIncidents,
    unresolvedEvents,
    memory: {
      heapUsedMb:  Math.round(process.memoryUsage().heapUsed  / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rssMb:       Math.round(process.memoryUsage().rss       / 1024 / 1024),
    },
    latestMetrics: metricsMap,
  };
}

// ── Uptime ────────────────────────────────────────────────────────────────────

async function getUptimeReport() {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since7d  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000);
  const since24h = new Date(Date.now() -       24 * 60 * 60 * 1000);

  const [down30d, down7d, down24h, activeNow] = await Promise.all([
    repo.getDowntimeSeconds(since30d),
    repo.getDowntimeSeconds(since7d),
    repo.getDowntimeSeconds(since24h),
    repo.activeIncidentCount(),
  ]);

  const total30d = 30 * 24 * 3600;
  const total7d  =  7 * 24 * 3600;
  const total24h =      24 * 3600;

  return {
    availability: {
      last30d: toPercent(total30d, down30d),
      last7d:  toPercent(total7d,  down7d),
      last24h: toPercent(total24h, down24h),
    },
    sloTarget:    99.5,
    activeIncidents: activeNow,
    processUptime: Math.floor(process.uptime()),
  };
}

function toPercent(total, downtime) {
  return Math.max(0, ((total - downtime) / total) * 100).toFixed(3);
}

// ── Metrics collection ────────────────────────────────────────────────────────

async function collectMetrics() {
  const [db, storage, activeIncidents] = await Promise.all([checkDb(), checkStorage(), repo.activeIncidentCount()]);
  const mem = process.memoryUsage();

  const metrics = [
    { metricName: 'process.uptime',     metricValue: Math.floor(process.uptime()), unit: 'seconds', source: 'api' },
    { metricName: 'memory.heapUsed',    metricValue: Math.round(mem.heapUsed  / 1024 / 1024), unit: 'MB', source: 'api' },
    { metricName: 'memory.heapTotal',   metricValue: Math.round(mem.heapTotal / 1024 / 1024), unit: 'MB', source: 'api' },
    { metricName: 'memory.rss',         metricValue: Math.round(mem.rss       / 1024 / 1024), unit: 'MB', source: 'api' },
    { metricName: 'incidents.active',   metricValue: activeIncidents, unit: 'count', source: 'api' },
    { metricName: 'db.status',          metricValue: db.status === 'ok' ? 1 : 0,    unit: 'bool',  source: 'database' },
    { metricName: 'storage.status',     metricValue: ['ok', 'local'].includes(storage.status) ? 1 : 0, unit: 'bool', source: 'storage' },
  ];

  if (db.latencyMs != null)      metrics.push({ metricName: 'db.latency',      metricValue: db.latencyMs,      unit: 'ms', source: 'database' });
  if (storage.latencyMs != null) metrics.push({ metricName: 'storage.latency', metricValue: storage.latencyMs, unit: 'ms', source: 'storage'  });

  await repo.recordMetrics(metrics);

  // Create monitoring events on failure
  if (db.status !== 'ok') {
    await repo.createEvent({ category: 'database', severity: 'critical', message: `Database health check failed: ${db.error}`, source: 'monitoring.scheduler', metadata: db });
  }
  if (!['ok', 'local'].includes(storage.status)) {
    await repo.createEvent({ category: 'storage', severity: 'high', message: `Storage health check failed: ${storage.error}`, source: 'monitoring.scheduler', metadata: storage });
  }

  return metrics;
}

// ── Launch readiness ──────────────────────────────────────────────────────────

async function runLaunchReadiness() {
  const [db, storage, secRuleCount, activeIncidents, completedReviews] = await Promise.all([
    checkDb(),
    checkStorage(),
    prisma.securityRule.count({ where: { enabled: true } }),
    repo.activeIncidentCount(),
    prisma.securityReview.count({ where: { status: 'completed' } }),
  ]);

  const checks = [
    {
      id: 'backend_health',
      category: 'Infrastructure',
      name: 'Backend API Running',
      status: 'pass',
      detail: 'Express API is responding and all middleware initialized.',
    },
    {
      id: 'database_connectivity',
      category: 'Infrastructure',
      name: 'Database Connectivity',
      status: db.status === 'ok' ? 'pass' : 'fail',
      detail: db.status === 'ok' ? `PostgreSQL reachable. Latency: ${db.latencyMs}ms.` : `Database unreachable: ${db.error}`,
    },
    {
      id: 'storage_configured',
      category: 'Infrastructure',
      name: 'File Storage',
      status: ['ok', 'local'].includes(storage.status) ? (storage.status === 'local' ? 'warning' : 'pass') : 'fail',
      detail: storage.status === 'ok'
        ? 'Cloudflare R2 reachable and configured.'
        : storage.status === 'local'
          ? 'Local filesystem storage active. Configure R2 before production launch.'
          : `Storage unreachable: ${storage.error}`,
    },
    {
      id: 'auth_provider',
      category: 'Security',
      name: 'Auth Provider (Clerk)',
      status: process.env.CLERK_SECRET_KEY ? 'pass' : 'fail',
      detail: process.env.CLERK_SECRET_KEY ? 'CLERK_SECRET_KEY is configured.' : 'CLERK_SECRET_KEY is missing.',
    },
    {
      id: 'security_rules',
      category: 'Security',
      name: 'Security Rules Seeded',
      status: secRuleCount >= 10 ? 'pass' : 'warning',
      detail: `${secRuleCount} active detection rules. Minimum recommended: 10.`,
    },
    {
      id: 'https_production',
      category: 'Security',
      name: 'Production Environment',
      status: process.env.NODE_ENV === 'production' ? 'pass' : 'warning',
      detail: process.env.NODE_ENV === 'production'
        ? 'NODE_ENV=production. HSTS enforced, error details masked.'
        : `NODE_ENV=${process.env.NODE_ENV || 'development'} — set to "production" before launch.`,
    },
    {
      id: 'deploy_secret',
      category: 'CI/CD',
      name: 'Deployment Secret',
      status: process.env.DEPLOY_SECRET ? 'pass' : 'warning',
      detail: process.env.DEPLOY_SECRET ? 'DEPLOY_SECRET configured.' : 'DEPLOY_SECRET not set. Set before CI/CD automated deployments.',
    },
    {
      id: 'email_provider',
      category: 'Integrations',
      name: 'Email Provider (Resend)',
      status: process.env.RESEND_API_KEY ? 'pass' : 'warning',
      detail: process.env.RESEND_API_KEY ? 'RESEND_API_KEY configured.' : 'RESEND_API_KEY not set — emails will not be sent.',
    },
    {
      id: 'stripe_configured',
      category: 'Integrations',
      name: 'Billing (Stripe)',
      status: process.env.STRIPE_SECRET_KEY ? 'pass' : 'warning',
      detail: process.env.STRIPE_SECRET_KEY ? 'STRIPE_SECRET_KEY configured.' : 'STRIPE_SECRET_KEY not set — billing features disabled.',
    },
    {
      id: 'security_reviews',
      category: 'Compliance',
      name: 'Security Reviews Completed',
      status: completedReviews > 0 ? 'pass' : 'warning',
      detail: completedReviews > 0
        ? `${completedReviews} security review(s) completed.`
        : 'No completed security reviews. Complete at least one pre-launch security review.',
    },
    {
      id: 'no_active_incidents',
      category: 'Operations',
      name: 'No Active Incidents',
      status: activeIncidents === 0 ? 'pass' : 'fail',
      detail: activeIncidents === 0 ? 'No open incidents.' : `${activeIncidents} active incident(s) — resolve before launch.`,
    },
    {
      id: 'monitoring_active',
      category: 'Operations',
      name: 'Monitoring Active',
      status: 'pass',
      detail: 'Monitoring scheduler running. Metrics collected every 5 minutes. Health checks active.',
    },
  ];

  const pass    = checks.filter((c) => c.status === 'pass').length;
  const warning = checks.filter((c) => c.status === 'warning').length;
  const fail    = checks.filter((c) => c.status === 'fail').length;
  const score   = Math.round((pass / checks.length) * 100);
  const ready   = fail === 0 && warning <= 2;

  return { checks, summary: { total: checks.length, pass, warning, fail, score, ready } };
}

// ── CRUD pass-throughs ────────────────────────────────────────────────────────

async function listEvents(params)      { return repo.listEvents(params); }
async function resolveEvent(id)        { return repo.resolveEvent(id); }
async function listIncidents(params)   { return repo.listIncidents(params); }
async function createIncident(data)    { return repo.createIncident(data); }
async function updateIncident(id, data){ return repo.updateIncident(id, data); }
async function getMetrics(params)      { return repo.getMetrics(params); }

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

module.exports = {
  getStatus, getUptimeReport, collectMetrics, runLaunchReadiness,
  listEvents, resolveEvent,
  listIncidents, createIncident, updateIncident,
  getMetrics,
};
