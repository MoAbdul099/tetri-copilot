const repo = require('./announcements.repository');

const notFound = () => Object.assign(new Error('Announcement not found'), { statusCode: 404 });

const list     = (workspaceId, query) => repo.list(workspaceId, query);
const getActive = (workspaceId, userId) => repo.listActive(workspaceId, userId);
const getStats = (workspaceId) => repo.getStats(workspaceId);

const getById = async (workspaceId, id) => {
  const a = await repo.findById(id, workspaceId);
  if (!a) throw notFound();
  return a;
};

const create = async (workspaceId, userId, data) => {
  if (!data.title?.trim()) throw Object.assign(new Error('Title is required'), { statusCode: 400 });
  return repo.create(workspaceId, userId, data);
};

const update = async (workspaceId, id, data) => {
  const a = await repo.findById(id, workspaceId);
  if (!a) throw notFound();
  if (a.status === 'archived') throw Object.assign(new Error('Archived announcements cannot be edited'), { statusCode: 400 });
  return repo.update(id, workspaceId, data);
};

const publish = async (workspaceId, id) => {
  const a = await repo.findById(id, workspaceId);
  if (!a) throw notFound();
  if (a.status === 'published') return a;
  return repo.publish(id);
};

const archive = async (workspaceId, id) => {
  const a = await repo.findById(id, workspaceId);
  if (!a) throw notFound();
  return repo.archive(id);
};

const remove = async (workspaceId, id) => {
  const a = await repo.findById(id, workspaceId);
  if (!a) throw notFound();
  if (a.status === 'published') throw Object.assign(new Error('Published announcements cannot be deleted'), { statusCode: 400 });
  return repo.remove(id);
};

const markRead = (workspaceId, userId, id) => repo.markRead(id, userId);

module.exports = { list, getActive, getStats, getById, create, update, publish, archive, remove, markRead };
