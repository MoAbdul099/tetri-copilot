const service = require('./subscriptions.service');
const { changePlanSchema } = require('./subscriptions.validation');
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

const upgrade = async (req, res, next) => {
  try {
    const { planCode } = changePlanSchema.parse(req.body);
    const subscription = await service.changePlan(req.workspaceId, planCode, 'upgrade', req.user.id);
    return success(res, { subscription }, 'Plan upgraded successfully');
  } catch (err) {
    next(err);
  }
};

const downgrade = async (req, res, next) => {
  try {
    const { planCode } = changePlanSchema.parse(req.body);
    const subscription = await service.changePlan(req.workspaceId, planCode, 'downgrade', req.user.id);
    return success(res, { subscription }, 'Plan downgraded successfully');
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    const subscription = await service.cancelSubscription(req.workspaceId, req.user.id);
    return success(res, { subscription }, 'Subscription cancelled');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCurrent, getFeatures, upgrade, downgrade, cancel };
