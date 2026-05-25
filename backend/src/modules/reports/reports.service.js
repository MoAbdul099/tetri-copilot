const prisma      = require('../../lib/prisma');
const { REPORTS } = require('./reports.constants');
const { executeQuery } = require('./reports.queries');
const { generateExport } = require('./reports.export');
const notifier    = require('../notifications/notification.emitter');

// ── Catalog ───────────────────────────────────────────────────

function getCatalog(userRole) {
  return REPORTS.filter((r) => r.isActive).filter((r) => {
    if (r.requiredPermission === 'admin') return ['owner', 'admin'].includes(userRole);
    return true;
  });
}

function getDefinition(reportCode) {
  const def = REPORTS.find((r) => r.reportCode === reportCode);
  if (!def) throw Object.assign(new Error('Report not found'), { statusCode: 404 });
  return def;
}

// ── Execution ─────────────────────────────────────────────────

async function runReport(workspaceId, userId, userRole, reportCode, filters = {}, pagination = {}) {
  const def = getDefinition(reportCode);
  if (def.requiredPermission === 'admin' && !['owner', 'admin'].includes(userRole)) {
    throw Object.assign(new Error('Access denied to this report'), { statusCode: 403 });
  }

  const start  = Date.now();
  let result, status = 'success', errorMessage;

  try {
    result = await executeQuery(reportCode, workspaceId, filters, pagination);
  } catch (err) {
    status       = 'failed';
    errorMessage = err.message;
    throw err;
  } finally {
    prisma.reportExecutionLog.create({
      data: {
        workspaceId,
        userId,
        reportCode,
        executionType: 'manual',
        filtersJson: filters,
        rowCount: result?.rowCount,
        durationMs: Date.now() - start,
        status,
        errorMessage,
      },
    }).catch(() => {});
  }

  return result;
}

// ── Export jobs ───────────────────────────────────────────────

