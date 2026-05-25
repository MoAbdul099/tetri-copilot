const prisma = require('../../lib/prisma');
const repo = require('./expense-approvals.repository');
const expRepo = require('../expenses/expenses.repository');
const notifier = require('../notifications/notification.emitter');

const notFound = (msg) => Object.assign(new Error(msg), { statusCode: 404 });
const badRequest = (msg) => Object.assign(new Error(msg), { statusCode: 400 });
const forbidden = (msg) => Object.assign(new Error(msg), { statusCode: 403 });

// ── Rule resolution ────────────────────────────────────────

const resolveRuleApprovers = async (workspaceId, rule) => {
  if (rule.approverUserId) return [rule.approverUserId];
  if (rule.approverRole === 'owner') return repo.findWorkspaceOwners(workspaceId);
  if (rule.approverRole === 'admin') return repo.findWorkspaceAdmins(workspaceId);
  return repo.findWorkspaceApprovers(workspaceId);
};

const resolveApprovers = async (workspaceId, expense) => {
  const rules = await repo.listRules(workspaceId);
  const amount = Number(expense.amount || 0);

  for (const rule of rules) {
    if (rule.ruleType === 'amount_based') {
      const min = rule.amountMin != null ? Number(rule.amountMin) : 0;
      const max = rule.amountMax != null ? Number(rule.amountMax) : Infinity;
      if (amount >= min && amount <= max) return resolveRuleApprovers(workspaceId, rule);
    }
    if (rule.ruleType === 'category_based' && rule.categoryId && rule.categoryId === expense.categoryId) {
      return resolveRuleApprovers(workspaceId, rule);
    }
    if (rule.ruleType === 'department_based' && rule.department && expense.department &&
        rule.department.toLowerCase() === expense.department.toLowerCase()) {
      return resolveRuleApprovers(workspaceId, rule);
    }
    if (rule.ruleType === 'default') {
      return resolveRuleApprovers(workspaceId, rule);
    }
  }

  return repo.findWorkspaceApprovers(workspaceId);
};

// ── Expense status update (reuses expenses repo) ───────────

const setExpenseStatus = (expenseId, userId, status) =>
  prisma.expense.update({
    where: { id: expenseId },
    data:  { status, updatedByUserId: userId },
  });

// ── Submit ─────────────────────────────────────────────────

const submit = async (workspaceId, userId, expenseId) => {
  const expense = await expRepo.findById(expenseId, workspaceId);
  if (!expense) throw notFound('Expense not found');
  if (!['draft', 'returned'].includes(expense.status)) {
    throw badRequest(`Cannot submit expense with status '${expense.status}'`);
  }
  if (!expense.categoryId) throw badRequest('Category is required before submission');
  if (!expense.amount || Number(expense.amount) <= 0) throw badRequest('Amount must be greater than zero');
  if (!expense.description) throw badRequest('Description is required');

  const approvers = await resolveApprovers(workspaceId, expense);
  if (!approvers.length) throw badRequest('No approvers configured for this workspace');

  let workflow = await repo.findWorkflowByExpenseId(expenseId);

  if (workflow && workflow.status === 'returned') {
    await repo.deleteWorkflowAssignments(workflow.id);
    await repo.updateWorkflowStatus(workflow.id, 'pending');
  } else if (!workflow) {
    workflow = await repo.createWorkflow(workspaceId, expenseId, userId);
  }

  for (const approverUserId of approvers) {
    await repo.createAssignment(workflow.id, workspaceId, approverUserId);
  }

  await setExpenseStatus(expenseId, userId, 'pending_approval');
  await repo.addComment(workflow.id, workspaceId, userId, 'submit', 'Expense submitted for approval');
  await repo.createAuditLog(workspaceId, expenseId, workflow.id, null, userId, 'submit', expense.status, 'pending_approval', null);

  // Notify each approver
  for (const approverUserId of approvers) {
    notifier.emit('EXPENSE_APPROVAL_REQUIRED', workspaceId, approverUserId, {
      sourceId: expenseId, sourceType: 'expense',
      title: 'Expense approval required',
      body: expense.description || 'An expense is waiting for your approval.',
      actorId: userId,
    }).catch(() => {});
  }

  return repo.findWorkflowByExpenseId(expenseId);
};

// ── Approve ────────────────────────────────────────────────

const approve = async (workspaceId, userId, expenseId, { comment } = {}) => {
  const expense = await expRepo.findById(expenseId, workspaceId);
  if (!expense) throw notFound('Expense not found');
  if (expense.status !== 'pending_approval') throw badRequest('Expense is not pending approval');

  const workflow = await repo.findWorkflowByExpenseId(expenseId);
  if (!workflow) throw badRequest('No approval workflow found');

  const assignment = await repo.findPendingAssignmentForUser(workflow.id, userId);
  if (!assignment) throw forbidden('You are not assigned to approve this expense');

  await repo.updateAssignment(assignment.id, 'approved', userId);
  await repo.updateWorkflowStatus(workflow.id, 'approved', new Date());
  await setExpenseStatus(expenseId, userId, 'approved');

  if (comment) {
    await repo.addComment(workflow.id, workspaceId, userId, 'approve', comment);
  }
  await repo.createAuditLog(workspaceId, expenseId, workflow.id, null, userId, 'approve', 'pending_approval', 'approved', comment);

  notifier.emit('EXPENSE_APPROVED', workspaceId, expense.createdByUserId, {
    sourceId: expenseId, sourceType: 'expense',
    title: 'Expense approved',
    body: `Your expense "${expense.description || 'expense'}" has been approved.`,
    actorId: userId,
  }).catch(() => {});

  return repo.findWorkflowByExpenseId(expenseId);
};

