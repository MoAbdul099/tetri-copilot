const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./audit.controller');

router.use(protect, requireWorkspace);

router.get('/',                     ctrl.getAuditFeed);
router.get('/verify',               ctrl.verifyChain);
router.get('/export',               ctrl.exportAudit);
router.get('/entity/:entityId',     ctrl.getEntityAuditTrail);
router.get('/user/:userId',         ctrl.getUserAuditTrail);
router.get('/:id',                  ctrl.getAuditEntry);
router.patch('/:id/legal-hold',     ctrl.setLegalHold);

module.exports = router;
