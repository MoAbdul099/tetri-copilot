const svc = require('./ai-documents.service');
const { success, error } = require('../../utils/response');

const getCategories = async (req, res) => {
  return success(res, {
    categories: svc.CATEGORIES, tones: svc.TONES,
    enhancementTypes: svc.ENHANCEMENT_TYPES,
    transformTones: svc.TRANSFORM_TONES,
    summaryFormats: svc.SUMMARY_FORMATS,
  });
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

// ---- Versioning ----

const getVersions = async (req, res, next) => {
  try {
    const versions = await svc.getVersions(req.workspaceId, req.params.id);
    return success(res, { versions });
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

const getVersion = async (req, res, next) => {
  try {
    const version = await svc.getVersion(req.workspaceId, req.params.id, req.params.versionId);
    return success(res, version);
  } catch (e) {
    if (e.status === 404) return error(res, 'Version not found', 404);
    next(e);
  }
};

const restoreVersion = async (req, res, next) => {
  try {
    const doc = await svc.restoreVersion(req.workspaceId, req.user.id, req.params.id, req.params.versionId);
    return success(res, doc, 'Version restored');
  } catch (e) {
    if (e.status === 404) return error(res, e.message, 404);
    next(e);
  }
};

const compareVersions = async (req, res, next) => {
  try {
    const { sourceVersionId, targetVersionId } = req.body;
    if (!sourceVersionId || !targetVersionId) return error(res, 'sourceVersionId and targetVersionId required', 400);
    const result = await svc.compareVersions(req.workspaceId, req.user.id, req.params.id, sourceVersionId, targetVersionId);
    return success(res, result);
  } catch (e) {
    if (e.status === 404) return error(res, e.message, 404);
    next(e);
  }
};

// ---- AI Enhancement ----

const enhance = async (req, res, next) => {
  try {
    const { enhancementType, instructions } = req.body;
    if (!enhancementType) return error(res, 'enhancementType required', 400);
    const result = await svc.enhance(req.workspaceId, req.user.id, req.params.id, enhancementType, instructions);
    return success(res, result, 'Document enhanced');
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

const transformTone = async (req, res, next) => {
  try {
    const { targetTone } = req.body;
    if (!targetTone) return error(res, 'targetTone required', 400);
    const result = await svc.transformTone(req.workspaceId, req.user.id, req.params.id, targetTone);
    return success(res, result, 'Tone transformed');
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

const generateSummary = async (req, res, next) => {
  try {
    const { format = 'key_points' } = req.body;
    const result = await svc.generateSummary(req.workspaceId, req.user.id, req.params.id, format);
    return success(res, result);
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

const qualityReview = async (req, res, next) => {
  try {
    const result = await svc.qualityReview(req.workspaceId, req.user.id, req.params.id);
    return success(res, result);
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

// ---- Export ----

const exportPdf = async (req, res, next) => {
  try {
    const buffer = await svc.exportPdf(req.workspaceId, req.params.id, req.user.id);
    const doc = await svc.findById(req.workspaceId, req.params.id);
    const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

const exportDocx = async (req, res, next) => {
  try {
    const buffer = await svc.exportDocx(req.workspaceId, req.params.id, req.user.id);
    const doc = await svc.findById(req.workspaceId, req.params.id);
    const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

const exportHtml = async (req, res, next) => {
  try {
    const html = await svc.exportHtml(req.workspaceId, req.params.id, req.user.id);
    return success(res, { html });
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

// ---- Duplicate ----

const duplicate = async (req, res, next) => {
  try {
    const doc = await svc.duplicateDoc(req.workspaceId, req.user.id, req.params.id);
    return success(res, doc, 'Document duplicated', 201);
  } catch (e) {
    if (e.status === 404) return error(res, 'Document not found', 404);
    next(e);
  }
};

// ---- Export History ----

const getExports = async (req, res, next) => {
  try {
    const exports = await svc.getExports(req.workspaceId, req.params.id);
    return success(res, { exports });
  } catch (e) { next(e); }
};

module.exports = {
  getCategories, list, getOne, generate, save, update, remove, regenerate,
  getVersions, getVersion, restoreVersion, compareVersions,
  enhance, transformTone, generateSummary, qualityReview,
  exportPdf, exportDocx, exportHtml,
  duplicate, getExports,
};
