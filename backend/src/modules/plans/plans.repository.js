const prisma = require('../../lib/prisma');

const listPublicPlans = () =>
  prisma.plan.findMany({
    where: { isPublic: true, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

const findByCode = (code) =>
  prisma.plan.findFirst({ where: { code, isActive: true } });

const findById = (id) =>
  prisma.plan.findUnique({ where: { id } });

module.exports = { listPublicPlans, findByCode, findById };
