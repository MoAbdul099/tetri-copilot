const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const repo = require('./payments.repository');
const { logActivity, logAudit } = require('../../lib/activityLogger');
const {
  recordPaymentSchema, updatePaymentSchema, allocateSchema, reverseSchema, applyCreditSchema,
} = require('./payments.validation');
const { VALID_TRANSITIONS, ALLOWED_MIME_TYPES, MAX_ATTACHMENT_BYTES } = require('./payments.constants');
const prisma = require('../../lib/prisma');

const UPLOADS_DIR = path.join(__dirname, '../../../uploads/payments');

const requireRole = (role, minRole) => {
  const ORDER = { viewer: 0, user: 1, admin: 2, owner: 3 };
  if ((ORDER[role] ?? -1) < (ORDER[minRole] ?? 99)) {
    const e = new Error('Insufficient permissions'); e.statusCode = 403; throw e;
  }
};

const fmt = (v) => Number(v ?? 0);

// Recalculate payment status based on allocated vs total amount
const derivePaymentStatus = (amount, allocatedAmount) => {
  const total = fmt(amount);
  const alloc  = fmt(allocatedAmount);
  if (alloc <= 0)      return 'unallocated';
  if (alloc >= total)  return 'allocated';
  return 'partially_allocated';
};

// Recalculate invoice status after paid_amount changes
const deriveInvoiceStatus = (invoice, newPaidAmount) => {
  const total = fmt(invoice.totalAmount);
  const paid  = fmt(newPaidAmount);
  if (paid <= 0)     return invoice.status === 'paid' || invoice.status === 'partially_paid' ? 'sent' : invoice.status;
  if (paid >= total) return 'paid';
  return 'partially_paid';
};

// ── CRUD ─────────────────────────────────────────────────────

const listPayments = async (workspaceId, query) => {
  const result = await repo.listPayments(workspaceId, query);
  return {
    ...result,
    items: result.items.map((p) => ({
      ...p,
      amount:           fmt(p.amount),
      allocatedAmount:  fmt(p.allocatedAmount),
      unallocatedAmount: fmt(p.unallocatedAmount),
    })),
  };
};

const getPayment = async (id, workspaceId) => {
  const p = await repo.findById(id, workspaceId);
  if (!p) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }
  return formatPayment(p);
};

const formatPayment = (p) => ({
  ...p,
  amount:           fmt(p.amount),
  allocatedAmount:  fmt(p.allocatedAmount),
  unallocatedAmount: fmt(p.unallocatedAmount),
  allocations: (p.allocations || []).map((a) => ({
    ...a,
    allocatedAmount: fmt(a.allocatedAmount),
    invoice: a.invoice ? {
      ...a.invoice,
      totalAmount: fmt(a.invoice.totalAmount),
      paidAmount:  fmt(a.invoice.paidAmount),
    } : null,
  })),
  credits: (p.credits || []).map((c) => ({
    ...c,
    originalAmount:  fmt(c.originalAmount),
    remainingAmount: fmt(c.remainingAmount),
  })),
});

const recordPayment = async (workspaceId, userId, rawPayload) => {
  requireRole('user', 'user'); // any non-viewer
  const data = recordPaymentSchema.parse(rawPayload);

  const customer = await prisma.customer.findFirst({ where: { id: data.customerId, workspaceId } });
  if (!customer) { const e = new Error('Customer not found'); e.statusCode = 404; throw e; }

  const payload = {
    ...data,
    paymentDate:  new Date(data.paymentDate),
    depositDate:  data.depositDate ? new Date(data.depositDate) : null,
    valueDate:    data.valueDate   ? new Date(data.valueDate)   : null,
    amount:       data.amount,
    allocatedAmount:   0,
    unallocatedAmount: data.amount,
    status:       'draft',
  };

  const payment = await repo.create(workspaceId, userId, payload);
  await repo.addStatusHistory(payment.id, workspaceId, null, 'draft', userId);

  logActivity({ workspaceId, userId, action: 'payment.created', entityType: 'payment', entityId: payment.id,
    description: `Payment ${payment.paymentNumber} recorded for ${customer.name}` });

  return formatPayment(payment);
};

