const repo = require('./admin.document-templates.repository');

const log = async (req, action, details = {}) => {
  try {
    const prisma = require('../../../lib/prisma');
    await prisma.adminActivityLog.create({
      data: { adminUserId: req.adminUser.id, action, details, entityType: 'document_template' },
    });
  } catch (_) {}
};

const getStats = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.getStats() }); } catch (e) { next(e); }
};

const list = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.list(req.query) }); } catch (e) { next(e); }
};

const getOne = async (req, res, next) => {
  try {
    const tpl = await repo.getById(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, error: 'Template not found' });
    res.json({ success: true, data: tpl });
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const tpl = await repo.create(req.body);
    await log(req, 'document_template_created', { id: tpl.id, name: tpl.name });
    res.status(201).json({ success: true, data: tpl, message: 'Template created' });
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const tpl = await repo.update(req.params.id, req.body);
    await log(req, 'document_template_updated', { id: tpl.id, name: tpl.name });
    res.json({ success: true, data: tpl, message: 'Template updated' });
  } catch (e) { next(e); }
};

const publish = async (req, res, next) => {
  try {
    const tpl = await repo.publish(req.params.id);
    await log(req, `document_template_${tpl.status}`, { id: tpl.id, name: tpl.name });
    res.json({ success: true, data: tpl, message: `Template ${tpl.status}` });
  } catch (e) {
    if (e.status) return res.status(e.status).json({ success: false, error: e.message });
    next(e);
  }
};

const archive = async (req, res, next) => {
  try {
    const tpl = await repo.archive(req.params.id);
    await log(req, 'document_template_archived', { id: tpl.id, name: tpl.name });
    res.json({ success: true, data: tpl, message: 'Template archived' });
  } catch (e) { next(e); }
};

const clone = async (req, res, next) => {
  try {
    const tpl = await repo.clone(req.params.id);
    await log(req, 'document_template_cloned', { id: tpl.id, name: tpl.name });
    res.status(201).json({ success: true, data: tpl, message: 'Template cloned' });
  } catch (e) {
    if (e.status) return res.status(e.status).json({ success: false, error: e.message });
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    await repo.remove(req.params.id);
    await log(req, 'document_template_deleted', { id: req.params.id });
    res.json({ success: true, data: null, message: 'Template deleted' });
  } catch (e) { next(e); }
};

const listCountryProfiles = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.listCountryProfiles() }); } catch (e) { next(e); }
};

module.exports = { getStats, list, getOne, create, update, publish, archive, clone, remove, listCountryProfiles };
