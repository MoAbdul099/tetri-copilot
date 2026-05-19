const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const requireOwner = require('../../middleware/requireOwner');
const controller = require('./billing.controller');

const router = Router();

// Webhook — no auth; raw body is parsed in app.js before express.json()
router.post('/webhook', controller.handleWebhook);

// Authenticated billing actions
router.use(protect, requireWorkspace);
router.post('/checkout-session', requireOwner, controller.createCheckout);
router.post('/portal-session', requireOwner, controller.createPortal);
router.get('/events', controller.listEvents);

module.exports = router;
