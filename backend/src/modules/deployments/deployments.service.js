const repo = require('./deployments.repository');

async function listDeployments(params) {
  return repo.list(params);
}

async function getDeployment(id) {
  const d = await repo.findById(id);
  if (!d) throw Object.assign(new Error('Deployment not found'), { status: 404 });
  return d;
}

async function startDeployment({ environment, version, triggeredBy, notes, metadata }) {
  const log = await repo.create({
    environment,
    version,
    status: 'running',
    startedAt: new Date(),
    triggeredBy,
    notes,
    metadata: metadata || null,
  });
  await repo.addAuditEntry(log.id, {
    action: 'deployment.started',
    actor: triggeredBy,
    details: { environment, version },
  });
  return log;
}

async function completeDeployment(id, { status, notes, actor }) {
  const now = new Date();
  const existing = await repo.findById(id);
  if (!existing) throw Object.assign(new Error('Deployment not found'), { status: 404 });

  const durationMs = existing.startedAt ? now - existing.startedAt : null;
  const log = await repo.update(id, {
    status,
    completedAt: now,
    durationMs,
    notes: notes || existing.notes,
  });

  const action = status === 'success' ? 'deployment.completed' : 'deployment.failed';
  await repo.addAuditEntry(id, { action, actor, details: { status, durationMs } });
  return log;
}

async function addAuditEntry(deploymentId, data) {
  const d = await repo.findById(deploymentId);
  if (!d) throw Object.assign(new Error('Deployment not found'), { status: 404 });
  return repo.addAuditEntry(deploymentId, data);
}

async function getLatestByEnvironment(environment) {
  return repo.getLatest(environment);
}

module.exports = { listDeployments, getDeployment, startDeployment, completeDeployment, addAuditEntry, getLatestByEnvironment };
