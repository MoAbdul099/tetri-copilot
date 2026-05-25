const repo = require('./escalation-rules.repository');

const notFound = () => Object.assign(new Error('Escalation rule not found'), { statusCode: 404 });

const TRIGGER_TYPES = ['approval_overdue', 'invoice_overdue', 'compliance_overdue', 'payment_failure', 'subscription_risk'];

const list           = (workspaceId) => repo.list(workspaceId);
const stats          = (workspaceId) => repo.getStats(workspaceId);
const listInstances  = (workspaceId, query) => repo.listInstances(workspaceId, query);

const getById = async (workspaceId, id) => {
  const r = await repo.findById(id, workspaceId);
  if (!r) throw notFound();
  return r;
};

const create = async (workspaceId, data) => {
  if (!data.name?.trim()) throw Object.assign(new Error('Name is required'), { statusCode: 400 });
  if (!TRIGGER_TYPES.includes(data.triggerType))
    throw Object.assign(new Error('Invalid trigger type'), { statusCode: 400 });
  if (!Array.isArray(data.levels) || data.levels.length === 0)
    throw Object.assign(new Error('At least one escalation level is required'), { statusCode: 400 });
  return repo.create(workspaceId, data);
};

const update = async (workspaceId, id, data) => {
  const r = await repo.findById(id, workspaceId);
  if (!r) throw notFound();
  return repo.update(id, data);
};

const remove = async (workspaceId, id) => {
  const r = await repo.findById(id, workspaceId);
  if (!r) throw notFound();
  return repo.remove(id);
};

const resolveInstance = (workspaceId, id) => repo.resolveInstance(id);

module.exports = { list, stats, listInstances, getById, create, update, remove, resolveInstance };
