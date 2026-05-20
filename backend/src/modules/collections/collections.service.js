const repo = require('./collections.repository');

const listActivities  = (workspaceId, query)         => repo.listActivities(workspaceId, query);
const getActivity     = (id, workspaceId)             => repo.findActivity(id, workspaceId);
const createActivity  = (workspaceId, userId, data)   => repo.createActivity(workspaceId, userId, data);
const updateActivity  = (id, workspaceId, data)       => repo.updateActivity(id, workspaceId, data);
const deleteActivity  = (id, workspaceId)             => repo.deleteActivity(id, workspaceId);

const listPromises    = (workspaceId, query)          => repo.listPromises(workspaceId, query);
const getPromise      = (id, workspaceId)             => repo.findPromise(id, workspaceId);
const createPromise   = (workspaceId, userId, data)   => repo.createPromise(workspaceId, userId, data);
const updatePromise   = (id, workspaceId, data)       => repo.updatePromise(id, workspaceId, data);
const deletePromise   = (id, workspaceId)             => repo.deletePromise(id, workspaceId);

const getQueue        = (workspaceId)                 => repo.getQueue(workspaceId);

module.exports = {
  listActivities, getActivity, createActivity, updateActivity, deleteActivity,
  listPromises, getPromise, createPromise, updatePromise, deletePromise,
  getQueue,
};
