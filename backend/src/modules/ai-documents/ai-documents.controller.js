const svc = require('./ai-documents.service');
const { success, error } = require('../../utils/response');

const getCategories = async (req, res) => {
  return success(res, { categories: svc.CATEGORIES, tones: svc.TONES });
};

const list = async (req, res, next) => {
  try {
    const result = await svc.list(req.workspaceId, req.query);
    return success(res, result);
  } catch (e) { next(e); }
};

const getOne = async (req, res, next) => {
  try {
    const doc = await svc.findById(req.workspaceId, req.params.id);
    return success(res, doc);
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

const generate = async (req, res, next) => {
  try {
    const result = await svc.generate(req.workspaceId, req.user.id, req.body);
    return success(res, result);
  } catch (e) { next(e); }
};

const save = async (req, res, next) => {
  try {
    const doc = await svc.save(req.workspaceId, req.user.id, req.body);
    return success(res, doc, 'Document saved', 201);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const doc = await svc.updateDoc(req.workspaceId, req.user.id, req.params.id, req.body);
    return success(res, doc);
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    await svc.softDelete(req.workspaceId, req.params.id);
    return success(res, null, 'Document deleted');
  } catch (e) { next(e); }
};

const regenerate = async (req, res, next) => {
  try {
    const doc = await svc.regenerate(req.workspaceId, req.user.id, req.params.id);
    return success(res, doc);
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

module.exports = { getCategories, list, getOne, generate, save, update, remove, regenerate };
