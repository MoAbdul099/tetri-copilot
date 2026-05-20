const service = require('./receivables.service');
const { success } = require('../../utils/response');

const getSummary = async (req, res, next) => {
  try { success(res, await service.getSummary(req.workspaceId)); } catch (e) { next(e); }
};

const getAging = async (req, res, next) => {
  try { success(res, await service.getAging(req.workspaceId, req.query)); } catch (e) { next(e); }
};

const getCustomers = async (req, res, next) => {
  try { success(res, await service.getCustomers(req.workspaceId, req.query)); } catch (e) { next(e); }
};

const getCustomerProfile = async (req, res, next) => {
  try {
    const data = await service.getCustomerProfile(req.workspaceId, req.params.id);
    if (!data) return res.status(404).json({ success: false, error: 'Customer not found' });
    success(res, data);
  } catch (e) { next(e); }
};

const getTopDebtors = async (req, res, next) => {
  try { success(res, await service.getTopDebtors(req.workspaceId)); } catch (e) { next(e); }
};

module.exports = { getSummary, getAging, getCustomers, getCustomerProfile, getTopDebtors };