const updatePayment = async (id, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }
  if (existing.status !== 'draft') { const e = new Error('Only draft payments can be edited'); e.statusCode = 422; throw e; }

  const data = updatePaymentSchema.parse(rawPayload);
  const payload = {
    ...data,
    ...(data.paymentDate ? { paymentDate: new Date(data.paymentDate) } : {}),
    ...(data.depositDate !== undefined ? { depositDate: data.depositDate ? new Date(data.depositDate) : null } : {}),
    ...(data.valueDate   !== undefined ? { valueDate:   data.valueDate   ? new Date(data.valueDate)   : null } : {}),
  };

  // If amount changed, recalculate unallocated
  if (data.amount !== undefined) {
    payload.unallocatedAmount = data.amount - fmt(existing.allocatedAmount);
  }

  const payment = await repo.update(id, payload);

  logActivity({ workspaceId, userId, action: 'payment.updated', entityType: 'payment', entityId: id,
    description: `Payment ${payment.paymentNumber} updated` });

  return formatPayment(payment);
};

// ── Status transitions ────────────────────────────────────────

const postPayment = async (id, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }
  if (!VALID_TRANSITIONS[existing.status]?.includes('posted')) {
    const e = new Error(`Cannot post payment in status "${existing.status}"`); e.statusCode = 422; throw e;
  }

  const now = new Date();
  await repo.updateStatus(id, 'unallocated', { postedAt: now });
  await repo.addStatusHistory(id, workspaceId, existing.status, 'unallocated', userId);

  logActivity({ workspaceId, userId, action: 'payment.posted', entityType: 'payment', entityId: id,
    description: `Payment ${existing.paymentNumber} posted` });

  return repo.findById(id, workspaceId).then(formatPayment);
};

const reversePayment = async (id, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'admin');
  const { reason } = reverseSchema.parse(rawPayload);

  const existing = await repo.findById(id, workspaceId);
  if (!existing) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }

  const reversibleStatuses = ['posted', 'allocated', 'partially_allocated', 'unallocated'];
  if (!reversibleStatuses.includes(existing.status)) {
    const e = new Error(`Cannot reverse payment in status "${existing.status}"`); e.statusCode = 422; throw e;
  }

  // Reverse all allocations — restore invoice paid amounts
  await Promise.all((existing.allocations || []).map(async (alloc) => {
    const inv = await repo.getInvoiceForAllocation(alloc.invoiceId, workspaceId);
    if (!inv) return;

    const newPaidAmount = Math.max(0, fmt(inv.paidAmount) - fmt(alloc.allocatedAmount));
    const newStatus     = deriveInvoiceStatus({ ...inv, status: inv.status }, newPaidAmount);
    await repo.updateInvoicePaidAmount(alloc.invoiceId, newPaidAmount, newStatus);
    await repo.deleteAllocation(alloc.id);
  }));

  await repo.updateStatus(id, 'reversed', { reversedAt: new Date(), reversedById: userId, reversalReason: reason });
  await repo.addStatusHistory(id, workspaceId, existing.status, 'reversed', userId, reason);

  logActivity({ workspaceId, userId, action: 'payment.reversed', entityType: 'payment', entityId: id,
    description: `Payment ${existing.paymentNumber} reversed: ${reason}` });
  logAudit({ workspaceId, adminUserId: userId, action: 'payment.reversed', entityType: 'payment', entityId: id,
    oldValue: { status: existing.status }, newValue: { status: 'reversed', reason } });

  return repo.findById(id, workspaceId).then(formatPayment);
};

