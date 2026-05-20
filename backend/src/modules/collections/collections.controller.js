const service = require('./collections.service');
const { success } = require('../../utils/response');

// ── Activities ─────────────────────────────────────────────
const listActivities = async (req, res, next) => {
  try { success(res, await service.listActivities(req.workspaceId, req.query)); } catch (e) { next(e); }
};

const getActivity = async (req, res, next) => {
  try {
    const data = await service.getActivity(req.params.id, req.workspaceId);
    if (!data) return res.status(404).json({ success: false, error: 'Activity not found' });
    success(res, data);
  } catch (e) { next(e); }
};

const createActivity = async (req, res, next) => {
  try { success(res, await service.createActivity(req.workspaceId, req.user.id, req.body), '', 201); } catch (e) { next(e); }
};

const updateActivity = async (req, res, next) => {
  try { success(res, await service.updateActivity(req.params.id, req.workspaceId, req.body)); } catch (e) { next(e); }
};

const deleteActivity = async (req, res, next) => {
  try { await service.deleteActivity(req.params.id, req.workspaceId); res.status(204).end(); } catch (e) { next(e); }
};

// ── Promises ───────────────────────────────────────────────
const listPromises = async (req, res, next) => {
  try { success(res, await service.listPromises(req.workspaceId, req.query)); } catch (e) { next(e); }
};

const getPromise = async (req, res, next) => {
  try {
    const data = await service.getPromise(req.params.id, req.workspaceId);
    if (!data) return res.status(404).json({ success: false, error: 'Promise not found' });
    success(res, data);
  } catch (e) { next(e); }
};

const createPromise = async (req, res, next) => {
  try { success(res, await service.createPromise(req.workspaceId, req.user.id, req.body), '', 201); } catch (e) { next(e); }
};

const updatePromise = async (req, res, next) => {
  try { success(res, await service.updatePromise(req.params.id, req.workspaceId, req.body)); } catch (e) { next(e); }
};

const deletePromise = async (req, res, next) => {
  try { await service.deletePromise(req.params.id, req.workspaceId); res.status(204).end(); } catch (e) { next(e); }
};

// ── Queue ──────────────────────────────────────────────────
const getQueue = async (req, res, next) => {
  try { success(res, await service.getQueue(req.workspaceId)); } catch (e) { next(e); }
};

module.exports = {
  listActivities, getActivity, createActivity, updateActivity, deleteActivity,
  listPromises, getPromise, createPromise, updatePromise, deletePromise,
  getQueue,
};
