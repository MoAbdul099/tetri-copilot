const repo = require('./admin.dashboard.repository');
const { logActivity } = require('../auth/admin.auth.repository');

async function getOverview() {
  return repo.getOverview();
}

async function getOrganizationMetrics() {
  return repo.getOrganizationMetrics();
}

async function getUserMetrics() {
  return repo.getUserMetrics();
}

async function getSubscriptionMetrics() {
  return repo.getSubscriptionMetrics();
}

async function getAiMetrics() {
  return repo.getAiMetrics();
}

async function getComplianceMetrics() {
  return repo.getComplianceMetrics();
}

async function getStorageMetrics() {
  return repo.getStorageMetrics();
}

async function getActivityFeed() {
  return repo.getActivityFeed(30);
}

async function exportCsv({ adminId, ipAddress }) {
  const data = await repo.getExportData();
  await logActivity({ adminId, action: 'dashboard_export', meta: { format: 'csv' }, ipAddress }).catch(() => {});

  const rows = [
    ['Type', 'ID', 'Name/Email', 'Status', 'Plan', 'Created At'],
    ...data.orgs.map((o) => ['Organization', o.id, o.name, o.status, '', o.createdAt?.toISOString() || '']),
    ...data.users.map((u) => ['User', u.id, u.email, u.status, '', u.createdAt?.toISOString() || '']),
    ...data.subs.map((s) => ['Subscription', s.workspaceId, '', s.status, s.plan?.name || '', s.createdAt?.toISOString() || '']),
  ];

  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

module.exports = {
  getOverview, getOrganizationMetrics, getUserMetrics,
  getSubscriptionMetrics, getAiMetrics, getComplianceMetrics,
  getStorageMetrics, getActivityFeed, exportCsv,
};
