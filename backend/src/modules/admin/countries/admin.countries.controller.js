const { PrismaClient } = require('@prisma/client');
const repo   = require('./admin.countries.repository');
const prisma = new PrismaClient();

const ALLOWED_STATUSES = ['active', 'inactive', 'draft'];

async function list(req, res) {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const data = await repo.list({ search, status, page: parseInt(page), limit: parseInt(limit) });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function getById(req, res) {
  try {
    const country = await repo.findById(req.params.id);
    if (!country) return res.status(404).json({ success: false, error: 'Country profile not found', details: [] });
    res.json({ success: true, data: country });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function create(req, res) {
  try {
    if (!req.body.countryCode || !req.body.countryName) {
      return res.status(400).json({ success: false, error: 'countryCode and countryName are required', details: [] });
    }
    const data = await repo.create(req.body);
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.adminUser.sub, action: 'country_created', entityType: 'country_profile',
        entityId: data.id, meta: { countryCode: data.countryCode, countryName: data.countryName },
        ipAddress: req.ip,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ success: false, error: 'Country code already exists', details: [] });
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function update(req, res) {
  try {
    const data = await repo.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, error: 'Country profile not found', details: [] });
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.adminUser.sub, action: 'country_updated', entityType: 'country_profile',
        entityId: req.params.id, meta: { fields: Object.keys(req.body) }, ipAddress: req.ip,
      },
    });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`, details: [] });
    }
    const data = await repo.updateStatus(req.params.id, status);
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.adminUser.sub, action: `country_${status}`, entityType: 'country_profile',
        entityId: req.params.id, meta: { status }, ipAddress: req.ip,
      },
    });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function cloneCountry(req, res) {
  try {
    const { newCode, newName } = req.body;
    if (!newCode || !newName) {
      return res.status(400).json({ success: false, error: 'newCode and newName are required', details: [] });
    }
    const data = await repo.clone(req.params.id, newCode, newName);
    if (!data) return res.status(404).json({ success: false, error: 'Source country not found', details: [] });
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.adminUser.sub, action: 'country_cloned', entityType: 'country_profile',
        entityId: data.id, meta: { sourceId: req.params.id, newCode, newName }, ipAddress: req.ip,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ success: false, error: 'Country code already exists', details: [] });
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function addHoliday(req, res) {
  try {
    const { name, holidayDate, isRecurring, description } = req.body;
    if (!name || !holidayDate) return res.status(400).json({ success: false, error: 'name and holidayDate required', details: [] });
    const holiday = await repo.addHoliday(req.params.id, { name, holidayDate, isRecurring, description });
    res.status(201).json({ success: true, data: holiday });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function updateHoliday(req, res) {
  try {
    const holiday = await repo.updateHoliday(req.params.holidayId, req.body);
    res.json({ success: true, data: holiday });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function deleteHoliday(req, res) {
  try {
    await repo.deleteHoliday(req.params.holidayId);
    res.json({ success: true, data: null });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function getWorkspaces(req, res) {
  try {
    const data = await repo.getWorkspaces(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

module.exports = { list, getById, create, update, updateStatus, cloneCountry, addHoliday, updateHoliday, deleteHoliday, getWorkspaces };
