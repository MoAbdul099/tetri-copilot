const svc = require('./document-templates.service');
const { success, error } = require('../../utils/response');

const getMeta = (req, res) =>
  success(res, { categories: svc.CATEGORIES, tones: svc.TONES, placeholderGroups: svc.PLACEHOLDER_GROUPS });

const list = async (req, res, next) => {
  try { success(res, await svc.list(req.workspaceId, req.query)); } catch (e) { next(e); }
};

const getOne = async (req, res, next) => {
  try {
    success(res, await svc.findById(req.workspaceId, req.params.id));
  } catch (e) {
    if (e.status === 404) return error(res, 'Template not found', 404);
    next(e);
  }
};

const create = async (req, res, next) => {
  try { success(res, await svc.create(req.workspaceId, req.user.id, req.body), 'Template created', 201); } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    success(res, await svc.update(req.workspaceId, req.params.id, req.user.id, req.body));
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await svc.softDelete(req.params.id); success(res, null, 'Template deleted'); } catch (e) { next(e); }
};

const clone = async (req, res, next) => {
  try {
    success(res, await svc.clone(req.workspaceId, req.params.id, req.user.id), 'Template cloned', 201);
  } catch (e) {
    if (e.status === 404) return error(res, 'Template not found', 404);
    next(e);
  }
};

const archive = async (req, res, next) => {
  try { success(res, await svc.archive(req.params.id, req.user.id)); } catch (e) { next(e); }
};

const preview = async (req, res, next) => {
  try { success(res, await svc.previewTemplate(req.workspaceId, req.params.id, req.query)); } catch (e) {
    if (e.status === 404) return error(res, 'Template not found', 404);
    next(e);
  }
};

const generate = async (req, res, next) => {
  try {
    const result = await svc.generateFromTemplate(req.workspaceId, req.user.id, req.params.id, req.body);
    success(res, result);
  } catch (e) {
    if (e.status === 404) return error(res, 'Template not found', 404);
    if (e.status === 400) return error(res, e.message, 400);
    next(e);
  }
};

const aiAssist = async (req, res, next) => {
  try { success(res, await svc.aiGenerateTemplate(req.workspaceId, req.user.id, req.body)); } catch (e) { next(e); }
};

const getBranding = async (req, res, next) => {
  try { success(res, await svc.getBranding(req.workspaceId) || {}); } catch (e) { next(e); }
};

const upsertBranding = async (req, res, next) => {
  try { success(res, await svc.upsertBranding(req.workspaceId, req.body)); } catch (e) { next(e); }
};

module.exports = { getMeta, list, getOne, create, update, remove, clone, archive, preview, generate, aiAssist, getBranding, upsertBranding };
