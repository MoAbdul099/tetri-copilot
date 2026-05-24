const router = require('express').Router();
const ctrl = require('./notifications.controller');
const { protect }      = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');

router.use(protect, requireWorkspace);

// Notification center
router.get('/',                        ctrl.listNotifications);
router.get('/unread-count',            ctrl.getUnreadCount);
router.put('/read-all',                ctrl.markAllRead);
router.put('/:id/read',                ctrl.markRead);
router.put('/:id/archive',             ctrl.archiveItem);
router.put('/:id/snooze',              ctrl.snoozeItem);

// Preferences
router.get('/preferences',             ctrl.getPreference);
router.put('/preferences',             ctrl.updatePreference);

// Reminder profiles
router.get('/profiles',                ctrl.listProfiles);
router.post('/profiles',               ctrl.createProfile);
router.put('/profiles/:id',            ctrl.updateProfile);
router.delete('/profiles/:id',         ctrl.deleteProfile);
router.post('/profiles/:id/rules',     ctrl.addRule);
router.put('/rules/:id',               ctrl.updateRule);
router.delete('/rules/:id',            ctrl.deleteRule);

// Escalation profiles
router.get('/escalation-profiles',            ctrl.listEscProfiles);
router.post('/escalation-profiles',           ctrl.createEscProfile);
router.put('/escalation-profiles/:id',        ctrl.updateEscProfile);
router.post('/escalation-profiles/:id/rules', ctrl.addEscRule);
router.put('/escalation-rules/:id',           ctrl.updateEscRule);
router.delete('/escalation-rules/:id',        ctrl.deleteEscRule);

// Escalation instances
router.get('/escalations',             ctrl.listEscalations);
router.put('/escalations/:id/acknowledge', ctrl.acknowledgeEsc);

module.exports = router;
