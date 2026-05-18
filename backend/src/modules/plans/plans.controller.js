const service = require('./plans.service');
const { success } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const plans = await service.listPlans();
    return success(res, { plans }, 'Plans retrieved');
  } catch (err) {
    next(err);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const plan = await service.getPlanBySlug(req.params.slug);
    return success(res, { plan }, 'Plan retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getBySlug };