async function createExportJob(workspaceId, userId, userRole, reportCode, exportFormat, filters, savedReportId) {
  const def = getDefinition(reportCode);
  if (!def.supportedExports.includes(exportFormat)) {
    throw Object.assign(new Error(`Export format ${exportFormat} not supported for this report`), { statusCode: 400 });
  }
  if (def.requiredPermission === 'admin' && !['owner', 'admin'].includes(userRole)) {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }

  const job = await prisma.reportExportJob.create({
    data: {
      workspaceId, userId, reportCode,
      savedReportId: savedReportId || null,
      exportFormat,
      filtersJson: filters || {},
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Process immediately (small reports); large reports could defer via queue
  setImmediate(() => processExportJob(job.id, workspaceId, userId).catch(() => {}));

  return job;
}

async function processExportJob(jobId, workspaceId, userId) {
  await prisma.reportExportJob.update({ where: { id: jobId }, data: { status: 'processing' } });
  const job = await prisma.reportExportJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  try {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true } });
    const def       = getDefinition(job.reportCode);
    const result    = await executeQuery(job.reportCode, workspaceId, job.filtersJson || {}, { limit: 5000 });

    const { buffer, mimeType, ext } = await generateExport(
      job.exportFormat,
      def.reportName,
      workspace?.name || '',
      result.columns,
      result.rows,
      result.totals,
      job.filtersJson,
    );

    // Store buffer as base64 in fileUrl for local dev (no R2 required)
    const b64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${b64}`;

    await prisma.reportExportJob.update({
      where: { id: jobId },
      data: { status: 'completed', fileUrl: dataUrl, completedAt: new Date() },
    });

    notifier.emit('REPORT_EXPORTED', workspaceId, userId, {
      title: `${def.reportName} export ready`,
      body:  `Your ${def.reportName} export (${ext.toUpperCase()}) is ready to download.`,
    }).catch(() => {});
  } catch (err) {
    await prisma.reportExportJob.update({
      where: { id: jobId },
      data: { status: 'failed', errorMessage: err.message },
    }).catch(() => {});
  }
}

async function getExportJob(jobId, workspaceId) {
  const job = await prisma.reportExportJob.findFirst({ where: { id: jobId, workspaceId } });
  if (!job) throw Object.assign(new Error('Export job not found'), { statusCode: 404 });
  return job;
}

// ── Saved reports ─────────────────────────────────────────────

async function listSavedReports(workspaceId, userId) {
  return prisma.savedReport.findMany({
    where: {
      OR: [
        { workspaceId, userId },
        { workspaceId, visibility: 'workspace' },
      ],
    },
    orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
  });
}

async function createSavedReport(workspaceId, userId, body) {
  const { reportCode, savedName, filtersJson, sortingJson, visibility } = body;
  getDefinition(reportCode);
  return prisma.savedReport.create({
    data: { workspaceId, userId, reportCode, savedName, filtersJson, sortingJson, visibility: visibility || 'private' },
  });
}

async function updateSavedReport(workspaceId, userId, savedReportId, body) {
  const existing = await prisma.savedReport.findFirst({ where: { id: savedReportId, workspaceId } });
  if (!existing) throw Object.assign(new Error('Saved report not found'), { statusCode: 404 });
  if (existing.userId !== userId) throw Object.assign(new Error('Not authorised to edit this saved report'), { statusCode: 403 });

  const data = {};
  if (body.savedName    !== undefined) data.savedName    = body.savedName;
  if (body.filtersJson  !== undefined) data.filtersJson  = body.filtersJson;
  if (body.sortingJson  !== undefined) data.sortingJson  = body.sortingJson;
  if (body.visibility   !== undefined) data.visibility   = body.visibility;
  if (body.isFavorite   !== undefined) data.isFavorite   = body.isFavorite;

  return prisma.savedReport.update({ where: { id: savedReportId }, data });
}

async function deleteSavedReport(workspaceId, userId, savedReportId) {
  const existing = await prisma.savedReport.findFirst({ where: { id: savedReportId, workspaceId } });
  if (!existing) throw Object.assign(new Error('Saved report not found'), { statusCode: 404 });
  if (existing.userId !== userId) throw Object.assign(new Error('Not authorised'), { statusCode: 403 });
  return prisma.savedReport.delete({ where: { id: savedReportId } });
}

// ── Scheduled reports ─────────────────────────────────────────

function calcNextRun(frequency, deliveryTime = '08:00') {
  const [h, m]  = (deliveryTime || '08:00').split(':').map(Number);
  const next     = new Date();
  next.setSeconds(0, 0);
  next.setHours(h, m);
  if (next <= new Date()) {
    if (frequency === 'daily')   next.setDate(next.getDate() + 1);
    else if (frequency === 'weekly')  next.setDate(next.getDate() + 7);
    else if (frequency === 'monthly') next.setMonth(next.getMonth() + 1);
  }
  return next;
}

async function listScheduledReports(workspaceId) {
  return prisma.scheduledReport.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { fullName: true } } },
  });
}

async function createScheduledReport(workspaceId, userId, body) {
  const { reportCode, scheduleName, frequency, deliveryTime, timezone, exportFormat, recipientsJson, filtersJson, savedReportId } = body;
  getDefinition(reportCode);

  return prisma.scheduledReport.create({
    data: {
      workspaceId, createdByUserId: userId,
      reportCode, scheduleName, frequency,
      deliveryTime: deliveryTime || '08:00',
      timezone: timezone || 'UTC',
      exportFormat: exportFormat || 'csv',
      recipientsJson: recipientsJson || [],
      filtersJson: filtersJson || {},
      savedReportId: savedReportId || null,
      nextRunAt: calcNextRun(frequency, deliveryTime),
    },
  });
}

async function updateScheduledReport(workspaceId, userId, scheduleId, body) {
  const existing = await prisma.scheduledReport.findFirst({ where: { id: scheduleId, workspaceId } });
  if (!existing) throw Object.assign(new Error('Scheduled report not found'), { statusCode: 404 });

  const data = {};
  if (body.scheduleName    !== undefined) data.scheduleName    = body.scheduleName;
  if (body.frequency       !== undefined) { data.frequency = body.frequency; data.nextRunAt = calcNextRun(body.frequency, body.deliveryTime || existing.deliveryTime); }
  if (body.deliveryTime    !== undefined) data.deliveryTime    = body.deliveryTime;
  if (body.timezone        !== undefined) data.timezone        = body.timezone;
  if (body.exportFormat    !== undefined) data.exportFormat    = body.exportFormat;
  if (body.recipientsJson  !== undefined) data.recipientsJson  = body.recipientsJson;
  if (body.filtersJson     !== undefined) data.filtersJson     = body.filtersJson;
  if (body.isActive        !== undefined) data.isActive        = body.isActive;

  return prisma.scheduledReport.update({ where: { id: scheduleId }, data });
}

async function deleteScheduledReport(workspaceId, scheduleId) {
  const existing = await prisma.scheduledReport.findFirst({ where: { id: scheduleId, workspaceId } });
  if (!existing) throw Object.assign(new Error('Scheduled report not found'), { statusCode: 404 });
  return prisma.scheduledReport.delete({ where: { id: scheduleId } });
}

async function runScheduleNow(workspaceId, userId, scheduleId) {
  const schedule = await prisma.scheduledReport.findFirst({ where: { id: scheduleId, workspaceId } });
  if (!schedule) throw Object.assign(new Error('Scheduled report not found'), { statusCode: 404 });

  const job = await prisma.reportExportJob.create({
    data: {
      workspaceId, userId, reportCode: schedule.reportCode,
      scheduledReportId: scheduleId,
      exportFormat: schedule.exportFormat,
      filtersJson: schedule.filtersJson || {},
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  setImmediate(() => processExportJob(job.id, workspaceId, userId).catch(() => {}));
  return job;
}

// ── Scheduler engine tick ─────────────────────────────────────

async function tickScheduler() {
  const now       = new Date();
  const schedules = await prisma.scheduledReport.findMany({
    where: { isActive: true, nextRunAt: { lte: now } },
  });

  for (const sched of schedules) {
    try {
      const job = await prisma.reportExportJob.create({
        data: {
          workspaceId: sched.workspaceId,
          userId: sched.createdByUserId,
          reportCode: sched.reportCode,
          scheduledReportId: sched.id,
          exportFormat: sched.exportFormat,
          filtersJson: sched.filtersJson || {},
          status: 'pending',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      await processExportJob(job.id, sched.workspaceId, sched.createdByUserId);
    } catch (_) {}

    const nextRunAt = calcNextRun(sched.frequency, sched.deliveryTime);
    await prisma.scheduledReport.update({
      where: { id: sched.id },
      data: { lastRunAt: now, nextRunAt },
    }).catch(() => {});
  }
}

module.exports = {
  getCatalog, getDefinition,
  runReport,
  createExportJob, getExportJob,
  listSavedReports, createSavedReport, updateSavedReport, deleteSavedReport,
  listScheduledReports, createScheduledReport, updateScheduledReport, deleteScheduledReport, runScheduleNow,
  tickScheduler,
};
