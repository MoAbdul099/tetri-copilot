const prisma = require('../../lib/prisma');
const repo   = require('./compliance.repository');

// ── Recurrence engine ──────────────────────────────────────

const addInterval = (date, frequency, customInterval, customUnit) => {
  const d = new Date(date);
  switch (frequency) {
    case 'weekly':      d.setDate(d.getDate() + 7); break;
    case 'monthly':     d.setMonth(d.getMonth() + 1); break;
    case 'quarterly':   d.setMonth(d.getMonth() + 3); break;
    case 'semi_annual': d.setMonth(d.getMonth() + 6); break;
    case 'annual':      d.setFullYear(d.getFullYear() + 1); break;
    case 'custom': {
      const n = parseInt(customInterval, 10) || 1;
      switch (customUnit) {
        case 'days':   d.setDate(d.getDate() + n); break;
        case 'weeks':  d.setDate(d.getDate() + n * 7); break;
        case 'months': d.setMonth(d.getMonth() + n); break;
        case 'years':  d.setFullYear(d.getFullYear() + n); break;
        default:       d.setDate(d.getDate() + n);
      }
      break;
    }
    default: break;
  }
  return d;
};

const formatOccurrenceName = (template, dueDate, frequency) => {
  if (frequency === 'one_time' || frequency === 'weekly') {
    const dateStr = dueDate.toISOString().split('T')[0];
    return `${template.name} — ${dateStr}`;
  }
  const monthYear = dueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  return `${template.name} — ${monthYear}`;
};

const generateOccurrences = (template, lookaheadMonths = 24) => {
  const {
    workspaceId, id: templateId, jurisdictionId, categoryId, authorityId,
    ownerUserId, backupOwnerUserId, priority, department, frequency,
    customInterval, customUnit, startDate, endDate, maxOccurrences,
  } = template;

  if (!startDate) return [];

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + lookaheadMonths);

  const occurrences = [];
  let current = new Date(startDate);

  while (true) {
    if (endDate && current > new Date(endDate)) break;
    if (current > cutoff) break;
    if (maxOccurrences && occurrences.length >= maxOccurrences) break;

    occurrences.push({
      name:               formatOccurrenceName(template, current, frequency),
      dueDate:            new Date(current),
      status:             'scheduled',
      workspaceId,
      templateId,
      jurisdictionId,
      categoryId,
      authorityId,
      ownerUserId,
      backupOwnerUserId,
      priority,
      department,
    });

    if (frequency === 'one_time') break;

    current = addInterval(current, frequency, customInterval, customUnit);
  }

  return occurrences;
};

// ── Overdue helper ─────────────────────────────────────────

const markOverdue = async (workspaceId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.complianceOccurrence.updateMany({
    where: {
      workspaceId,
      status:  { in: ['scheduled', 'in_progress'] },
      dueDate: { lt: today },
    },
    data: { status: 'overdue' },
  });
};

// Convert empty strings to null for optional UUID/string fields
const nullifyEmpty = (data, fields) => {
  const result = { ...data };
  fields.forEach((f) => { if (result[f] === '') result[f] = null; });
  return result;
};

const NULLABLE_TEMPLATE_FIELDS = ['jurisdictionId','categoryId','authorityId','backupOwnerUserId','endDate','department','submissionMethod','notes'];

// ── Reference data ─────────────────────────────────────────

const listJurisdictions = () => repo.listJurisdictions();

const listAuthorities = (filters) => repo.listAuthorities(filters);

const listCategories = (workspaceId) => repo.listCategories(workspaceId);

const createCategory = async (workspaceId, data) => {
  if (!data.name || !data.name.trim()) {
    throw Object.assign(new Error('Category name is required'), { statusCode: 400 });
  }
  return repo.createCategory(workspaceId, data);
};

const updateCategory = (workspaceId, id, data) => repo.updateCategory(id, workspaceId, data);

const deleteCategory = (workspaceId, id) => repo.deleteCategory(id, workspaceId);

const listPacks = (filters) => repo.listPacks(filters);

const getPackById = async (id) => {
  const pack = await repo.getPackById(id);
  if (!pack) throw Object.assign(new Error('Compliance pack not found'), { statusCode: 404 });
  return pack;
};

// ── Pack installation ──────────────────────────────────────

