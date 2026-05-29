const service = require('./admin.workspaces.service');

const ip = (req) =>
  req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

async function list(req, res) {
  try {
    const { search, status, plan, country, page = 1, limit = 20 } = req.query;
    const data = await service.list({ search, status, planCode: plan, countryCode: country, page: parseInt(page), limit: parseInt(limit) });
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message, details: [] });
  }
}

async function getById(req, res) {
  try {
    const data = await service.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message, details: [] });
  }
}

async function changeStatus(req, res) {
  try {
    const { status } = req.body;
    const data = await service.changeStatus(req.params.id, status, { adminId: req.adminUser.sub, ipAddress: ip(req) });
    res.json({ success: true, data, message: `Workspace ${status}` });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message, details: [] });
  }
}

async function getUsage(req, res) {
  try {
    const data = await service.getUsage(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message, details: [] });
  }
}

async function getActivity(req, res) {
  try {
    const data = await service.getActivity(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message, details: [] });
  }
}

async function addNote(req, res) {
  try {
    const { text } = req.body;
    const data = await service.addNote(req.params.id, text, {
      adminId: req.adminUser.sub,
      adminEmail: req.adminUser.email,
      ipAddress: ip(req),
    });
    res.json({ success: true, data, message: 'Note added' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message, details: [] });
  }
}

module.exports = { list, getById, changeStatus, getUsage, getActivity, addNote };
