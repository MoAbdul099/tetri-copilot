const service = require('./admin.dashboard.service');

const ip = (req) =>
  req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

async function overview(req, res) {
  try {
    const data = await service.getOverview();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: [] });
  }
}

async function organizations(req, res) {
  try {
    const data = await service.getOrganizationMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: [] });
  }
}

async function users(req, res) {
  try {
    const data = await service.getUserMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: [] });
  }
}

async function subscriptions(req, res) {
  try {
    const data = await service.getSubscriptionMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: [] });
  }
}

async function ai(req, res) {
  try {
    const data = await service.getAiMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: [] });
  }
}

async function compliance(req, res) {
  try {
    const data = await service.getComplianceMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: [] });
  }
}

async function storage(req, res) {
  try {
    const data = await service.getStorageMetrics();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: [] });
  }
}

async function activity(req, res) {
  try {
    const data = await service.getActivityFeed();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: [] });
  }
}

async function exportCsv(req, res) {
  try {
    const csv = await service.exportCsv({ adminId: req.adminUser.sub, ipAddress: ip(req) });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="platform-dashboard-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, details: [] });
  }
}

module.exports = { overview, organizations, users, subscriptions, ai, compliance, storage, activity, exportCsv };
