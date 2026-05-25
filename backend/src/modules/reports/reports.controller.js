const svc = require('./reports.service');
const { success } = require('../../utils/response');

const userRole = (req) => req.workspaceMember?.role || 'user';

const getCatalog = async (req, res, next) => {
  try { success(res, svc.getCatalog(userRole(req))); } catch (e) { next(e); }
};

const getDefinition = async (req, res, next) => {
  try { success(res, svc.getDefinition(req.params.reportCode)); } catch (e) { next(e); }
};

const runReport = async (req, res, next) => {
  try {
    const result = await svc.runReport(
      req.workspaceId, req.user.id, userRole(req),
      req.params.reportCode,
      req.body.filters || {},
      req.body.pagination || {},
    );
    success(res, result);
  } catch (e) { next(e); }
};

const createExport = async (req, res, next) => {
  try {
    const job = await svc.createExportJob(
      req.workspaceId, req.user.id, userRole(req),
      req.params.reportCode,
      req.body.format || 'csv',
      req.body.filters || {},
      req.body.savedReportId || null,
    );
    success(res, job, 'Export job created', 202);
  } catch (e) { next(e); }
};

const getExportJob = async (req, res, next) => {
  try { success(res, await svc.getExportJob(req.params.jobId, req.workspaceId)); } catch (e) { next(e); }
};

const downloadExport = async (req, res, next) => {
  try {
    const job = await svc.getExportJob(req.params.jobId, req.workspaceId);
    if (job.status !== 'completed' || !job.fileUrl) {
      return res.status(400).json({ success: false, error: 'Export not ready' });
    }
    if (job.fileUrl.startsWith('data:')) {
      const [meta, b64] = job.fileUrl.split(',');
      const mimeType    = meta.replace('data:', '').replace(';base64', '');
      const buffer      = Buffer.from(b64, 'base64');
      const ext         = mimeType.includes('pdf') ? 'pdf' : mimeType.includes('sheet') ? 'xlsx' : 'csv';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="report_${job.reportCode.toLowerCase()}.${ext}"`);
      return res.send(buffer);
    }
    res.redirect(job.fileUrl);
  } catch (e) { next(e); }
};

// Saved reports
const listSaved   = async (req, res, next) => { try { success(res, await svc.listSavedReports(req.workspaceId, req.user.id)); } catch (e) { next(e); } };
const createSaved = async (req, res, next) => { try { success(res, await svc.createSavedReport(req.workspaceId, req.user.id, req.body), 'Saved', 201); } catch (e) { next(e); } };
const updateSaved = async (req, res, next) => { try { success(res, await svc.updateSavedReport(req.workspaceId, req.user.id, req.params.savedId, req.body)); } catch (e) { next(e); } };
const deleteSaved = async (req, res, next) => { try { await svc.deleteSavedReport(req.workspaceId, req.user.id, req.params.savedId); success(res, null, 'Deleted'); } catch (e) { next(e); } };

// Scheduled reports
const listSchedules   = async (req, res, next) => { try { success(res, await svc.listScheduledReports(req.workspaceId)); } catch (e) { next(e); } };
const createSchedule  = async (req, res, next) => { try { success(res, await svc.createScheduledReport(req.workspaceId, req.user.id, req.body), 'Created', 201); } catch (e) { next(e); } };
const updateSchedule  = async (req, res, next) => { try { success(res, await svc.updateScheduledReport(req.workspaceId, req.user.id, req.params.scheduleId, req.body)); } catch (e) { next(e); } };
const deleteSchedule  = async (req, res, next) => { try { await svc.deleteScheduledReport(req.workspaceId, req.params.scheduleId); success(res, null, 'Deleted'); } catch (e) { next(e); } };
const runNow          = async (req, res, next) => { try { success(res, await svc.runScheduleNow(req.workspaceId, req.user.id, req.params.scheduleId), 'Running'); } catch (e) { next(e); } };

module.exports = {
  getCatalog, getDefinition, runReport, createExport, getExportJob, downloadExport,
  listSaved, createSaved, updateSaved, deleteSaved,
  listSchedules, createSchedule, updateSchedule, deleteSchedule, runNow,
};
