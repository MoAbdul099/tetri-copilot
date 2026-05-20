const repo = require('./receivables.repository');

const getSummary        = (workspaceId)             => repo.getSummary(workspaceId);
const getAging          = (workspaceId, query)       => repo.getAging(workspaceId, query);
const getCustomers      = (workspaceId, query)       => repo.getCustomerReceivables(workspaceId, query);
const getCustomerProfile = (workspaceId, customerId) => repo.getCustomerProfile(workspaceId, customerId);
const getTopDebtors     = (workspaceId)              => repo.getTopDebtors(workspaceId);

module.exports = { getSummary, getAging, getCustomers, getCustomerProfile, getTopDebtors };
