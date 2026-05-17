const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const requireOwner = require('../../middleware/requireOwner');
const ctrl = require('./invitations.controller');

const router = Router();

// Public — token acceptance (auth required so we know who the user is, but no workspace context needed)
router.post('/accept', protect, ctrl.accept);

// Workspace-scoped routes
router.use(protect, requireWorkspace);

router.get('/', ctrl.list);
router.post('/', requireOwner, ctrl.create);
router.patch('/:id/cancel', requireOwner, ctrl.cancel);
router.patch('/:id/resend', requireOwner, ctrl.resend);

module.exports = router;