const installPack = async (workspaceId, packId, ownerUserId) => {
  const pack = await getPackById(packId);
  const createdTemplates = [];
  let totalOccurrences = 0;

  for (const item of pack.items) {
    const templateData = {
      workspaceId,
      name:             item.name,
      description:      item.description,
      frequency:        item.frequency,
      priority:         item.priority || 'medium',
      submissionMethod: item.submissionMethod || null,
      notes:            item.notes || null,
      startDate:        new Date(),
      ownerUserId,
      isActive:         true,
      autoGenerate:     true,
    };

    const created = await repo.createTemplate(workspaceId, templateData);
    createdTemplates.push(created);

    const occurrences = generateOccurrences({ ...created, workspaceId });
    if (occurrences.length > 0) {
      const result = await repo.bulkCreateOccurrences(occurrences);
      totalOccurrences += result?.count ?? occurrences.length;
    }
  }

  return {
    pack,
    templatesCreated: createdTemplates.length,
    occurrencesCreated: totalOccurrences,
    templates: createdTemplates,
  };
};

// ── Templates ──────────────────────────────────────────────

const listTemplates = async (workspaceId, query) => {
  const result = await repo.listTemplates(workspaceId, query);
  return result;
};

const getTemplate = async (workspaceId, id) => {
  const template = await repo.getTemplateById(id, workspaceId);
  if (!template) throw Object.assign(new Error('Compliance template not found'), { statusCode: 404 });
  return template;
};

const createTemplate = async (workspaceId, userId, data) => {
  if (!data.name || !data.name.trim()) {
    throw Object.assign(new Error('Template name is required'), { statusCode: 400 });
  }
  if (!data.frequency) {
    throw Object.assign(new Error('Frequency is required'), { statusCode: 400 });
  }

  const templateData = nullifyEmpty({
    ...data,
    ownerUserId: data.ownerUserId || userId,
    isActive:    data.isActive !== undefined ? data.isActive : true,
  }, NULLABLE_TEMPLATE_FIELDS);

  if (templateData.startDate) templateData.startDate = new Date(templateData.startDate);
  if (templateData.endDate)   templateData.endDate   = new Date(templateData.endDate);

  const template = await repo.createTemplate(workspaceId, templateData);

  if (template.autoGenerate !== false) {
    const occurrences = generateOccurrences({ ...template, workspaceId });
    if (occurrences.length > 0) {
      await repo.bulkCreateOccurrences(occurrences);
    }
  }

  return template;
};

const updateTemplate = async (workspaceId, userId, id, data) => {
  await getTemplate(workspaceId, id);

  const updateData = nullifyEmpty({ ...data }, NULLABLE_TEMPLATE_FIELDS);
  if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
  if (updateData.endDate)   updateData.endDate   = new Date(updateData.endDate);

  return repo.updateTemplate(id, workspaceId, updateData);
};

const deleteTemplate = async (workspaceId, id) => {
  await getTemplate(workspaceId, id);
  return repo.deleteTemplate(id, workspaceId);
};

const generateOccurrencesForTemplate = async (workspaceId, templateId, userId) => {
  const template = await getTemplate(workspaceId, templateId);
  const occurrences = generateOccurrences({ ...template, workspaceId });
  if (occurrences.length === 0) {
    return { created: 0, message: 'No occurrences to generate' };
  }
  const result = await repo.bulkCreateOccurrences(occurrences);
  return { created: result.count, message: `${result.count} occurrences generated` };
};

// ── Occurrences ────────────────────────────────────────────

const listOccurrences = async (workspaceId, query) => {
  await markOverdue(workspaceId);
  return repo.listOccurrences(workspaceId, query);
};

const getOccurrence = async (workspaceId, id) => {
  await markOverdue(workspaceId);
  const occurrence = await repo.getOccurrenceById(id, workspaceId);
  if (!occurrence) throw Object.assign(new Error('Compliance occurrence not found'), { statusCode: 404 });
  return occurrence;
};

const updateOccurrence = async (workspaceId, id, userId, data) => {
  await getOccurrence(workspaceId, id);

  const updateData = { ...data };
  if (updateData.dueDate)       updateData.dueDate       = new Date(updateData.dueDate);
  if (updateData.completedAt)   updateData.completedAt   = new Date(updateData.completedAt);
  if (updateData.cancelledAt)   updateData.cancelledAt   = new Date(updateData.cancelledAt);

  const updated = await repo.updateOccurrence(id, workspaceId, updateData);

  await repo.logActivity(id, workspaceId, userId, 'updated', {
    fields: Object.keys(data),
  });

  return updated;
};

