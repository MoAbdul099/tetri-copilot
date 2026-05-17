const settingsService = require('./settings.service');
const { patchSettingsSchema } = require('./settings.validation');
const { success } = require('../../utils/response');

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings(req.workspaceId);
    return success(res, { settings: settings || null }, 'Settings retrieved');
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const data = patchSettingsSchema.parse(req.body);
    const settings = await settingsService.updateSettings(req.workspaceId, data);
    return success(res, { settings }, 'Settings updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
