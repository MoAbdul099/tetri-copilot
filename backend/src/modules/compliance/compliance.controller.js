const svc = require('./compliance.service');
const { success } = require('../../utils/response');

// ── Jurisdictions & Authorities ────────────────────────────

const listJurisdictions = async (req, res, next) => {
  try {
    success(res, await svc.listJurisdictions());
  } catch (e) { next(e); }
};

const listAuthorities = async (req, res, next) => {
  try {
    success(res, await svc.listAuthorities(req.query));
  } catch (e) { next(e); }
};

// ── Categories ─────────────────────────────────────────────

const listCategories = async (req, res, next) => {
  try {
    success(res, await svc.listCategories(req.workspaceId));
  } catch (e) { next(e); }
};

const createCategory = async (req, res, next) => {
  try {
    success(res, await svc.createCategory(req.workspaceId, req.body), '', 201);
  } catch (e) { next(e); }
};

const updateCategory = async (req, res, next) => {
  try {
    success(res, await svc.updateCategory(req.workspaceId, req.params.id, req.body));
  } catch (e) { next(e); }
};

const deleteCategory = async (req, res, next) => {
  try {
    await svc.deleteCategory(req.workspaceId, req.params.id);
    success(res, null, 'Category deleted');
  } catch (e) { next(e); }
};

// ── Packs ──────────────────────────────────────────────────

const listPacks = async (req, res, next) => {
  try {
    success(res, await svc.listPacks(req.query));
  } catch (e) { next(e); }
};

const getPack = async (req, res, next) => {
  try {
    success(res, await svc.getPackById(req.params.id));
  } catch (e) { next(e); }
};

const installPack = async (req, res, next) => {
  try {
    const result = await svc.installPack(req.workspaceId, req.params.id, req.user.id);
    success(res, result, 'Compliance pack installed', 201);
  } catch (e) { next(e); }
};

// ── Templates ──────────────────────────────────────────────

const listTemplates = async (req, res, next) => {
  try {
    success(res, await svc.listTemplates(req.workspaceId, req.query));
  } catch (e) { next(e); }
};

const getTemplate = async (req, res, next) => {
  try {
    success(res, await svc.getTemplate(req.workspaceId, req.params.id));
  } catch (e) { next(e); }
};

const createTemplate = async (req, res, next) => {
  try {
    success(res, await svc.createTemplate(req.workspaceId, req.user.id, req.body), '', 201);
  } catch (e) { next(e); }
};

const updateTemplate = async (req, res, next) => {
  try {
    success(res, await svc.updateTemplate(req.workspaceId, req.user.id, req.params.id, req.body));
  } catch (e) { next(e); }
};

const deleteTemplate = async (req, res, next) => {
  try {
    await svc.deleteTemplate(req.workspaceId, req.params.id);
    success(res, null, 'Compliance template deleted');
  } catch (e) { next(e); }
};

const generateOccurrences = async (req, res, next) => {
  try {
    const result = await svc.generateOccurrencesForTemplate(req.workspaceId, req.params.id, req.user.id);
    success(res, result, result.message, 201);
  } catch (e) { next(e); }
};

// ── Occurrences ────────────────────────────────────────────

const listOccurrences = async (req, res, next) => {
  try {
    success(res, await svc.listOccurrences(req.workspaceId, req.query));
  } catch (e) { next(e); }
};

const getOccurrence = async (req, res, next) => {
  try {
    success(res, await svc.getOccurrence(req.workspaceId, req.params.id));
  } catch (e) { next(e); }
};

const updateOccurrence = async (req, res, next) => {
  try {
    success(res, await svc.updateOccurrence(req.workspaceId, req.params.id, req.user.id, req.body));
  } catch (e) { next(e); }
};

const recordSubmission = async (req, res, next) => {
  try {
    success(res, await svc.recordSubmission(req.workspaceId, req.params.id, req.user.id, req.body), 'Submission recorded', 201);
  } catch (e) { next(e); }
};

const addComment = async (req, res, next) => {
  try {
    success(res, await svc.addComment(req.workspaceId, req.params.id, req.user.id, req.body.body), '', 201);
  } catch (e) { next(e); }
};

const deleteComment = async (req, res, next) => {
  try {
    await svc.deleteComment(req.workspaceId, req.params.id, req.params.commentId, req.user.id);
    success(res, null, 'Comment deleted');
  } catch (e) { next(e); }
};

// ── Calendar ───────────────────────────────────────────────

const getCalendarEvents = async (req, res, next) => {
  try {
    success(res, await svc.getCalendarEvents(req.workspaceId, req.query));
  } catch (e) { next(e); }
};

// ── Stats & Recommendations ────────────────────────────────

const getStats = async (req, res, next) => {
  try {
    success(res, await svc.getStats(req.workspaceId));
  } catch (e) { next(e); }
};

const getRecommendations = async (req, res, next) => {
  try {
    success(res, await svc.getRecommendations(req.workspaceId));
  } catch (e) { next(e); }
};

module.exports = {
  listJurisdictions,
  listAuthorities,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listPacks,
  getPack,
  installPack,
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateOccurrences,
  listOccurrences,
  getOccurrence,
  updateOccurrence,
  recordSubmission,
  addComment,
  deleteComment,
  getCalendarEvents,
  getStats,
  getRecommendations,
};
