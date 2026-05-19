const service = require('./usage.service');
const { success } = require('../../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const summary = await service.getUsageSummary(req.workspaceId, req.user.id);
    return success(res, { summary }, 'Usage summary retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };
