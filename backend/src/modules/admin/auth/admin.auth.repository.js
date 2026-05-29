const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findByEmail(email) {
  return prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
}

async function findById(id) {
  return prisma.adminUser.findUnique({ where: { id } });
}

async function updateLastLogin(id) {
  return prisma.adminUser.update({ where: { id }, data: { lastLoginAt: new Date() } });
}

async function logActivity({ adminId, action, entityType, entityId, meta, ipAddress }) {
  return prisma.adminActivityLog.create({
    data: { adminId, action, entityType, entityId, meta, ipAddress },
  });
}

module.exports = { findByEmail, findById, updateLastLogin, logActivity };
