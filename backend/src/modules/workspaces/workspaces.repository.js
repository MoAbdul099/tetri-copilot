const prisma = require('../../lib/prisma');

const findUserWorkspace = (userId) =>
  prisma.workspaceMember.findFirst({
    where: { userId, status: 'active' },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });

const createWorkspaceWithOwner = ({ userId, name }) =>
  prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name, ownerUserId: userId, status: 'active' },
    });

    const membership = await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: 'owner',
        status: 'active',
        joinedAt: new Date(),
      },
    });

    return { workspace, membership };
  });

const findWorkspaceById = (id) =>
  prisma.workspace.findUnique({
    where: { id },
    include: {
      countryProfile: true,
      defaultCurrency: true,
      defaultLanguage: true,
    },
  });

const updateWorkspace = (id, data) =>
  prisma.workspace.update({
    where: { id },
    data,
    include: {
      countryProfile: true,
      defaultCurrency: true,
      defaultLanguage: true,
    },
  });

module.exports = {
  findUserWorkspace,
  createWorkspaceWithOwner,
  findWorkspaceById,
  updateWorkspace,
};
