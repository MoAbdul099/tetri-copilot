const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const requireOwner = require('../../middleware/requireOwner');
const membersController = require('./members.controller');

const router = Router();

router.use(protect, requireWorkspace);

router.get('/', membersController.getMembers);
router.post('/invite', requireOwner, membersController.inviteUser);
router.patch('/:id/status', requireOwner, membersController.updateMemberStatus);

module.exports = router;