const voidPayment = async (id, workspaceId, userId, role) => {
  requireRole(role, 'admin');
  const existing = await repo.findByIdSimple(id, workspaceId);
  if (!existing) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }
  if (!VALID_TRANSITIONS[existing.status]?.includes('voided')) {
    const e = new Error(`Cannot void payment in status "${existing.status}"`); e.statusCode = 422; throw e;
  }

  await repo.updateStatus(id, 'voided', { voidedAt: new Date() });
  await repo.addStatusHistory(id, workspaceId, existing.status, 'voided', userId);

  logActivity({ workspaceId, userId, action: 'payment.voided', entityType: 'payment', entityId: id,
    description: `Payment ${existing.paymentNumber} voided` });

  return repo.findById(id, workspaceId).then(formatPayment);
};

// ── Allocation engine ─────────────────────────────────────────

const allocatePayment = async (id, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const { allocations } = allocateSchema.parse(rawPayload);

  const payment = await repo.findById(id, workspaceId);
  if (!payment) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }

  const postableStatuses = ['posted', 'unallocated', 'partially_allocated'];
  if (!postableStatuses.includes(payment.status)) {
    const e = new Error(`Cannot allocate payment in status "${payment.status}"`); e.statusCode = 422; throw e;
  }

  let available = fmt(payment.unallocatedAmount);
  const totalRequested = allocations.reduce((s, a) => s + a.allocatedAmount, 0);
  if (totalRequested > available + 0.001) {
    const e = new Error(`Allocation total (${totalRequested}) exceeds available balance (${available})`);
    e.statusCode = 422; throw e;
  }

  for (const alloc of allocations) {
    const inv = await repo.getInvoiceForAllocation(alloc.invoiceId, workspaceId);
    if (!inv) { const e = new Error(`Invoice not found: ${alloc.invoiceId}`); e.statusCode = 404; throw e; }

    const outstanding = fmt(inv.totalAmount) - fmt(inv.paidAmount);
    if (alloc.allocatedAmount > outstanding + 0.001) {
      const e = new Error(`Allocation exceeds invoice outstanding balance (${outstanding})`);
      e.statusCode = 422; throw e;
    }

    const newPaidAmount = fmt(inv.paidAmount) + alloc.allocatedAmount;
    const newStatus     = deriveInvoiceStatus(inv, newPaidAmount);
    const extra         = newStatus === 'paid' ? { paidAt: new Date() } : {};

    await repo.updateInvoicePaidAmount(alloc.invoiceId, newPaidAmount, newStatus, extra);
    await repo.createAllocation({ paymentId: id, invoiceId: alloc.invoiceId, workspaceId, allocatedAmount: alloc.allocatedAmount, allocatedById: userId, notes: alloc.notes });

    available -= alloc.allocatedAmount;
  }

  const newAllocated   = fmt(payment.allocatedAmount) + totalRequested;
  const newUnallocated = fmt(payment.amount) - newAllocated;
  const newStatus      = derivePaymentStatus(payment.amount, newAllocated);

  await repo.update(id, { allocatedAmount: newAllocated, unallocatedAmount: newUnallocated, status: newStatus });

  logActivity({ workspaceId, userId, action: 'payment.allocated', entityType: 'payment', entityId: id,
    description: `Payment ${payment.paymentNumber} allocated to ${allocations.length} invoice(s)` });

  return repo.findById(id, workspaceId).then(formatPayment);
};

const removeAllocation = async (allocationId, workspaceId, userId, role) => {
  requireRole(role, 'admin');
  const alloc = await repo.findAllocation(allocationId, workspaceId);
  if (!alloc) { const e = new Error('Allocation not found'); e.statusCode = 404; throw e; }

  const inv = await repo.getInvoiceForAllocation(alloc.invoiceId, workspaceId);
  if (inv) {
    const newPaidAmount = Math.max(0, fmt(inv.paidAmount) - fmt(alloc.allocatedAmount));
    const newStatus     = deriveInvoiceStatus(inv, newPaidAmount);
    await repo.updateInvoicePaidAmount(alloc.invoiceId, newPaidAmount, newStatus);
  }

  await repo.deleteAllocation(allocationId);

  const payment    = await repo.findById(alloc.paymentId, workspaceId);
  const newAllocated   = Math.max(0, fmt(payment.allocatedAmount) - fmt(alloc.allocatedAmount));
  const newUnallocated = fmt(payment.amount) - newAllocated;
  const newStatus      = derivePaymentStatus(payment.amount, newAllocated);
  await repo.update(alloc.paymentId, { allocatedAmount: newAllocated, unallocatedAmount: newUnallocated, status: newStatus });

  logActivity({ workspaceId, userId, action: 'payment.allocation_removed', entityType: 'payment', entityId: alloc.paymentId,
    description: `Allocation removed from payment ${payment.paymentNumber}` });

  return repo.findById(alloc.paymentId, workspaceId).then(formatPayment);
};

