const prisma = require('../../lib/prisma');
const crypto = require('crypto');

const listMembers = (workspaceId) =>
  prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: { id: true, email: true, fullName: true, status: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

const findMemberById = (id, workspaceId) =>
  prisma.workspaceMember.findFirst({ where: { id, workspaceId } });

const updateMemberStatus = (id, status) =>
  prisma.workspaceMember.update({ where: { id }, data: { status } });

const findPendingInvitation = (workspaceId, email) =>
  prisma.invitation.findFirst({
    where: {
      workspaceId,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

const createInvitation = (workspaceId, email, role, invitedByUserId) =>
  prisma.invitation.create({
    data: {
      workspaceId,
      email,
      role,
      invitedByUserId,
      invitationToken: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

const listInvitations = (workspaceId) =>
  prisma.invitation.findMany({
    where: { workspaceId, acceptedAt: null },
    orderBy: { createdAt: 'desc' },
  });

module.exports = {
  listMembers,
  findMemberById,
  updateMemberStatus,
  findPendingInvitation,
  createInvitation,
  listInvitations,
};
