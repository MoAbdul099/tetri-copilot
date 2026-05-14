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

module.exports = { findUserWorkspace, createWorkspaceWithOwner };