const recordSubmission = async (workspaceId, occurrenceId, userId, data) => {
  await getOccurrence(workspaceId, occurrenceId);

  const submissionData = { ...data };
  if (submissionData.submissionDate) {
    submissionData.submissionDate = new Date(submissionData.submissionDate);
  }

  const submission = await repo.createSubmission(occurrenceId, workspaceId, userId, submissionData);

  await repo.updateOccurrence(occurrenceId, workspaceId, { status: 'submitted' });

  await repo.logActivity(occurrenceId, workspaceId, userId, 'submitted', {
    submissionDate: submissionData.submissionDate,
    authorityReference: submissionData.authorityReference,
  });

  return submission;
};

const addComment = async (workspaceId, occurrenceId, userId, body) => {
  if (!body || !body.trim()) {
    throw Object.assign(new Error('Comment body is required'), { statusCode: 400 });
  }
  await getOccurrence(workspaceId, occurrenceId);
  const comment = await repo.createComment(occurrenceId, workspaceId, userId, body.trim());
  await repo.logActivity(occurrenceId, workspaceId, userId, 'commented', { commentId: comment.id });
  return comment;
};

const deleteComment = async (workspaceId, occurrenceId, commentId, userId) => {
  await repo.deleteComment(commentId, workspaceId, userId);
};

const getCalendarEvents = (workspaceId, query) => repo.getCalendarEvents(workspaceId, query);

const getStats = (workspaceId) => repo.getStats(workspaceId);

const getRecommendations = async (workspaceId, company) => {
  const companyRecord = company || await prisma.company.findUnique({ where: { workspaceId } });
  if (!companyRecord) return { packs: [] };

  const filters = {};
  if (companyRecord.jurisdictionId) {
    filters.jurisdictionId = companyRecord.jurisdictionId;
  }

  const packs = await repo.listPacks(filters);

  const recommended = packs.filter((pack) => {
    if (companyRecord.jurisdictionId && pack.jurisdictionId !== companyRecord.jurisdictionId) {
      return false;
    }
    return true;
  });

  return { packs: recommended, company: companyRecord };
};

// ── Analytics & Reports (Slice 9.3) ───────────────────────

const getDashboard     = (workspaceId) => repo.getDashboard(workspaceId);
const getTrends        = (workspaceId, months) => repo.getTrends(workspaceId, months);
const getCategoryAnalytics    = (workspaceId) => repo.getCategoryAnalytics(workspaceId);
const getJurisdictionAnalytics = (workspaceId) => repo.getJurisdictionAnalytics(workspaceId);
const getEscalationAnalytics  = (workspaceId) => repo.getEscalationAnalytics(workspaceId);
const getReminderAnalytics    = (workspaceId) => repo.getReminderAnalytics(workspaceId);
const getRegisterReport       = (workspaceId, query) => repo.getRegisterReport(workspaceId, query);
const getFilingsReport        = (workspaceId, query) => repo.getFilingsReport(workspaceId, query);
const getRenewalsReport       = (workspaceId, days) => repo.getRenewalsReport(workspaceId, days);
const getOverdueReport        = (workspaceId, query) => repo.getOverdueReport(workspaceId, query);
const listSavedReports        = (workspaceId, userId) => repo.listSavedReports(workspaceId, userId);
const createSavedReport       = (workspaceId, userId, data) => repo.createSavedReport(workspaceId, userId, data);
const updateSavedReport       = (id, workspaceId, data) => repo.updateSavedReport(id, workspaceId, data);
const deleteSavedReport       = (id, workspaceId) => repo.deleteSavedReport(id, workspaceId);

module.exports = {
  listJurisdictions,
  listAuthorities,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listPacks,
  getPackById,
  installPack,
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateOccurrencesForTemplate,
  listOccurrences,
  getOccurrence,
  updateOccurrence,
  recordSubmission,
  addComment,
  deleteComment,
  getCalendarEvents,
  getStats,
  getRecommendations,
  generateOccurrences,
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
  listSavedReports,
  createSavedReport,
  updateSavedReport,
  deleteSavedReport,
};
