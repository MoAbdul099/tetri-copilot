const service = require('./billing.service');

const createCheckout = async (req, res, next) => {
  try {
    const result = await service.createCheckoutSession(req.workspaceId, req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const createPortal = async (req, res, next) => {
  try {
    const result = await service.createPortalSession(req.workspaceId, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, error: 'Missing stripe-signature header' });
    }
    const result = await service.handleWebhookEvent(req.body, signature);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const listEvents = async (req, res, next) => {
  try {
    const events = await service.listBillingEvents(req.workspaceId);
    res.json({ success: true, data: { events } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCheckout, createPortal, handleWebhook, listEvents };
