const prisma = require('../../lib/prisma');

const CUSTOMER_INCLUDE = {
  createdByUser: { select: { id: true, fullName: true, email: true } },
  contacts: {
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  },
  tagAssignments: {
    include: { tag: true },
    orderBy: { createdAt: 'asc' },
  },
};

const CUSTOMER_LIST_INCLUDE = {
  contacts: {
    where: { isPrimary: true, isActive: true },
    take: 1,
  },
  tagAssignments: {
    include: { tag: { select: { id: true, name: true, color: true } } },
  },
};

// ── Customers ──────────────────────────────────────────────

const generateCustomerCode = async (workspaceId) => {
  const last = await prisma.customer.findFirst({
    where: { workspaceId, customerCode: { not: null } },
    orderBy: { customerCode: 'desc' },
    select: { customerCode: true },
  });

  let next = 1;
  if (last?.customerCode) {
    const num = parseInt(last.customerCode.replace(/\D/g, ''), 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `CUST-${String(next).padStart(4, '0')}`;
};

const listCustomers = async (workspaceId, { page = 1, limit = 20, search, status, customerType, country, tagIds, sortBy = 'name', sortOrder = 'asc' } = {}) => {
  const where = { workspaceId };

  if (status) where.status = status;
  else where.status = { not: 'archived' };

  if (customerType) where.customerType = customerType;
  if (country) where.country = { contains: country, mode: 'insensitive' };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { customerCode: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { taxNumber: { contains: search, mode: 'insensitive' } },
      { contacts: { some: { OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ] } } },
      { tagAssignments: { some: { tag: { name: { contains: search, mode: 'insensitive' } } } } },
    ];
  }

  if (tagIds?.length) {
    where.tagAssignments = { some: { tagId: { in: tagIds } } };
  }

  const orderField = ['name', 'customerCode', 'createdAt'].includes(sortBy) ? sortBy : 'name';
  const orderBy = { [orderField]: sortOrder === 'desc' ? 'desc' : 'asc' };

  const [total, items] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      include: CUSTOMER_LIST_INCLUDE,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

const findById = (id, workspaceId) =>
  prisma.customer.findFirst({
    where: { id, workspaceId },
    include: {
      ...CUSTOMER_INCLUDE,
      noteEntries: { orderBy: { createdAt: 'desc' }, include: { } },
      attachments: { orderBy: { createdAt: 'desc' } },
    },
  });

const findByIdSimple = (id, workspaceId) =>
  prisma.customer.findFirst({ where: { id, workspaceId } });

const create = async (workspaceId, data, userId) => {
  const customerCode = await generateCustomerCode(workspaceId);
  return prisma.customer.create({
    data: { ...data, workspaceId, customerCode, createdByUserId: userId, isActive: true },
    include: CUSTOMER_INCLUDE,
  });
};

const update = (id, workspaceId, data, userId) =>
  prisma.customer.update({
    where: { id },
    data: { ...data, updatedByUserId: userId },
    include: CUSTOMER_INCLUDE,
  });

const archive = (id, workspaceId, userId) =>
  prisma.customer.update({
    where: { id },
    data: { status: 'archived', isActive: false, archivedByUserId: userId, archivedAt: new Date() },
    include: CUSTOMER_INCLUDE,
  });

const restore = (id, workspaceId, userId) =>
  prisma.customer.update({
    where: { id },
    data: { status: 'active', isActive: true, archivedByUserId: null, archivedAt: null },
    include: CUSTOMER_INCLUDE,
  });

const listAll = (workspaceId) =>
  prisma.customer.findMany({
    where: { workspaceId },
    include: { contacts: { where: { isPrimary: true }, take: 1 }, tagAssignments: { include: { tag: true } } },
    orderBy: { name: 'asc' },
  });

// ── Contacts ───────────────────────────────────────────────

const listContacts = (customerId, workspaceId) =>
  prisma.customerContact.findMany({
    where: { customerId, workspaceId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });

const findContact = (id, workspaceId) =>
  prisma.customerContact.findFirst({ where: { id, workspaceId } });

const createContact = (customerId, workspaceId, data, userId) =>
  prisma.customerContact.create({
    data: { ...data, customerId, workspaceId, createdByUserId: userId },
  });

const updateContact = (id, data, userId) =>
  prisma.customerContact.update({ where: { id }, data: { ...data, updatedByUserId: userId } });

const setPrimaryContact = async (id, customerId, workspaceId) => {
  await prisma.customerContact.updateMany({
    where: { customerId, workspaceId, id: { not: id } },
    data: { isPrimary: false },
  });
  return prisma.customerContact.update({ where: { id }, data: { isPrimary: true } });
};

const deactivateContact = (id) =>
  prisma.customerContact.update({ where: { id }, data: { isActive: false, isPrimary: false } });

const reactivateContact = (id) =>
  prisma.customerContact.update({ where: { id }, data: { isActive: true } });

const deleteContact = (id) =>
  prisma.customerContact.delete({ where: { id } });

// ── Notes ──────────────────────────────────────────────────

const listNotes = (customerId, workspaceId) =>
  prisma.customerNote.findMany({
    where: { customerId, workspaceId },
    orderBy: { createdAt: 'desc' },
  });

const findNote = (id, workspaceId) =>
  prisma.customerNote.findFirst({ where: { id, workspaceId } });

const createNote = (customerId, workspaceId, noteText, userId) =>
  prisma.customerNote.create({ data: { customerId, workspaceId, noteText, createdByUserId: userId } });

const updateNote = (id, noteText, userId) =>
  prisma.customerNote.update({ where: { id }, data: { noteText, updatedByUserId: userId } });

const deleteNote = (id) =>
  prisma.customerNote.delete({ where: { id } });

// ── Attachments ────────────────────────────────────────────

const listAttachments = (customerId, workspaceId) =>
  prisma.customerAttachment.findMany({
    where: { customerId, workspaceId },
    orderBy: { createdAt: 'desc' },
  });

const findAttachment = (id, workspaceId) =>
  prisma.customerAttachment.findFirst({ where: { id, workspaceId } });

const createAttachment = (data) =>
  prisma.customerAttachment.create({ data });

const updateAttachment = (id, data) =>
  prisma.customerAttachment.update({ where: { id }, data });

const deleteAttachment = (id) =>
  prisma.customerAttachment.delete({ where: { id } });

// ── Tags ───────────────────────────────────────────────────

const listTags = (workspaceId) =>
  prisma.customerTag.findMany({
    where: { workspaceId },
    orderBy: { name: 'asc' },
  });

const findTag = (id, workspaceId) =>
  prisma.customerTag.findFirst({ where: { id, workspaceId } });

const findTagByName = (workspaceId, name) =>
  prisma.customerTag.findFirst({ where: { workspaceId, name: { equals: name, mode: 'insensitive' } } });

const createTag = (workspaceId, name, color, userId) =>
  prisma.customerTag.create({ data: { workspaceId, name, color, createdByUserId: userId } });

const updateTag = (id, data) =>
  prisma.customerTag.update({ where: { id }, data });

const deleteTag = (id) =>
  prisma.customerTag.delete({ where: { id } });

const assignTag = (customerId, workspaceId, tagId, userId) =>
  prisma.customerTagAssignment.create({ data: { customerId, workspaceId, tagId, createdByUserId: userId } });

const removeTag = (customerId, tagId) =>
  prisma.customerTagAssignment.deleteMany({ where: { customerId, tagId } });

const assignTagsBulk = (customerId, workspaceId, tagIds, userId) =>
  prisma.customerTagAssignment.createMany({
    data: tagIds.map((tagId) => ({ customerId, workspaceId, tagId, createdByUserId: userId })),
    skipDuplicates: true,
  });

module.exports = {
  generateCustomerCode,
  listCustomers,
  findById,
  findByIdSimple,
  create,
  update,
  archive,
  restore,
  listAll,
  listContacts,
  findContact,
  createContact,
  updateContact,
  setPrimaryContact,
  deactivateContact,
  reactivateContact,
  deleteContact,
  listNotes,
  findNote,
  createNote,
  updateNote,
  deleteNote,
  listAttachments,
  findAttachment,
  createAttachment,
  updateAttachment,
  deleteAttachment,
  listTags,
  findTag,
  findTagByName,
  createTag,
  updateTag,
  deleteTag,
  assignTag,
  removeTag,
  assignTagsBulk,
};
