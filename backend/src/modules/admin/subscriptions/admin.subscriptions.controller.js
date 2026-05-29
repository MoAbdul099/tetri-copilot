const repo = require('./admin.subscriptions.repository');
const svc  = require('./admin.subscriptions.service');

async function list(req, res) {
  try {
    const { search, status, planCode, page = 1, limit = 20 } = req.query;
    const data = await repo.list({ search, status, planCode, page: parseInt(page), limit: parseInt(limit) });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function getById(req, res) {
  try {
    const sub = await repo.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, error: 'Subscription not found', details: [] });
    res.json({ success: true, data: sub });
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

async function getRevenue(req, res) {
  try {
    const data = await repo.getRevenue();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function getRenewals(req, res) {
  try {
    const data = await repo.getRenewals();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function getPlans(req, res) {
  try {
    const data = await repo.getPlans();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

module.exports = { list, getById, changeStatus, getRevenue, getRenewals, getPlans };
