const prisma = require('../../lib/prisma');

const findByWorkspace = (workspaceId) =>
  prisma.companySettings.findUnique({ where: { workspaceId } });

const upsert = (workspaceId, data) =>
  prisma.companySettings.upsert({
    where: { workspaceId },
    create: { workspaceId, ...data },
    update: data,
  });

module.exports = { findByWorkspace, upsert };
