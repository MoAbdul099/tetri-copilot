const prisma = require('../../lib/prisma');

const WORKFLOW_INCLUDE = {
  submittedBy: { select: { id: true, fullName: true, email: true } },
  assignments: {
    include: {
      assignedTo: { select: { id: true, fullName: true, email: true } },
      decidedBy:  { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
  comments: {
    include: { user: { select: { id: true, fullName: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  },
  auditLogs: {
    include: { user: { select: { id: true, fullName: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  },
};

// ── Approval Rules ─────────────────────────────────────────

const listRules = (workspaceId) =>
  prisma.approvalRule.findMany({
    where: { workspaceId, isActive: true },
    include: {
      approverUser: { select: { id: true, fullName: true, email: true } },
      category:    { select: { id: true, name: true } },
    },
    orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
  });

const createRule = (workspaceId, userId, data) =>
  prisma.approvalRule.create({
    data: { workspaceId, createdByUserId: userId, ...data },
    include: {
      approverUser: { select: { id: true, fullName: true, email: true } },
      category:    { select: { id: true, name: true } },
    },
  });

const updateRule = (id, workspaceId, data) =>
  prisma.approvalRule.update({
    where: { id },
    data,
    include: {
      approverUser: { select: { id: true, fullName: true, email: true } },
      category:    { select: { id: true, name: true } },
    },
  });

const deleteRule = (id, workspaceId) =>
  prisma.approvalRule.update({ where: { id }, data: { isActive: false } });

const findRule = (id, workspaceId) =>
  prisma.approvalRule.findFirst({ where: { id, workspaceId } });

// ── Workspace approvers ────────────────────────────────────

const findWorkspaceApprovers = async (workspaceId) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, status: 'active', role: { in: ['owner', 'admin'] } },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
};

const findWorkspaceOwners = async (workspaceId) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, status: 'active', role: 'owner' },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
};

const findWorkspaceAdmins = async (workspaceId) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, status: 'active', role: { in: ['owner', 'admin'] } },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
};

// ── Workflows ──────────────────────────────────────────────

const findWorkflowByExpenseId = (expenseId) =>
  prisma.approvalWorkflow.findUnique({ where: { expenseId }, include: WORKFLOW_INCLUDE });

const findWorkflowById = (id) =>
  prisma.approvalWorkflow.findUnique({ where: { id }, include: WORKFLOW_INCLUDE });

const createWorkflow = (workspaceId, expenseId, userId) =>
  prisma.approvalWorkflow.create({
    data: {
      workspaceId,
      expenseId,
      submittedByUserId: userId,
      submittedAt: new Date(),
      status: 'pending',
    },
  });

const updateWorkflowStatus = (id, status, decidedAt) =>
  prisma.approvalWorkflow.update({
    where: { id },
    data: { status, ...(decidedAt ? { decidedAt } : {}) },
  });

const deleteWorkflowAssignments = (workflowId) =>
  prisma.approvalAssignment.deleteMany({ where: { workflowId } });

// ── Assignments ────────────────────────────────────────────

const createAssignment = (workflowId, workspaceId, assignedToUserId) =>
  prisma.approvalAssignment.create({
    data: { workflowId, workspaceId, assignedToUserId, status: 'pending' },
  });

const findPendingAssignmentForUser = (workflowId, userId) =>
  prisma.approvalAssignment.findFirst({
    where: { workflowId, assignedToUserId: userId, status: 'pending' },
  });

const updateAssignment = (id, status, userId) =>
  prisma.approvalAssignment.update({
    where: { id },
    data: { status, decidedAt: new Date(), decidedByUserId: userId },
  });

const getMyPendingAssignments = async (workspaceId, userId) => {
  const assignments = await prisma.approvalAssignment.findMany({
    where: { workspaceId, assignedToUserId: userId, status: 'pending' },
    include: {
      workflow: {
        include: {
          expense: {
            include: {
              category:      { select: { id: true, name: true } },
              supplier:      { select: { id: true, name: true } },
              createdByUser: { select: { id: true, fullName: true, email: true } },
            },
          },
          submittedBy: { select: { id: true, fullName: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
  return assignments;
};

// ── Comments ───────────────────────────────────────────────

const addComment = (workflowId, workspaceId, userId, action, comment) =>
  prisma.approvalComment.create({
    data: { workflowId, workspaceId, userId, action, comment },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });

// ── Audit log ──────────────────────────────────────────────

const createAuditLog = (workspaceId, entityId, workflowId, reimbursementId, userId, action, previousStatus, newStatus, comment) =>
  prisma.approvalAuditLog.create({
    data: {
      workspaceId,
      entityType: 'expense',
      entityId,
      workflowId:      workflowId   || undefined,
      reimbursementId: reimbursementId || undefined,
      userId,
      action,
      previousStatus: previousStatus || undefined,
      newStatus:      newStatus      || undefined,
      comment:        comment        || undefined,
    },
  });

// ── Dashboard stats ────────────────────────────────────────

const getDashboardStats = async (workspaceId, userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [myPending, allPending, approvedToday, rejectedToday] = await Promise.all([
    prisma.approvalAssignment.count({
      where: { workspaceId, assignedToUserId: userId, status: 'pending' },
    }),
    prisma.approvalWorkflow.count({
      where: { workspaceId, status: 'pending' },
    }),
    prisma.approvalAuditLog.count({
      where: { workspaceId, action: 'approve', createdAt: { gte: today } },
    }),
    prisma.approvalAuditLog.count({
      where: { workspaceId, action: 'reject', createdAt: { gte: today } },
    }),
  ]);

  return { myPending, allPending, approvedToday, rejectedToday };
};

module.exports = {
  listRules, createRule, updateRule, deleteRule, findRule,
  findWorkspaceApprovers, findWorkspaceOwners, findWorkspaceAdmins,
  findWorkflowByExpenseId, findWorkflowById, createWorkflow, updateWorkflowStatus, deleteWorkflowAssignments,
  createAssignment, findPendingAssignmentForUser, updateAssignment, getMyPendingAssignments,
  addComment,
  createAuditLog,
  getDashboardStats,
};
