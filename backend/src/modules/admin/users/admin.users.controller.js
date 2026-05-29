const repo = require('./admin.users.repository');
const svc  = require('./admin.users.service');

async function list(req, res) {
  try {
    const { search, status, role, page = 1, limit = 20 } = req.query;
    const data = await repo.list({
      search, status, role,
      page: parseInt(page), limit: parseInt(limit),
    });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function getById(req, res) {
  try {
    const user = await repo.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found', details: [] });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function changeStatus(req, res) {
  try {
    const data = await svc.changeStatus(req.params.id, req.body.status, {
      adminId: req.adminUser.sub,
      ipAddress: req.ip,
    });
    res.json({ success: true, data });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, error: e.message, details: [] });
  }
}

async function getActivity(req, res) {
  try {
    const data = await repo.getActivity(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function getSecurity(req, res) {
  try {
    const data = await repo.getSecurity(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function addNote(req, res) {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, error: 'Note text required', details: [] });
    const data = await repo.addNote(req.params.id, {
      text: text.trim(),
      adminId: req.adminUser.sub,
      adminEmail: req.adminUser.email,
    });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

module.exports = { list, getById, changeStatus, getActivity, getSecurity, addNote };
