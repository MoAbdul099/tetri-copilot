const prisma = require('../../lib/prisma');
const crypto = require('crypto');

const EXPIRY_DAYS = 7;

const findPending = (workspaceId, email) =>
  prisma.invitation.findFirst({
    where: { workspaceId, email, acceptedAt: null, expiresAt: { gt: new Date() } },
  });

const findById = (id, workspaceId) =>
  prisma.invitation.findFirst({ where: { id, workspaceId } });

const findByToken = (token) =>
  prisma.invitation.findUnique({ where: { invitationToken: token } });

const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

const listPending = (workspaceId) =>
  prisma.invitation.findMany({
    where: { workspaceId, acceptedAt: null },
    include: {
      invitedByUser: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

const create = (workspaceId, email, role, invitedByUserId) =>
  prisma.invitation.create({
    data: {
      workspaceId,
      email,
      role,
      invitedByUserId,
      invitationToken: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

const cancel = (id) =>
  prisma.invitation.delete({ where: { id } });

const resetExpiry = (id) =>
  prisma.invitation.update({
    where: { id },
    data: {
      invitationToken: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });

const accept = (id, acceptedAt) =>
  prisma.invitation.update({ where: { id }, data: { acceptedAt } });

const findMembership = (workspaceId, userId) =>
  prisma.workspaceMember.findFirst({ where: { workspaceId, userId } });

const createMembership = (workspaceId, userId, role, invitedByUserId) =>
  prisma.workspaceMember.create({
    data: { workspaceId, userId, role, invitedByUserId, joinedAt: new Date() },
  });

module.exports = {
  findPending,
  findById,
  findByToken,
  findUserByEmail,
  listPending,
  create,
  cancel,
  resetExpiry,
  accept,
  findMembership,
  createMembership,
};