const autoAllocate = async (id, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const payment = await repo.findById(id, workspaceId);
  if (!payment) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }

  let available = fmt(payment.unallocatedAmount);
  if (available <= 0) { const e = new Error('No unallocated balance remaining'); e.statusCode = 422; throw e; }

  // Get oldest outstanding invoices for this customer
  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      customerId: payment.customerId,
      status: { in: ['issued', 'sent', 'partially_paid', 'overdue'] },
    },
    orderBy: [{ dueDate: 'asc' }, { issueDate: 'asc' }, { invoiceNumber: 'asc' }],
  });

  const autoAllocs = [];
  for (const inv of invoices) {
    if (available <= 0) break;
    const outstanding = fmt(inv.totalAmount) - fmt(inv.paidAmount);
    if (outstanding <= 0) continue;
    const allocAmt = Math.min(available, outstanding);
    autoAllocs.push({ invoiceId: inv.id, allocatedAmount: allocAmt });
    available -= allocAmt;
  }

  if (autoAllocs.length === 0) return formatPayment(payment);

  return allocatePayment(id, workspaceId, userId, role, { allocations: autoAllocs });
};

// ── Credits ───────────────────────────────────────────────────

const createCredit = async (id, workspaceId, userId, role, amount) => {
  requireRole(role, 'user');
  const payment = await repo.findByIdSimple(id, workspaceId);
  if (!payment) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }

  const available = fmt(payment.unallocatedAmount);
  const creditAmt = amount || available;
  if (creditAmt > available + 0.001) {
    const e = new Error(`Credit amount exceeds unallocated balance (${available})`); e.statusCode = 422; throw e;
  }
  if (creditAmt <= 0) { const e = new Error('Credit amount must be positive'); e.statusCode = 422; throw e; }

  const credit = await repo.createCredit({
    workspaceId, customerId: payment.customerId, paymentId: id,
    currencyCode: payment.currencyCode, originalAmount: creditAmt,
    remainingAmount: creditAmt, usedAmount: 0, createdById: userId,
  });

  await repo.createCreditTransaction({ workspaceId, creditId: credit.id, amount: creditAmt, type: 'created', createdById: userId });

  // Reduce unallocated on payment
  const newUnallocated = available - creditAmt;
  const newAllocated   = fmt(payment.allocatedAmount) + creditAmt;
  const newStatus      = derivePaymentStatus(payment.amount, newAllocated);
  await repo.update(id, { allocatedAmount: newAllocated, unallocatedAmount: newUnallocated, status: newStatus });

  logActivity({ workspaceId, userId, action: 'credit.created', entityType: 'payment', entityId: id,
    description: `Credit of ${creditAmt} created for customer` });

  return credit;
};

