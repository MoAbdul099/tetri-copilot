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
    success(res, result, `Pack installed: ${result.templatesCreated} obligations created, ${result.occurrencesCreated} calendar events scheduled over 24 months`, 201);
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

// ── Analytics & Reports (Slice 9.3) ───────────────────────

const getDashboard = async (req, res, next) => {
  try { success(res, await svc.getDashboard(req.workspaceId)); } catch (e) { next(e); }
};

const getTrends = async (req, res, next) => {
  try { success(res, await svc.getTrends(req.workspaceId, req.query.months)); } catch (e) { next(e); }
};

const getCategoryAnalytics = async (req, res, next) => {
  try { success(res, await svc.getCategoryAnalytics(req.workspaceId)); } catch (e) { next(e); }
};

const getJurisdictionAnalytics = async (req, res, next) => {
  try { success(res, await svc.getJurisdictionAnalytics(req.workspaceId)); } catch (e) { next(e); }
};

const getEscalationAnalytics = async (req, res, next) => {
  try { success(res, await svc.getEscalationAnalytics(req.workspaceId)); } catch (e) { next(e); }
};

const getReminderAnalytics = async (req, res, next) => {
  try { success(res, await svc.getReminderAnalytics(req.workspaceId)); } catch (e) { next(e); }
};

const getRegisterReport = async (req, res, next) => {
  try { success(res, await svc.getRegisterReport(req.workspaceId, req.query)); } catch (e) { next(e); }
};

const getFilingsReport = async (req, res, next) => {
  try { success(res, await svc.getFilingsReport(req.workspaceId, req.query)); } catch (e) { next(e); }
};

const getRenewalsReport = async (req, res, next) => {
  try { success(res, await svc.getRenewalsReport(req.workspaceId, req.query.days)); } catch (e) { next(e); }
};

const getOverdueReport = async (req, res, next) => {
  try { success(res, await svc.getOverdueReport(req.workspaceId, req.query)); } catch (e) { next(e); }
};

const exportReport = async (req, res, next) => {
  try {
    const { type, format = 'csv' } = req.body;
    let data = [];
    let filename = 'compliance-report';

    if (type === 'register') {
      const result = await svc.getRegisterReport(req.workspaceId, { ...req.body.filters, limit: 5000 });
      data = result.items;
      filename = 'compliance-register';
    } else if (type === 'filings') {
      const result = await svc.getFilingsReport(req.workspaceId, { ...req.body.filters, limit: 5000 });
      data = result.items;
      filename = 'filing-history';
    } else if (type === 'renewals') {
      data = await svc.getRenewalsReport(req.workspaceId, req.body.days || 90);
      filename = 'renewals-report';
    } else if (type === 'overdue') {
      data = await svc.getOverdueReport(req.workspaceId, req.body.filters || {});
      filename = 'overdue-report';
    }

    if (format === 'csv') {
      const today = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}-${today}.csv"`);

      let csv = '';
      if (data.length > 0) {
        const keys = ['name', 'status', 'priority', 'dueDate', 'jurisdiction', 'authority', 'category', 'owner', 'referenceNumber', 'completedAt'];
        csv += keys.join(',') + '\n';
        for (const item of data) {
          const occ = item.occurrence || item;
          const row = [
            `"${(occ.name || '').replace(/"/g, '""')}"`,
            occ.status || '',
            occ.priority || '',
            occ.dueDate ? new Date(occ.dueDate).toISOString().split('T')[0] : '',
            `"${(occ.jurisdiction?.name || item.occurrence?.jurisdiction?.name || '').replace(/"/g, '""')}"`,
            `"${(occ.authority?.name || item.occurrence?.authority?.name || '').replace(/"/g, '""')}"`,
            `"${(occ.category?.name || item.occurrence?.category?.name || '').replace(/"/g, '""')}"`,
            `"${(occ.owner?.fullName || item.occurrence?.owner?.fullName || '').replace(/"/g, '""')}"`,
            occ.referenceNumber || '',
            occ.completedAt ? new Date(occ.completedAt).toISOString().split('T')[0] : '',
          ];
          csv += row.join(',') + '\n';
        }
      }

      return res.send(csv);
    }

    success(res, { exported: data.length });
  } catch (e) { next(e); }
};

const listSavedReports = async (req, res, next) => {
  try { success(res, await svc.listSavedReports(req.workspaceId, req.user.id)); } catch (e) { next(e); }
};

const createSavedReport = async (req, res, next) => {
  try { success(res, await svc.createSavedReport(req.workspaceId, req.user.id, req.body), '', 201); } catch (e) { next(e); }
};

const updateSavedReport = async (req, res, next) => {
  try { success(res, await svc.updateSavedReport(req.params.id, req.workspaceId, req.body)); } catch (e) { next(e); }
};

const deleteSavedReport = async (req, res, next) => {
  try { await svc.deleteSavedReport(req.params.id, req.workspaceId); success(res, null, 'Deleted'); } catch (e) { next(e); }
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
  // Slice 9.3
  getDashboard,
  getTrends,
  getCategoryAnalytics,
  getJurisdictionAnalytics,
  getEscalationAnalytics,
  getReminderAnalytics,
  getRegisterReport,
  getFilingsReport,
  getRenewalsReport,
  getOverdueReport,
  exportReport,
  listSavedReports,
  createSavedReport,
  updateSavedReport,
  deleteSavedReport,
};
