const repo = require('./expenses.repository');
const path = require('path');
const fs = require('fs');
const notifier = require('../notifications/notification.emitter');

const UPLOAD_DIR = path.join(__dirname, '../../../../uploads/expenses');

const list = (workspaceId, query) => repo.list(workspaceId, query);

const getOne = async (workspaceId, id) => {
  const expense = await repo.findById(id, workspaceId);
  if (!expense) {
    const err = new Error('Expense not found');
    err.statusCode = 404;
    throw err;
  }
  return expense;
};

const create = async (workspaceId, userId, data) => {
  const expense = await repo.create(workspaceId, userId, data);
  notifier.emitToAdmins('EXPENSE_SUBMITTED', workspaceId, {
    sourceId: expense.id, sourceType: 'expense',
    title: 'New expense submitted',
    body: expense.description || 'An expense has been submitted.',
    actorId: userId,
  }).catch(() => {});
  return expense;
};

const update = async (workspaceId, userId, id, data) => {
  await getOne(workspaceId, id);
  return repo.update(id, userId, data);
};

const remove = async (workspaceId, userId, id) => {
  await getOne(workspaceId, id);
  return repo.softDelete(id, userId);
};

const duplicate = (workspaceId, userId, id) => repo.duplicate(id, workspaceId, userId);

const addAttachment = async (workspaceId, userId, expenseId, file) => {
  await getOne(workspaceId, expenseId);
  const fileData = {
    fileName:       file.originalname,
    storedFileName: file.filename,
    mimeType:       file.mimetype,
    fileSize:       file.size,
    storagePath:    file.path,
  };
  return repo.createAttachment(expenseId, workspaceId, userId, fileData);
};

const removeAttachment = async (workspaceId, id) => {
  const att = await repo.findAttachment(id, workspaceId);
  if (!att) {
    const err = new Error('Attachment not found');
    err.statusCode = 404;
    throw err;
  }
  if (att.storagePath && fs.existsSync(att.storagePath)) {
    fs.unlinkSync(att.storagePath);
  }
  return repo.deleteAttachment(id);
};

const getStats = (workspaceId) => repo.getStats(workspaceId);

const exportExpenses = async (workspaceId, filters) => {
  const items = await repo.listForExport(workspaceId, filters);
  return items;
};

module.exports = { list, getOne, create, update, remove, duplicate, addAttachment, removeAttachment, getStats, exportExpenses };
