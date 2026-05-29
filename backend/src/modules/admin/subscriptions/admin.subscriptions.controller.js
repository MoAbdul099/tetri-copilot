const { PrismaClient } = require('@prisma/client');
const repo   = require('./admin.subscriptions.repository');
const svc    = require('./admin.subscriptions.service');
const prisma = new PrismaClient();

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

async function updatePlan(req, res) {
  try {
    const plan = await repo.updatePlan(req.params.planId, req.body);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found', details: [] });
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.adminUser.sub,
        action: 'plan_updated',
        entityType: 'plan',
        entityId: plan.id,
        meta: { planName: plan.name, changes: Object.keys(req.body) },
        ipAddress: req.ip,
      },
    });
    res.json({ success: true, data: plan });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

async function manageTrial(req, res) {
  try {
    const { action, days } = req.body;
    let data;

    if (action === 'extend') {
      if (!days || days < 1) return res.status(400).json({ success: false, error: 'days required for extend', details: [] });
      data = await repo.extendTrial(req.params.id, parseInt(days));
      await prisma.adminActivityLog.create({
        data: { adminId: req.adminUser.sub, action: 'trial_extended', entityType: 'subscription', entityId: req.params.id, meta: { days }, ipAddress: req.ip },
      });
    } else if (action === 'convert') {
      data = await repo.convertTrialToPaid(req.params.id);
      await prisma.adminActivityLog.create({
        data: { adminId: req.adminUser.sub, action: 'trial_converted', entityType: 'subscription', entityId: req.params.id, meta: {}, ipAddress: req.ip },
      });
    } else {
      return res.status(400).json({ success: false, error: 'action must be extend or convert', details: [] });
    }

    if (!data) return res.status(404).json({ success: false, error: 'Subscription not found', details: [] });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, details: [] });
  }
}

module.exports = { list, getById, changeStatus, getRevenue, getRenewals, getPlans, updatePlan, manageTrial };
