const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./ai-action-framework.controller');

router.use(protect, requireWorkspace);

// Registry & dashboard (static routes first)
router.get('/registry',             ctrl.getRegistry);
router.get('/dashboard',            ctrl.getDashboard);
router.get('/approvals/pending',    ctrl.getPendingApprovals);
router.get('/governance',           ctrl.getGovernance);
router.post('/governance/mode',     ctrl.setGovernanceMode);
router.get('/templates',            ctrl.listTemplates);

// Action CRUD + lifecycle
router.get('/',                     ctrl.listActions);
router.post('/',                    ctrl.createAction);
router.get('/:id',                  ctrl.getAction);
router.post('/:id/submit',          ctrl.submitAction);
router.post('/:id/approve',         ctrl.approveAction);
router.post('/:id/reject',          ctrl.rejectAction);
router.post('/:id/execute',         ctrl.executeAction);
router.post('/:id/cancel',          ctrl.cancelAction);
router.get('/:id/audit',            ctrl.getAuditLogs);

module.exports = router;
