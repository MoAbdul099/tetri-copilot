const repo = require('./reminder-rules.repository');

const notFound = () => Object.assign(new Error('Reminder rule not found'), { statusCode: 404 });

const CATEGORIES = ['invoice', 'expense', 'compliance', 'approval', 'subscription', 'operational'];

const list  = (workspaceId) => repo.list(workspaceId);
const stats = (workspaceId) => repo.getStats(workspaceId);

const getById = async (workspaceId, id) => {
  const r = await repo.findById(id, workspaceId);
  if (!r) throw notFound();
  return r;
};

const create = async (workspaceId, data) => {
  if (!data.name?.trim())  throw Object.assign(new Error('Name is required'), { statusCode: 400 });
  if (!CATEGORIES.includes(data.category)) throw Object.assign(new Error('Invalid category'), { statusCode: 400 });
  if (!Array.isArray(data.schedule) || data.schedule.length === 0)
    throw Object.assign(new Error('Schedule must be a non-empty array'), { statusCode: 400 });
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

module.exports = { list, stats, getById, create, update, remove };
