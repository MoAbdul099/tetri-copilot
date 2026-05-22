const repo = require('./budgets.repository');

const list    = (workspaceId)           => repo.list(workspaceId);
const monitor = (workspaceId)           => repo.getMonitoring(workspaceId);

const getOne = async (workspaceId, id) => {
  const b = await repo.findById(id, workspaceId);
  if (!b) { const e = new Error('Budget not found'); e.statusCode = 404; throw e; }
  return b;
};

const create = (workspaceId, userId, data) => {
  const payload = {
    name:        data.name,
    budgetType:  data.budgetType  || 'category',
    amount:      parseFloat(data.amount),
    currencyCode: data.currencyCode || 'USD',
    period:      data.period      || 'monthly',
    startDate:   new Date(data.startDate),
    endDate:     data.endDate ? new Date(data.endDate) : undefined,
    categoryId:  data.categoryId  || undefined,
    department:  data.department  || undefined,
    project:     data.project     || undefined,
    alertAt75:   data.alertAt75   !== false,
    alertAt90:   data.alertAt90   !== false,
    alertAt100:  data.alertAt100  !== false,
  };
  return repo.create(workspaceId, userId, payload);
};

const update = async (workspaceId, id, data) => {
  await getOne(workspaceId, id);
  const payload = {};
  if (data.name        !== undefined) payload.name        = data.name;
  if (data.amount      !== undefined) payload.amount      = parseFloat(data.amount);
  if (data.period      !== undefined) payload.period      = data.period;
  if (data.startDate   !== undefined) payload.startDate   = new Date(data.startDate);
  if (data.endDate     !== undefined) payload.endDate     = new Date(data.endDate);
  if (data.categoryId  !== undefined) payload.categoryId  = data.categoryId || null;
  if (data.department  !== undefined) payload.department  = data.department  || null;
  if (data.project     !== undefined) payload.project     = data.project     || null;
  if (data.alertAt75   !== undefined) payload.alertAt75   = data.alertAt75;
  if (data.alertAt90   !== undefined) payload.alertAt90   = data.alertAt90;
  if (data.alertAt100  !== undefined) payload.alertAt100  = data.alertAt100;
  if (data.isActive    !== undefined) payload.isActive    = data.isActive;
  return repo.update(id, payload);
};

const remove = async (workspaceId, id) => {
  await getOne(workspaceId, id);
  return repo.remove(id);
};

module.exports = { list, monitor, getOne, create, update, remove };
