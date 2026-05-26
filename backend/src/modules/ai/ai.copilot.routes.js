const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./ai.copilot.controller');

router.use(protect, requireWorkspace);

router.get('/sessions',          ctrl.listSessions);
router.post('/sessions',         ctrl.createSession);
router.get('/sessions/:id',      ctrl.getSession);
router.delete('/sessions/:id',   ctrl.archiveSession);
router.post('/sessions/:id/chat', ctrl.chat);

module.exports = router;
