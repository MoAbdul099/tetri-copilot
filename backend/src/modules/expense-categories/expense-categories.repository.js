const prisma = require('../../lib/prisma');

const DEFAULT_CATEGORIES = [
  { name: 'Office Expenses',       categoryCode: 'OFFICE',   description: 'General office supplies and expenses' },
  { name: 'Utilities',             categoryCode: 'UTIL',     description: 'Electricity, water, gas, internet' },
  { name: 'Rent & Lease',          categoryCode: 'RENT',     description: 'Office and equipment rent' },
  { name: 'Travel',                categoryCode: 'TRAVEL',   description: 'Business travel expenses' },
  { name: 'Transportation',        categoryCode: 'TRANS',    description: 'Local transportation and fuel' },
  { name: 'Accommodation',         categoryCode: 'ACCOM',    description: 'Hotels and lodging' },
  { name: 'Meals & Entertainment', categoryCode: 'MEALS',    description: 'Business meals and client entertainment' },
  { name: 'Marketing',             categoryCode: 'MKT',      description: 'Advertising and marketing expenses' },
  { name: 'Professional Services', categoryCode: 'PROF',     description: 'Legal, accounting, consulting fees' },
  { name: 'Insurance',             categoryCode: 'INS',      description: 'Business insurance premiums' },
  { name: 'Software & SaaS',       categoryCode: 'SW',       description: 'Software licenses and subscriptions' },
  { name: 'Subscriptions',         categoryCode: 'SUBS',     description: 'Recurring subscription costs' },
  { name: 'Banking Charges',       categoryCode: 'BANK',     description: 'Bank fees and charges' },
  { name: 'Maintenance',           categoryCode: 'MAINT',    description: 'Repairs and maintenance' },
  { name: 'Miscellaneous',         categoryCode: 'MISC',     description: 'Other uncategorized expenses' },
];

const list = async (workspaceId, { includeArchived = false, search } = {}) => {
  const where = {
    OR: [{ workspaceId }, { isSystemDefault: true, workspaceId: null }],
    ...(includeArchived ? {} : { isActive: true }),
  };

  if (search) {
    where.AND = [
      { OR: [{ name: { contains: search, mode: 'insensitive' } }, { categoryCode: { contains: search, mode: 'insensitive' } }] },
    ];
  }

  const items = await prisma.expenseCategory.findMany({
    where,
    include: { childCategories: { where: { isActive: true }, select: { id: true, name: true, categoryCode: true } } },
    orderBy: [{ parentCategoryId: 'asc' }, { name: 'asc' }],
  });

  return { items, total: items.length };
};

const findById = (id, workspaceId) =>
  prisma.expenseCategory.findFirst({
    where: { id, OR: [{ workspaceId }, { isSystemDefault: true }] },
  });

const create = (workspaceId, data) =>
  prisma.expenseCategory.create({ data: { ...data, workspaceId } });

const update = (id, data) =>
  prisma.expenseCategory.update({ where: { id }, data });

const archive = (id) =>
  prisma.expenseCategory.update({ where: { id }, data: { isActive: false } });

const restore = (id) =>
  prisma.expenseCategory.update({ where: { id }, data: { isActive: true } });

const seedDefaults = async (workspaceId) => {
  const existing = await prisma.expenseCategory.count({ where: { workspaceId } });
  if (existing > 0) return { seeded: 0, message: 'Categories already exist' };

  await prisma.expenseCategory.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, workspaceId, isSystemDefault: false })),
    skipDuplicates: true,
  });

  return { seeded: DEFAULT_CATEGORIES.length };
};

module.exports = { list, findById, create, update, archive, restore, seedDefaults };
