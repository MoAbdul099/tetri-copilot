const repo = require('./recurring-expenses.repository');
const prisma = require('../../lib/prisma');

const list = (workspaceId) => repo.list(workspaceId);

const getOne = async (workspaceId, id) => {
  const r = await repo.findById(id, workspaceId);
  if (!r) { const e = new Error('Recurring expense not found'); e.statusCode = 404; throw e; }
  return r;
};

const create = (workspaceId, userId, data) => {
  const payload = {
    name:        data.name,
    description: data.description,
    amount:      parseFloat(data.amount),
    currencyCode: data.currencyCode || 'USD',
    expenseType: data.expenseType  || 'company',
    frequency:   data.frequency,
    nextRunDate: new Date(data.nextRunDate || data.startDate),
    endDate:     data.endDate     ? new Date(data.endDate)  : undefined,
    supplierId:  data.supplierId  || undefined,
    categoryId:  data.categoryId  || undefined,
    vendorName:  data.vendorName  || undefined,
    department:  data.department  || undefined,
    project:     data.project     || undefined,
    autoCreate:  data.autoCreate  !== false,
  };
  return repo.create(workspaceId, userId, payload);
};

const update = async (workspaceId, id, data) => {
  await getOne(workspaceId, id);
  const payload = {};
  const fields = ['name','description','amount','currencyCode','expenseType','frequency',
                   'supplierId','categoryId','vendorName','department','project','autoCreate','isActive'];
  fields.forEach(f => { if (data[f] !== undefined) payload[f] = data[f]; });
  if (data.amount)      payload.amount      = parseFloat(data.amount);
  if (data.nextRunDate) payload.nextRunDate = new Date(data.nextRunDate);
  if (data.endDate)     payload.endDate     = new Date(data.endDate);
  return repo.update(id, payload);
};

const remove = async (workspaceId, id) => {
  await getOne(workspaceId, id);
  return repo.remove(id);
};

const generate = async (workspaceId, userId, id) => {
  const template = await getOne(workspaceId, id);

  const settings = await prisma.companySettings.findUnique({ where: { workspaceId } });
  const prefix     = settings?.expensePrefix     || 'EXP';
  const nextNumber = settings?.nextExpenseNumber || 1;
  const expenseNumber = `${prefix}-${String(nextNumber).padStart(4, '0')}`;

  const expense = await prisma.expense.create({
    data: {
      workspaceId,
      expenseNumber,
      expenseType:  template.expenseType,
      categoryId:   template.categoryId   || undefined,
      supplierId:   template.supplierId   || undefined,
      vendorName:   template.vendorName   || undefined,
      description:  template.description,
      expenseDate:  new Date(),
      currencyCode: template.currencyCode,
      amount:       template.amount,
      department:   template.department   || undefined,
      project:      template.project      || undefined,
      status:       'draft',
      createdByUserId: userId,
    },
  });

  if (settings) {
    await prisma.companySettings.update({
      where: { workspaceId },
      data: { nextExpenseNumber: nextNumber + 1 },
    });
  }

  const today    = new Date();
  const nextDate = computeNextRunDate(template.frequency, today);
  await repo.createRun(template.id, workspaceId, expense.id, today);
  await repo.updateNextRun(template.id, nextDate, today);

  return expense;
};

function computeNextRunDate(frequency, from) {
  const d = new Date(from);
  if (frequency === 'weekly')      d.setDate(d.getDate() + 7);
  else if (frequency === 'monthly')     d.setMonth(d.getMonth() + 1);
  else if (frequency === 'quarterly')   d.setMonth(d.getMonth() + 3);
  else if (frequency === 'semi_annual') d.setMonth(d.getMonth() + 6);
  else if (frequency === 'annual')      d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

module.exports = { list, getOne, create, update, remove, generate };
