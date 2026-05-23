const prisma = require('../../lib/prisma');

const COMPANY_INCLUDE = {
  jurisdiction: { select: { id: true, countryCode: true, countryName: true } },
};

const findByWorkspace = (workspaceId) =>
  prisma.company.findUnique({
    where: { workspaceId },
    include: COMPANY_INCLUDE,
  });

const upsert = (workspaceId, data) => {
  const payload = { ...data };
  // Convert tradeLicenseExpiry string to Date if provided
  if (payload.tradeLicenseExpiry) {
    payload.tradeLicenseExpiry = new Date(payload.tradeLicenseExpiry);
  }
  return prisma.company.upsert({
    where: { workspaceId },
    create: { workspaceId, ...payload },
    update: payload,
    include: COMPANY_INCLUDE,
  });
};

module.exports = { findByWorkspace, upsert };
