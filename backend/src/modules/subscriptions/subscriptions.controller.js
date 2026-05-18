const service = require('./subscriptions.service');
const { success } = require('../../utils/response');

const getCurrent = async (req, res, next) => {
  try {
    const subscription = await service.getCurrentSubscription(req.workspaceId, req.user.id);
    return success(res, { subscription }, 'Subscription retrieved');
  } catch (err) {
    next(err);
  }
};

const getFeatures = async (req, res, next) => {
  try {
    const { canAccess, ...access } = await service.getFeatureAccess(req.workspaceId, req.user.id);
    return success(res, access, 'Feature access retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCurrent, getFeatures };
