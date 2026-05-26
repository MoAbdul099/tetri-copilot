const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./activity.controller');

router.use(protect, requireWorkspace);

router.get('/',                       ctrl.getActivityFeed);
router.get('/recent',                 ctrl.getRecentActivity);
router.get('/export',                 ctrl.exportActivity);
router.get('/user/me',                ctrl.getMyActivity);
router.get('/entity/:entityId',       ctrl.getEntityTimeline);
router.get('/:id',                    ctrl.getActivity);

module.exports = router;
