const repo = require('./admin.settings.repository');

const getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.getAll() }); } catch (e) { next(e); }
};

const getSecurity = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.getByCategory('security') }); } catch (e) { next(e); }
};

const updateSettings = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || !updates.length)
      return res.status(400).json({ success: false, error: 'updates array required' });
    const result = await repo.upsertMany(updates, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};

const listFlags = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.listFlags() }); } catch (e) { next(e); }
};

const updateFlag = async (req, res, next) => {
  try {
    const result = await repo.upsertFlag(req.body, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};

const setMaintenance = async (req, res, next) => {
  try {
    const { enabled, message } = req.body;
    if (typeof enabled !== 'boolean')
      return res.status(400).json({ success: false, error: 'enabled (boolean) required' });
    const result = await repo.setMaintenance({ enabled, message }, req.adminUser.email);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
};

const getHistory = async (req, res, next) => {
  try { res.json({ success: true, data: await repo.getHistory(req.query) }); } catch (e) { next(e); }
};

module.exports = { getAll, getSecurity, updateSettings, listFlags, updateFlag, setMaintenance, getHistory };
