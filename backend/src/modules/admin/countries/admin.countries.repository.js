const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const COUNTRY_LIST_SELECT = {
  id: true, countryCode: true, countryName: true, status: true,
  dateFormat: true, timezone: true, isActive: true,
  createdAt: true, updatedAt: true,
  defaultCurrency: { select: { id: true, code: true, name: true, symbol: true } },
  defaultLanguage: { select: { id: true, code: true, name: true } },
  _count: { select: { workspaces: true } },
};

const COUNTRY_DETAIL_SELECT = {
  id: true, countryCode: true, countryName: true, status: true,
  dateFormat: true, timezone: true, isActive: true, adminNotes: true,
  taxLabel: true, taxNumberLabel: true, defaultTaxRate: true,
  taxEnabled: true, taxReportingFrequency: true,
  fiscalYearStart: true, fiscalYearEnd: true, accountingPeriods: true,
  complianceEnabled: true, regulatoryFramework: true,
  filingFrequency: true, reminderDefaults: true,
  createdAt: true, updatedAt: true,
  defaultCurrency: { select: { id: true, code: true, name: true, symbol: true } },
  defaultLanguage: { select: { id: true, code: true, name: true } },
  languages: {
    select: {
      id: true, isDefault: true,
      language: { select: { id: true, code: true, name: true, nativeName: true } },
    },
  },
  holidays: { orderBy: { holidayDate: 'asc' }, select: { id: true, name: true, holidayDate: true, isRecurring: true, description: true } },
  _count: { select: { workspaces: true } },
};

async function list({ search, status, page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { countryName: { contains: search, mode: 'insensitive' } },
      { countryCode: { contains: search, mode: 'insensitive' } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.countryProfile.findMany({ where, select: COUNTRY_LIST_SELECT, skip, take: limit, orderBy: { countryName: 'asc' } }),
    prisma.countryProfile.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / limit), page };
}

async function findById(id) {
  return prisma.countryProfile.findUnique({ where: { id }, select: COUNTRY_DETAIL_SELECT });
}

const ALLOWED_FIELDS = [
  'countryName', 'countryCode', 'status', 'dateFormat', 'timezone',
  'defaultCurrencyId', 'defaultLanguageId', 'adminNotes',
  'taxLabel', 'taxNumberLabel', 'defaultTaxRate', 'taxEnabled', 'taxReportingFrequency',
  'fiscalYearStart', 'fiscalYearEnd', 'accountingPeriods',
  'complianceEnabled', 'regulatoryFramework', 'filingFrequency', 'reminderDefaults', 'isActive',
];

async function create(data) {
  const payload = {};
  for (const key of ALLOWED_FIELDS) {
    if (data[key] !== undefined) payload[key] = data[key];
  }
  return prisma.countryProfile.create({ data: payload, select: COUNTRY_DETAIL_SELECT });
}

async function update(id, data) {
  const payload = {};
  for (const key of ALLOWED_FIELDS) {
    if (data[key] !== undefined) payload[key] = data[key];
  }
  return prisma.countryProfile.update({ where: { id }, data: payload, select: COUNTRY_DETAIL_SELECT });
}

async function updateStatus(id, status) {
  const isActive = status === 'active';
  return prisma.countryProfile.update({ where: { id }, data: { status, isActive }, select: COUNTRY_DETAIL_SELECT });
}

async function clone(id, newCode, newName) {
  const src = await prisma.countryProfile.findUnique({ where: { id }, include: { holidays: true } });
  if (!src) return null;
  const { id: _id, countryCode: _code, countryName: _name, createdAt: _ca, updatedAt: _ua, holidays: srcHolidays, ...rest } = src;
  const cloned = await prisma.countryProfile.create({
    data: {
      ...rest,
      countryCode: newCode,
      countryName: newName,
      status: 'draft',
      isActive: false,
      holidays: {
        create: srcHolidays.map(({ id: _hid, countryProfileId: _cpid, createdAt: _hca, ...h }) => h),
      },
    },
    select: COUNTRY_DETAIL_SELECT,
  });
  return cloned;
}

async function addHoliday(countryProfileId, data) {
  return prisma.countryHoliday.create({
    data: {
      countryProfileId,
      name: data.name,
      holidayDate: new Date(data.holidayDate),
      isRecurring: data.isRecurring ?? true,
      description: data.description || null,
    },
  });
}

async function updateHoliday(holidayId, data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.holidayDate !== undefined) payload.holidayDate = new Date(data.holidayDate);
  if (data.isRecurring !== undefined) payload.isRecurring = data.isRecurring;
  if (data.description !== undefined) payload.description = data.description;
  return prisma.countryHoliday.update({ where: { id: holidayId }, data: payload });
}

async function deleteHoliday(holidayId) {
  return prisma.countryHoliday.delete({ where: { id: holidayId } });
}

async function getWorkspaces(countryProfileId) {
  return prisma.workspace.findMany({
    where: { countryProfileId },
    select: {
      id: true, name: true, status: true, createdAt: true,
      owner: { select: { id: true, fullName: true, email: true } },
      company: { select: { companyName: true } },
    },
    orderBy: { name: 'asc' },
    take: 50,
  });
}

module.exports = { list, findById, create, update, updateStatus, clone, addHoliday, updateHoliday, deleteHoliday, getWorkspaces };
