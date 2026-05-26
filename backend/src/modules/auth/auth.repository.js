const prisma = require('../../lib/prisma');

const getUserByClerkId = (clerkUserId) =>
  prisma.user.findUnique({ where: { clerkUserId } });

const upsertUser = ({ clerkUserId, email, fullName }) =>
  prisma.user.upsert({
    where: { clerkUserId },
    create: { clerkUserId, email, fullName, status: 'active', lastLoginAt: new Date() },
    update: { email, fullName, lastLoginAt: new Date() },
  });

const getWorkspaceMembership = (userId) =>
  prisma.workspaceMember.findFirst({
    where: { userId, status: 'active' },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });

const getWorkspaceMemberships = (userId) =>
  prisma.workspaceMember.findMany({
    where: { userId, status: 'active' },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });

const createActivityLog = (data) =>
  prisma.activityLog.create({ data });

module.exports = { getUserByClerkId, upsertUser, getWorkspaceMembership, getWorkspaceMemberships, createActivityLog };
