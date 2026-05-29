const prisma = require('../../../lib/prisma');

const SELECT = {
  id: true, code: true, name: true, nativeName: true,
  isActive: true, isDefault: true, createdAt: true,
  _count: { select: { workspaces: true, countryProfileLanguages: true } },
};

async function list({ search, isActive, page = 1, limit = 50 }) {
  const skip = (page - 1) * limit;
  const where = {};
  if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
  if (search) {
    where.OR = [
      { name:       { contains: search, mode: 'insensitive' } },
      { nativeName: { contains: search, mode: 'insensitive' } },
      { code:       { contains: search, mode: 'insensitive' } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.language.findMany({ where, select: SELECT, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.language.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / limit), page };
}

async function findById(id) {
  return prisma.language.findUnique({ where: { id }, select: SELECT });
}

const ALLOWED = ['code', 'name', 'nativeName', 'isActive', 'isDefault'];

async function create(data) {
  const payload = {};
  for (const k of ALLOWED) if (data[k] !== undefined) payload[k] = data[k];
  if (payload.isDefault) await prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  return prisma.language.create({ data: payload, select: SELECT });
}

async function update(id, data) {
  const payload = {};
  for (const k of ALLOWED) if (data[k] !== undefined) payload[k] = data[k];
  if (payload.isDefault) await prisma.language.updateMany({ where: { isDefault: true, NOT: { id } }, data: { isDefault: false } });
  return prisma.language.update({ where: { id }, data: payload, select: SELECT });
}

async function updateStatus(id, isActive) {
  return prisma.language.update({ where: { id }, data: { isActive }, select: SELECT });
}

module.exports = { list, findById, create, update, updateStatus };
