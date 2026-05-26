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

// Analytics (extended)
router.get('/analytics',       ctrl.getAnalytics);

// Prompt Groups
router.get('/prompts/groups',        ctrl.listPromptGroups);
router.post('/prompts/groups',       ctrl.createPromptGroup);

// Prompt testing (before /:id to avoid param collision)
router.post('/prompts/test',         ctrl.testPrompt);

// Prompts CRUD
router.get('/prompts',               ctrl.listPrompts);
router.post('/prompts',              ctrl.createPrompt);
router.get('/prompts/:id',           ctrl.getPrompt);
router.put('/prompts/:id',           ctrl.updatePrompt);
router.delete('/prompts/:id',        ctrl.archivePrompt);

// Prompt versions
router.get('/prompts/:id/versions',  ctrl.listVersions);
router.post('/prompts/:id/versions', ctrl.createVersion);
router.post('/prompts/:id/activate', ctrl.activateVersion);
router.post('/prompts/:id/rollback', ctrl.rollbackVersion);
router.get('/prompts/:id/tests',     ctrl.listPromptTests);

// Feature Registry
router.get('/features',              ctrl.listFeatures);
router.put('/features/:id',          ctrl.updateFeature);
router.get('/features/:id/flags',    ctrl.getFeatureFlags);
router.post('/features/:id/flags',   ctrl.setFeatureFlag);

// Conversations (admin view)
router.get('/conversations',         ctrl.listConversations);

module.exports = router;
