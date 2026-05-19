const prisma = require('../../lib/prisma');

const countActiveMembers = (workspaceId) =>
  prisma.workspaceMember.count({ where: { workspaceId, status: 'active' } });

const countMonthlyInvoices = (workspaceId) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return prisma.invoice.count({ where: { workspaceId, createdAt: { gte: start } } });
};

const countMonthlyExpenses = (workspaceId) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return prisma.expense.count({ where: { workspaceId, createdAt: { gte: start } } });
};

const countMonthlyAiRequests = (workspaceId) => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return prisma.aiUsageLog.count({ where: { workspaceId, createdAt: { gte: start } } });
};

module.exports = {
  countActiveMembers,
  countMonthlyInvoices,
  countMonthlyExpenses,
  countMonthlyAiRequests,
};