// ── Reject ─────────────────────────────────────────────────

const reject = async (workspaceId, userId, expenseId, { comment } = {}) => {
  if (!comment || !comment.trim()) throw badRequest('A rejection reason is required');

  const expense = await expRepo.findById(expenseId, workspaceId);
  if (!expense) throw notFound('Expense not found');
  if (expense.status !== 'pending_approval') throw badRequest('Expense is not pending approval');

  const workflow = await repo.findWorkflowByExpenseId(expenseId);
  if (!workflow) throw badRequest('No approval workflow found');

  const assignment = await repo.findPendingAssignmentForUser(workflow.id, userId);
  if (!assignment) throw forbidden('You are not assigned to approve this expense');

  await repo.updateAssignment(assignment.id, 'rejected', userId);
  await repo.updateWorkflowStatus(workflow.id, 'rejected', new Date());
  await setExpenseStatus(expenseId, userId, 'rejected');
  await repo.addComment(workflow.id, workspaceId, userId, 'reject', comment);
  await repo.createAuditLog(workspaceId, expenseId, workflow.id, null, userId, 'reject', 'pending_approval', 'rejected', comment);

  notifier.emit('EXPENSE_REJECTED', workspaceId, expense.createdByUserId, {
    sourceId: expenseId, sourceType: 'expense',
    title: 'Expense rejected',
    body: `Your expense "${expense.description || 'expense'}" has been rejected. Reason: ${comment}`,
    actorId: userId,
  }).catch(() => {});

  return repo.findWorkflowByExpenseId(expenseId);
};

// ── Return for correction ──────────────────────────────────

const returnForCorrection = async (workspaceId, userId, expenseId, { comment } = {}) => {
  if (!comment || !comment.trim()) throw badRequest('A reason for returning is required');

  const expense = await expRepo.findById(expenseId, workspaceId);
  if (!expense) throw notFound('Expense not found');
  if (expense.status !== 'pending_approval') throw badRequest('Expense is not pending approval');

  const workflow = await repo.findWorkflowByExpenseId(expenseId);
  if (!workflow) throw badRequest('No approval workflow found');

  const assignment = await repo.findPendingAssignmentForUser(workflow.id, userId);
  if (!assignment) throw forbidden('You are not assigned to approve this expense');

  await repo.updateAssignment(assignment.id, 'returned', userId);
  await repo.updateWorkflowStatus(workflow.id, 'returned');
  await setExpenseStatus(expenseId, userId, 'returned');
  await repo.addComment(workflow.id, workspaceId, userId, 'return_for_correction', comment);
  await repo.createAuditLog(workspaceId, expenseId, workflow.id, null, userId, 'return_for_correction', 'pending_approval', 'returned', comment);

  return repo.findWorkflowByExpenseId(expenseId);
};

// ── Withdraw ───────────────────────────────────────────────

const withdraw = async (workspaceId, userId, expenseId) => {
  const expense = await expRepo.findById(expenseId, workspaceId);
  if (!expense) throw notFound('Expense not found');
  if (!['pending_approval', 'submitted'].includes(expense.status)) {
    throw badRequest('Expense cannot be withdrawn in its current status');
  }
  if (expense.createdByUserId !== userId) throw forbidden('Only the expense owner can withdraw');

  const workflow = await repo.findWorkflowByExpenseId(expenseId);
  if (workflow) {
    await repo.updateWorkflowStatus(workflow.id, 'withdrawn');
    await repo.addComment(workflow.id, workspaceId, userId, 'withdraw', 'Expense withdrawn by submitter');
    await repo.createAuditLog(workspaceId, expenseId, workflow.id, null, userId, 'withdraw', expense.status, 'draft', null);
  }

  await setExpenseStatus(expenseId, userId, 'draft');
  return expRepo.findById(expenseId, workspaceId);
};

// ── History ────────────────────────────────────────────────

const getApprovalHistory = async (workspaceId, expenseId) => {
  const expense = await expRepo.findById(expenseId, workspaceId);
  if (!expense) throw notFound('Expense not found');

  const workflow = await repo.findWorkflowByExpenseId(expenseId);
  return { expense, workflow };
};

// ── Inbox ──────────────────────────────────────────────────

const getInbox = (workspaceId, userId) => repo.getMyPendingAssignments(workspaceId, userId);

const getDashboard = (workspaceId, userId) => repo.getDashboardStats(workspaceId, userId);

// ── Rules CRUD ─────────────────────────────────────────────

const listRules = (workspaceId) => repo.listRules(workspaceId);

const createRule = (workspaceId, userId, data) => repo.createRule(workspaceId, userId, data);

const updateRule = async (workspaceId, userId, id, data) => {
  const rule = await repo.findRule(id, workspaceId);
  if (!rule) throw notFound('Rule not found');
  return repo.updateRule(id, workspaceId, data);
};

const deleteRule = async (workspaceId, userId, id) => {
  const rule = await repo.findRule(id, workspaceId);
  if (!rule) throw notFound('Rule not found');
  return repo.deleteRule(id, workspaceId);
};

module.exports = { submit, approve, reject, returnForCorrection, withdraw, getApprovalHistory, getInbox, getDashboard, listRules, createRule, updateRule, deleteRule };
