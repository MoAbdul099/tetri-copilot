const prisma = require('../../lib/prisma');

// ── Monitoring Events ─────────────────────────────────────────────────────────

async function createEvent({ category, severity, message, source, metadata }) {
  return prisma.monitoringEvent.create({
    data: { category, severity, message, source, metadata: metadata || null },
  });
}

async function listEvents({ category, severity, resolved, limit = 50, offset = 0 } = {}) {
  const where = {};
  if (category  !== undefined) where.category = category;
  if (severity  !== undefined) where.severity  = severity;
  if (resolved  !== undefined) where.resolved  = resolved === 'true' || resolved === true;

  const [rows, total] = await Promise.all([
    prisma.monitoringEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    }),
    prisma.monitoringEvent.count({ where }),
  ]);
  return { rows, total };
}

async function resolveEvent(id) {
  return prisma.monitoringEvent.update({
    where: { id },
    data: { resolved: true, resolvedAt: new Date() },
  });
}

async function unresolvedCount() {
  return prisma.monitoringEvent.count({ where: { resolved: false } });
}

// ── Incidents ─────────────────────────────────────────────────────────────────

async function listIncidents({ status, severity, limit = 50, offset = 0 } = {}) {
  const where = {};
  if (status)   where.status   = status;
  if (severity) where.severity = severity;

  const [rows, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    }),
    prisma.incident.count({ where }),
  ]);
  return { rows, total };
}

async function createIncident({ title, description, severity, affectedServices, reportedBy, startedAt }) {
  return prisma.incident.create({
    data: {
      title,
      description: description || null,
      severity,
      status: 'open',
      affectedServices: affectedServices || null,
      timeline: [{ at: new Date().toISOString(), event: 'Incident opened', actor: reportedBy }],
      reportedBy,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
    },
  });
}

async function updateIncident(id, { status, description, affectedServices, timelineEntry, resolvedAt }) {
  const existing = await prisma.incident.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Incident not found'), { status: 404 });

  const data = {};
  if (status   !== undefined) data.status   = status;
  if (description !== undefined) data.description = description;
  if (affectedServices !== undefined) data.affectedServices = affectedServices;
  if (status === 'resolved' && !existing.resolvedAt) data.resolvedAt = resolvedAt ? new Date(resolvedAt) : new Date();

  if (timelineEntry) {
    const currentTimeline = Array.isArray(existing.timeline) ? existing.timeline : [];
    data.timeline = [...currentTimeline, { at: new Date().toISOString(), ...timelineEntry }];
  }

  return prisma.incident.update({ where: { id }, data });
}

async function activeIncidentCount() {
  return prisma.incident.count({ where: { status: { in: ['open', 'investigating', 'mitigating'] } } });
}

async function getDowntimeSeconds(since) {
  const resolved = await prisma.incident.findMany({
    where: {
      severity: { in: ['SEV-1', 'SEV-2'] },
      startedAt: { gte: since },
      resolvedAt: { not: null },
    },
    select: { startedAt: true, resolvedAt: true },
  });

  return resolved.reduce((acc, inc) => {
    const dur = (new Date(inc.resolvedAt) - new Date(inc.startedAt)) / 1000;
    return acc + dur;
  }, 0);
}

// ── Service Metrics ───────────────────────────────────────────────────────────

async function recordMetrics(metrics) {
  const now = new Date();
  return prisma.serviceMetric.createMany({
    data: metrics.map((m) => ({ ...m, recordedAt: now })),
  });
}

async function getMetrics({ source, metricName, since, limit = 200 } = {}) {
  const where = {};
  if (source)     where.source     = source;
  if (metricName) where.metricName = metricName;
  if (since)      where.recordedAt = { gte: new Date(since) };

  return prisma.serviceMetric.findMany({
    where,
    orderBy: { recordedAt: 'desc' },
    take: parseInt(limit),
  });
}

async function getLatestMetricsByName() {
  // Pivot: latest value for each distinct metricName
  return prisma.$queryRaw`
    SELECT DISTINCT ON (metric_name) metric_name, metric_value, unit, source, recorded_at
    FROM service_metrics
    ORDER BY metric_name, recorded_at DESC
  `;
}

async function purgeOldMetrics(daysToKeep = 7) {
  const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  return prisma.serviceMetric.deleteMany({ where: { recordedAt: { lt: cutoff } } });
}

module.exports = {
  createEvent, listEvents, resolveEvent, unresolvedCount,
  listIncidents, createIncident, updateIncident, activeIncidentCount, getDowntimeSeconds,
  recordMetrics, getMetrics, getLatestMetricsByName, purgeOldMetrics,
};
