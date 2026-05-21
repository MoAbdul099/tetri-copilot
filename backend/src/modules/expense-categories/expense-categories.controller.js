const repo = require('./expense-categories.repository');
const { success } = require('../../utils/response');

const list = async (req, res, next) => {
  try { success(res, await repo.list(req.workspaceId, req.query)); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try { success(res, await repo.create(req.workspaceId, req.body), '', 201); } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { success(res, await repo.update(req.params.id, req.body)); } catch (e) { next(e); }
};

const archive = async (req, res, next) => {
  try { success(res, await repo.archive(req.params.id)); } catch (e) { next(e); }
};

const restore = async (req, res, next) => {
  try { success(res, await repo.restore(req.params.id)); } catch (e) { next(e); }
};

const seedDefaults = async (req, res, next) => {
  try { success(res, await repo.seedDefaults(req.workspaceId)); } catch (e) { next(e); }
};

module.exports = { list, create, update, archive, restore, seedDefaults };
