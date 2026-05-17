const companiesRepository = require('./companies.repository');

const getCompany = (workspaceId) => companiesRepository.findByWorkspace(workspaceId);

const updateCompany = (workspaceId, data) => companiesRepository.upsert(workspaceId, data);

module.exports = { getCompany, updateCompany };