const applyCredit = async (creditId, workspaceId, userId, role, rawPayload) => {
  requireRole(role, 'user');
  const { invoiceId, amount } = applyCreditSchema.parse(rawPayload);

  const credit = await repo.findCreditById(creditId, workspaceId);
  if (!credit) { const e = new Error('Credit not found'); e.statusCode = 404; throw e; }
  if (fmt(credit.remainingAmount) < amount - 0.001) {
    const e = new Error(`Amount exceeds credit balance (${credit.remainingAmount})`); e.statusCode = 422; throw e;
  }

  const inv = await repo.getInvoiceForAllocation(invoiceId, workspaceId);
  if (!inv) { const e = new Error('Invoice not found'); e.statusCode = 404; throw e; }

  const outstanding = fmt(inv.totalAmount) - fmt(inv.paidAmount);
  if (amount > outstanding + 0.001) {
    const e = new Error(`Amount exceeds invoice outstanding (${outstanding})`); e.statusCode = 422; throw e;
  }

  const newPaidAmount = fmt(inv.paidAmount) + amount;
  const newStatus     = deriveInvoiceStatus(inv, newPaidAmount);
  await repo.updateInvoicePaidAmount(invoiceId, newPaidAmount, newStatus, newStatus === 'paid' ? { paidAt: new Date() } : {});

  const newUsed      = fmt(credit.usedAmount) + amount;
  const newRemaining = fmt(credit.remainingAmount) - amount;
  await repo.updateCredit(creditId, { usedAmount: newUsed, remainingAmount: newRemaining });
  await repo.createCreditTransaction({ workspaceId, creditId, invoiceId, amount, type: 'applied', createdById: userId });

  logActivity({ workspaceId, userId, action: 'credit.applied', entityType: 'credit', entityId: creditId,
    description: `Credit applied to invoice` });

  return repo.findCreditById(creditId, workspaceId);
};

const listCredits = (workspaceId, customerId) =>
  repo.listCredits(workspaceId, customerId);

// ── Attachments ───────────────────────────────────────────────

const uploadAttachment = async (id, workspaceId, userId, role, file) => {
  requireRole(role, 'user');
  const payment = await repo.findByIdSimple(id, workspaceId);
  if (!payment) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }
  if (!file) { const e = new Error('No file uploaded'); e.statusCode = 400; throw e; }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) { const e = new Error('File type not allowed'); e.statusCode = 400; throw e; }
  if (file.size > MAX_ATTACHMENT_BYTES) { const e = new Error('File too large (max 20 MB)'); e.statusCode = 400; throw e; }

  const dir = path.join(UPLOADS_DIR, workspaceId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(file.originalname) || '';
  const uuid = crypto.randomUUID();
  const storedFileName = `${uuid}${ext}`;
  const storagePath    = path.join(dir, storedFileName);
  fs.writeFileSync(storagePath, file.buffer);

  const att = await repo.createAttachment({ paymentId: id, workspaceId, fileName: file.originalname, storedFileName, mimeType: file.mimetype, fileSize: file.size, storagePath, uploadedById: userId });

  logActivity({ workspaceId, userId, action: 'payment.attachment_uploaded', entityType: 'payment', entityId: id,
    description: `Attachment "${file.originalname}" uploaded` });

  return { ...att, fileSize: Number(att.fileSize) };
};

const deleteAttachment = async (attachmentId, workspaceId, userId, role) => {
  requireRole(role, 'user');
  const att = await repo.findAttachment(attachmentId, workspaceId);
  if (!att) { const e = new Error('Attachment not found'); e.statusCode = 404; throw e; }
  if (fs.existsSync(att.storagePath)) fs.unlinkSync(att.storagePath);
  await repo.deleteAttachment(attachmentId);
  logActivity({ workspaceId, userId, action: 'payment.attachment_deleted', entityType: 'payment', entityId: att.paymentId,
    description: `Attachment "${att.fileName}" deleted` });
};

const getStats = async (workspaceId) => {
  const raw = await repo.getStats(workspaceId);
  const byStatus = {};
  raw.counts.forEach((r) => { byStatus[r.status] = { count: r._count.id, total: Number(r._sum.amount || 0) }; });
  return {
    byStatus,
    todayTotal:       Number(raw.todaySum._sum.amount || 0),
    monthTotal:       Number(raw.monthSum._sum.amount || 0),
    unallocatedTotal: Number(raw.unallocatedSum._sum.unallocatedAmount || 0),
    creditBalance:    Number(raw.creditSum._sum.remainingAmount || 0),
  };
};

module.exports = {
  listPayments, getPayment, recordPayment, updatePayment,
  postPayment, reversePayment, voidPayment,
  allocatePayment, removeAllocation, autoAllocate,
  createCredit, applyCredit, listCredits,
  uploadAttachment, deleteAttachment,
  getStats,
};
