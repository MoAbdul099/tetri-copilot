const router = require('express').Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./statements.controller');

router.use(protect, requireWorkspace);

router.post('/generate', ctrl.generate);
router.get('/',          ctrl.list);

module.exports = router;
