const { success, error } = require('../../../utils/response');
const repo = require('./admin.compliance.repository');
const prisma = require('../../../lib/prisma');

const logActivity = (req, action, details = {}) =>
  prisma.adminActivityLog.create({
    data: {
      adminUserId: req.adminUser.id,
      action,
      targetType: 'compliance_pack',
      details,
    },
  }).catch(() => {});

// GET /api/admin/compliance/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await repo.getStats();
    return success(res, stats);
  } catch (err) { next(err); }
};

// GET /api/admin/compliance/jurisdictions
const listJurisdictions = async (req, res, next) => {
  try {
    const items = await repo.listJurisdictions();
    return success(res, items);
  } catch (err) { next(err); }
};

// GET /api/admin/compliance/categories
const listCategories = async (req, res, next) => {
  try {
    const items = await repo.listCategories();
    return success(res, items);
  } catch (err) { next(err); }
};

// GET /api/admin/compliance/templates
const list = async (req, res, next) => {
  try {
    const { search, status, jurisdictionId, industry, page, limit } = req.query;
    const result = await repo.list({ search, status, jurisdictionId, industry, page, limit });
    return success(res, result);
  } catch (err) { next(err); }
};

// GET /api/admin/compliance/templates/:id
const getById = async (req, res, next) => {
  try {
    const pack = await repo.findById(req.params.id);
    if (!pack) return error(res, 'Template not found', 404);
    return success(res, pack);
  } catch (err) { next(err); }
};

// POST /api/admin/compliance/templates
const create = async (req, res, next) => {
  try {
    const { name, description, jurisdictionId, industry, version, versionNotes, effectiveDate } = req.body;
    if (!name || !jurisdictionId) return error(res, 'Name and jurisdiction are required', 400);

    const pack = await repo.create({
      name,
      description: description || null,
      jurisdictionId,
      industry: industry || null,
      version: version || '1.0',
      versionNotes: versionNotes || null,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
      status: 'draft',
    });
    logActivity(req, 'compliance_template_created', { templateId: pack.id, name });
    return success(res, pack, 'Template created', 201);
  } catch (err) { next(err); }
};

// PUT /api/admin/compliance/templates/:id
const update = async (req, res, next) => {
  try {
    const { name, description, jurisdictionId, industry, version, versionNotes, effectiveDate } = req.body;
    const pack = await repo.update(req.params.id, {
      ...(name && { name }),
      description: description ?? undefined,
      ...(jurisdictionId && { jurisdictionId }),
      industry: industry ?? undefined,
      ...(version && { version }),
      versionNotes: versionNotes ?? undefined,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
    });
    logActivity(req, 'compliance_template_updated', { templateId: pack.id, name: pack.name });
    return success(res, pack, 'Template updated');
  } catch (err) { next(err); }
};

// POST /api/admin/compliance/templates/:id/publish
const publish = async (req, res, next) => {
  try {
    const pack = await repo.findById(req.params.id);
    if (!pack) return error(res, 'Template not found', 404);
    if (pack.status === 'archived') return error(res, 'Cannot publish an archived template', 400);

    const updated = pack.status === 'published'
      ? await repo.unpublish(req.params.id)
      : await repo.publish(req.params.id);

    logActivity(req, updated.status === 'published' ? 'compliance_template_published' : 'compliance_template_unpublished', { templateId: pack.id });
    return success(res, updated, `Template ${updated.status === 'published' ? 'published' : 'unpublished'}`);
  } catch (err) { next(err); }
};

// POST /api/admin/compliance/templates/:id/archive
const archive = async (req, res, next) => {
  try {
    const pack = await repo.archive(req.params.id);
    logActivity(req, 'compliance_template_archived', { templateId: pack.id, name: pack.name });
    return success(res, pack, 'Template archived');
  } catch (err) { next(err); }
};

// POST /api/admin/compliance/templates/:id/clone
const clone = async (req, res, next) => {
  try {
    const pack = await repo.clone(req.params.id, req.adminUser.id);
    if (!pack) return error(res, 'Template not found', 404);
    logActivity(req, 'compliance_template_cloned', { sourceId: req.params.id, newId: pack.id });
    return success(res, pack, 'Template cloned', 201);
  } catch (err) { next(err); }
};

// GET /api/admin/compliance/templates/:id/workspaces
const getWorkspaceImpact = async (req, res, next) => {
  try {
    const impact = await repo.getWorkspaceImpact(req.params.id);
    if (!impact) return error(res, 'Template not found', 404);
    return success(res, impact);
  } catch (err) { next(err); }
};

// POST /api/admin/compliance/templates/:id/obligations
const createObligation = async (req, res, next) => {
  try {
    const { name, description, frequency, category, priority, dueDayOfMonth, dueMonthOfYear, reminderDays, submissionMethod, notes } = req.body;
    if (!name || !frequency) return error(res, 'Name and frequency are required', 400);

    const obligation = await repo.createObligation({
      packId: req.params.id,
      name,
      description: description || null,
      frequency,
      category: category || null,
      priority: priority || 'medium',
      dueDayOfMonth: dueDayOfMonth ? parseInt(dueDayOfMonth) : null,
      dueMonthOfYear: dueMonthOfYear ? parseInt(dueMonthOfYear) : null,
      reminderDays: reminderDays ? parseInt(reminderDays) : 7,
      submissionMethod: submissionMethod || null,
      notes: notes || null,
    });
    logActivity(req, 'compliance_obligation_added', { templateId: req.params.id, obligationName: name });
    return success(res, obligation, 'Obligation added', 201);
  } catch (err) { next(err); }
};

// PUT /api/admin/compliance/templates/:id/obligations/:oid
const updateObligation = async (req, res, next) => {
  try {
    const { name, description, frequency, category, priority, dueDayOfMonth, dueMonthOfYear, reminderDays, submissionMethod, notes, isActive } = req.body;
    const obligation = await repo.updateObligation(req.params.oid, {
      ...(name && { name }),
      description: description ?? undefined,
      ...(frequency && { frequency }),
      category: category ?? undefined,
      ...(priority && { priority }),
      dueDayOfMonth: dueDayOfMonth != null ? parseInt(dueDayOfMonth) : undefined,
      dueMonthOfYear: dueMonthOfYear != null ? parseInt(dueMonthOfYear) : undefined,
      reminderDays: reminderDays != null ? parseInt(reminderDays) : undefined,
      submissionMethod: submissionMethod ?? undefined,
      notes: notes ?? undefined,
      ...(isActive != null && { isActive }),
    });
    logActivity(req, 'compliance_obligation_updated', { templateId: req.params.id, obligationId: req.params.oid });
    return success(res, obligation, 'Obligation updated');
  } catch (err) { next(err); }
};

// DELETE /api/admin/compliance/templates/:id/obligations/:oid
const deleteObligation = async (req, res, next) => {
  try {
    await repo.deleteObligation(req.params.oid);
    logActivity(req, 'compliance_obligation_removed', { templateId: req.params.id, obligationId: req.params.oid });
    return success(res, null, 'Obligation removed');
  } catch (err) { next(err); }
};

module.exports = {
  getStats, listJurisdictions, listCategories,
  list, getById, create, update, publish, archive, clone, getWorkspaceImpact,
  createObligation, updateObligation, deleteObligation,
};
