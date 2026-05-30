const repo = require('./admin.billing.repository');

const getDashboard = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.getDashboard() }); } catch (e) { next(e); }
};

const listEvents = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.listEvents(req.query) }); } catch (e) { next(e); }
};

const getEvent = async (req, res, next) => {
  try {
    const ev = await repo.getEvent(req.params.id);
    if (!ev) return res.status(404).json({ success: false, error: 'Event not found' });
    res.json({ success: true, data: ev });
  } catch (e) { next(e); }
};

const listSubscriptions = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.listSubscriptions(req.query) }); } catch (e) { next(e); }
};

module.exports = { getDashboard, listEvents, getEvent, listSubscriptions };
