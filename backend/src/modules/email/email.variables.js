const prisma = require('../../lib/prisma');

// ── Variable resolution ────────────────────────────────────

const renderTemplate = (template, vars) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined && val !== null ? String(val) : `{{${key}}}`;
  });

const buildBaseVars = (workspace, company, user) => ({
  workspace_name: workspace?.name     || 'Tetri Copilot',
  company_name:   company?.companyName || workspace?.name || 'Tetri Copilot',
  support_email:  company?.email       || 'support@tetrisuite.com',
  support_phone:  company?.phone       || '',
  current_date:   new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  current_time:   new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  user_name:      user?.fullName || user?.email || '',
  first_name:     user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || '',
  last_name:      user?.fullName?.split(' ').slice(1).join(' ') || '',
  email:          user?.email || '',
  role:           '',
});

const resolveVars = async (workspaceId, recipientId, extraVars = {}) => {
  const [workspace, company, user] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { id: true, name: true } }),
    prisma.company.findFirst({ where: { workspaceId }, select: { companyName: true, email: true, phone: true } }).catch(() => null),
    prisma.user.findUnique({ where: { id: recipientId }, select: { id: true, fullName: true, email: true } }).catch(() => null),
  ]);

  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: recipientId },
    select: { role: true },
  }).catch(() => null);

  const base = buildBaseVars(workspace, company, user);
  if (member) base.role = member.role;

  return { ...base, ...extraVars };
};

module.exports = { renderTemplate, resolveVars };
