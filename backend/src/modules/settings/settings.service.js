const settingsRepository = require('./settings.repository');

const getSettings = (workspaceId) => settingsRepository.findByWorkspace(workspaceId);

const updateSettings = (workspaceId, data) => settingsRepository.upsert(workspaceId, data);

module.exports = { getSettings, updateSettings };
