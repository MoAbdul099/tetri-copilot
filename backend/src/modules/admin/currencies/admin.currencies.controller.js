const prisma = require('../../../lib/prisma');
const repo   = require('./admin.currencies.repository');

async function list(req, res) {
  try {
    const { search, isActive, page = 1, limit = 50 } = req.query;
    const data = await repo.list({ search, isActive, page: parseInt(page), limit: parseInt(limit) });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, error: e.message, details: [] }); }
}

async function getById(req, res) {
  try {
    const cur = await repo.findById(req.params.id);
    if (!cur) return res.status(404).json({ success: false, error: 'Currency not found', details: [] });
    res.json({ success: true, data: cur });
  } catch (e) { res.status(500).json({ success: false, error: e.message, details: [] }); }
}

async function create(req, res) {
  try {
    const { code, name } = req.body;
    if (!code || !name) return res.status(400).json({ success: false, error: 'code and name are required', details: [] });
    const data = await repo.create(req.body);
    await prisma.adminActivityLog.create({
      data: { adminId: req.adminUser.sub, action: 'currency_created', entityType: 'currency', entityId: data.id, meta: { code, name }, ipAddress: req.ip },
    });
    res.status(201).json({ success: true, data });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ success: false, error: 'Currency code already exists', details: [] });
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function update(req, res) {
  try {
    const data = await repo.update(req.params.id, req.body);
    await prisma.adminActivityLog.create({
      data: { adminId: req.adminUser.sub, action: 'currency_updated', entityType: 'currency', entityId: req.params.id, meta: { fields: Object.keys(req.body) }, ipAddress: req.ip },
    });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, error: e.message, details: [] }); }
}

async function updateStatus(req, res) {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') return res.status(400).json({ success: false, error: 'isActive (boolean) required', details: [] });
    const data = await repo.updateStatus(req.params.id, isActive);
    await prisma.adminActivityLog.create({
      data: { adminId: req.adminUser.sub, action: isActive ? 'currency_activated' : 'currency_deactivated', entityType: 'currency', entityId: req.params.id, meta: { isActive }, ipAddress: req.ip },
    });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, error: e.message, details: [] }); }
}

module.exports = { list, getById, create, update, updateStatus };
