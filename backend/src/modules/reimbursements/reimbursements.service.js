const repo = require('./reimbursements.repository');
const expRepo = require('../expenses/expenses.repository');

const notFound  = (msg) => Object.assign(new Error(msg), { statusCode: 404 });
const badRequest= (msg) => Object.assign(new Error(msg), { statusCode: 400 });
const forbidden = (msg) => Object.assign(new Error(msg), { statusCode: 403 });

const list = (workspaceId, query) => repo.list(workspaceId, query);

const getOne = async (workspaceId, id) => {
  const r = await repo.findById(id, workspaceId);
  if (!r) throw notFound('Reimbursement not found');
  return r;
};

const getDashboard = (workspaceId) => repo.getDashboard(workspaceId);

const create = async (workspaceId, userId, data) => {
  const { expenseId, requestedAmount, currencyCode, notes } = data;

  const expense = await expRepo.findById(expenseId, workspaceId);
  if (!expense) throw notFound('Expense not found');
  if (expense.status !== 'approved') throw badRequest('Only approved expenses can be reimbursed');
  if (expense.expenseType !== 'employee') throw badRequest('Only employee expenses can be reimbursed');

  const existing = await repo.findByExpenseId(expenseId, workspaceId);
  if (existing && !['rejected', 'cancelled'].includes(existing.status)) {
    throw badRequest('A reimbursement request already exists for this expense');
  }

  if (!requestedAmount || Number(requestedAmount) <= 0) throw badRequest('Requested amount must be greater than zero');

  const reimb = await repo.create(workspaceId, userId, {
    expenseId,
    requestedAmount: Number(requestedAmount),
    currencyCode:    currencyCode || expense.currencyCode,
    notes,
  });

  await repo.addAuditLog(workspaceId, reimb.id, userId, 'create', null, 'pending_approval', null);
  return reimb;
};

const approve = async (workspaceId, userId, id, { comment } = {}) => {
  const reimb = await getOne(workspaceId, id);
  if (reimb.status !== 'pending_approval') throw badRequest('Reimbursement is not pending approval');

  const updated = await repo.update(id, {
    status:          'approved',
    approvedByUserId: userId,
    approvedAt:       new Date(),
  });

  await repo.addAuditLog(workspaceId, id, userId, 'approve', 'pending_approval', 'approved', comment);
  return updated;
};

const reject = async (workspaceId, userId, id, { comment } = {}) => {
  if (!comment || !comment.trim()) throw badRequest('A rejection reason is required');

  const reimb = await getOne(workspaceId, id);
  if (reimb.status !== 'pending_approval') throw badRequest('Reimbursement is not pending approval');

  const updated = await repo.update(id, {
    status:           'rejected',
    rejectedByUserId:  userId,
    rejectedAt:        new Date(),
    rejectionNote:     comment,
  });

  await repo.addAuditLog(workspaceId, id, userId, 'reject', 'pending_approval', 'rejected', comment);
  return updated;
};

const recordPayment = async (workspaceId, userId, id, data) => {
  const reimb = await getOne(workspaceId, id);
  if (!['approved', 'partially_paid'].includes(reimb.status)) {
    throw badRequest('Reimbursement must be approved before recording payments');
  }

  const { amount, paymentDate, paymentMethod, referenceNumber, notes } = data;
  if (!amount || Number(amount) <= 0) throw badRequest('Payment amount must be greater than zero');
  if (!paymentDate) throw badRequest('Payment date is required');
  if (!paymentMethod) throw badRequest('Payment method is required');

  const currentPaid = Number(reimb.paidAmount || 0);
  const requested   = Number(reimb.requestedAmount || 0);
  const paying      = Number(amount);

  if (currentPaid + paying > requested + 0.01) {
    throw badRequest(`Payment amount exceeds outstanding balance of ${(requested - currentPaid).toFixed(2)}`);
  }

  const payment = await repo.addPayment(id, workspaceId, userId, {
    amount: paying, paymentDate, paymentMethod,
    referenceNumber: referenceNumber || undefined,
    notes:           notes || undefined,
    currencyCode:    reimb.currencyCode,
  });

  await repo.addAuditLog(workspaceId, id, userId, 'payment_recorded', reimb.status, null, `Payment of ${paying} recorded`);
  return payment;
};

const cancel = async (workspaceId, userId, id) => {
  const reimb = await getOne(workspaceId, id);
  if (['fully_paid', 'cancelled'].includes(reimb.status)) {
    throw badRequest('Cannot cancel a completed or already cancelled reimbursement');
  }

  const updated = await repo.update(id, { status: 'cancelled' });
  await repo.addAuditLog(workspaceId, id, userId, 'cancel', reimb.status, 'cancelled', null);
  return updated;
};

module.exports = { list, getOne, getDashboard, create, approve, reject, recordPayment, cancel };
