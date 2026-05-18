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

const findMemberByIdWithUser = (id, workspaceId) =>
  prisma.workspaceMember.findFirst({
    where: { id, workspaceId },
    include: { user: { select: { id: true, email: true, fullName: true, status: true } } },
  });

const updateMemberStatus = (id, status) =>
  prisma.workspaceMember.update({ where: { id }, data: { status } });

const updateMemberRole = (id, role) =>
  prisma.workspaceMember.update({ where: { id }, data: { role } });

const countOwners = (workspaceId) =>
  prisma.workspaceMember.count({ where: { workspaceId, role: 'owner', status: 'active' } });

const deleteMember = (id) =>
  prisma.workspaceMember.delete({ where: { id } });

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
    include: {
      workspace: { select: { name: true } },
      invitedByUser: { select: { id: true, fullName: true, email: true } },
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
  findMemberByIdWithUser,
  updateMemberStatus,
  updateMemberRole,
  countOwners,
  deleteMember,
  findPendingInvitation,
  createInvitation,
  listInvitations,
};
