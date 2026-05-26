const router = require('express').Router();
const ctrl   = require('./ai.admin.controller');

// Providers
router.get('/providers',       ctrl.listProviders);
router.put('/providers/:id',   ctrl.updateProvider);
router.delete('/providers/:id',ctrl.deleteProvider);

// Models
router.get('/models',          ctrl.listModels);
router.post('/models',         ctrl.createModel);
router.put('/models/:id',      ctrl.updateModel);

// Config
router.get('/config',          ctrl.getConfig);
router.put('/config',          ctrl.updateConfig);

// Quota
router.get('/quotas',          ctrl.listQuotaRules);
router.post('/quotas',         ctrl.upsertQuotaRule);

// Usage / Costs / Health
router.get('/usage',           ctrl.getUsage);
router.get('/costs',           ctrl.getCosts);
router.get('/health',          ctrl.getHealth);
router.post('/health/check',   ctrl.triggerHealthCheck);

module.exports = router;
