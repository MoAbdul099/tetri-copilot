const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./expense-approvals.controller');

router.use(protect, requireWorkspace);

router.get('/',           ctrl.getInbox);
router.get('/dashboard',  ctrl.getDashboard);
router.get('/rules',      ctrl.listRules);
router.post('/rules',     ctrl.createRule);
router.put('/rules/:id',  ctrl.updateRule);
router.delete('/rules/:id', ctrl.deleteRule);

module.exports = router;
