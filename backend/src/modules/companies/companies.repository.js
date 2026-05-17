const prisma = require('../../lib/prisma');

const findByWorkspace = (workspaceId) =>
  prisma.company.findUnique({ where: { workspaceId } });

const upsert = (workspaceId, data) =>
  prisma.company.upsert({
    where: { workspaceId },
    create: { workspaceId, ...data },
    update: data,
  });

module.exports = { findByWorkspace, upsert };
