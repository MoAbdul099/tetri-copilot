const repo = require('./statements.repository');
const { success } = require('../../utils/response');

const generate = async (req, res, next) => {
  try {
    const { customerId, periodStart, periodEnd, statementType = 'full', save = false } = req.body;
    if (!customerId || !periodStart || !periodEnd) {
      return res.status(400).json({ success: false, error: 'customerId, periodStart, and periodEnd are required' });
    }
    const data = await repo.generateStatementData(req.workspaceId, customerId, { periodStart, periodEnd, statementType });
    if (!data) return res.status(404).json({ success: false, error: 'Customer not found' });

    if (save) {
      await repo.saveStatementRun(req.workspaceId, customerId, req.user.id, { statementType, periodStart, periodEnd });
    }

    success(res, data);
  } catch (e) { next(e); }
};

const list = async (req, res, next) => {
  try { success(res, await repo.listStatementRuns(req.workspaceId, req.query)); } catch (e) { next(e); }
};

module.exports = { generate, list };
