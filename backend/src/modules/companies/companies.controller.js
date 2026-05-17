const companiesService = require('./companies.service');
const { patchCompanySchema } = require('./companies.validation');
const { success } = require('../../utils/response');

const getCompany = async (req, res, next) => {
  try {
    const company = await companiesService.getCompany(req.workspaceId);
    return success(res, { company: company || null }, 'Company profile retrieved');
  } catch (err) {
    next(err);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const data = patchCompanySchema.parse(req.body);
    const company = await companiesService.updateCompany(req.workspaceId, data);
    return success(res, { company }, 'Company profile updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCompany, updateCompany };
