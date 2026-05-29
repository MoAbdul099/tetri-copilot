const prisma = require('../../../lib/prisma');

const SELECT = {
  id: true, code: true, name: true, symbol: true,
  decimalPrecision: true, roundingRule: true,
  isActive: true, isDefault: true, createdAt: true,
  _count: { select: { workspaces: true, defaultCountryProfiles: true } },
};

async function list({ search, isActive, page = 1, limit = 50 }) {
  const skip = (page - 1) * limit;
  const where = {};
  if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
  if (search) {
    where.OR = [
      { name:   { contains: search, mode: 'insensitive' } },
      { code:   { contains: search, mode: 'insensitive' } },
      { symbol: { contains: search, mode: 'insensitive' } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.currency.findMany({ where, select: SELECT, skip, take: limit, orderBy: { code: 'asc' } }),
    prisma.currency.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / limit), page };
}

async function findById(id) {
  return prisma.currency.findUnique({ where: { id }, select: SELECT });
}

const ALLOWED = ['code', 'name', 'symbol', 'decimalPrecision', 'roundingRule', 'isActive', 'isDefault'];

async function create(data) {
  const payload = {};
  for (const k of ALLOWED) if (data[k] !== undefined) payload[k] = data[k];
  if (payload.isDefault) await prisma.currency.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  return prisma.currency.create({ data: payload, select: SELECT });
}

async function update(id, data) {
  const payload = {};
  for (const k of ALLOWED) if (data[k] !== undefined) payload[k] = data[k];
  if (payload.isDefault) await prisma.currency.updateMany({ where: { isDefault: true, NOT: { id } }, data: { isDefault: false } });
  return prisma.currency.update({ where: { id }, data: payload, select: SELECT });
}

async function updateStatus(id, isActive) {
  return prisma.currency.update({ where: { id }, data: { isActive }, select: SELECT });
}

module.exports = { list, findById, create, update, updateStatus };
