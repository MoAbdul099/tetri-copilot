const express = require('express');
const c = require('./admin.ai.controller');

const router = express.Router();

router.get('/dashboard',  c.getDashboard);
router.get('/workspaces', c.listWorkspaceUsage);
router.get('/users',      c.listUserUsage);
router.get('/providers',  c.getProviderAnalytics);
router.get('/costs',      c.getCostAnalytics);
router.get('/quotas',     c.listQuotas);
router.put('/quotas',     c.upsertQuota);
router.delete('/quotas/:id', c.deleteQuota);
router.get('/abuse',      c.getAbuseAlerts);
router.get('/logs',       c.listLogs);

module.exports = router;
