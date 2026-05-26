const prisma = require('../../lib/prisma');

// ── Groups ────────────────────────────────────────────────────────────────────

const listGroups = () =>
  prisma.aiPromptGroup.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { prompts: true } } } });

const createGroup = (data) =>
  prisma.aiPromptGroup.create({ data });

// ── Prompts ───────────────────────────────────────────────────────────────────

const listPrompts = ({ groupId, status, category } = {}) =>
  prisma.aiPrompt.findMany({
    where: {
      ...(groupId  ? { groupId }  : {}),
      ...(status   ? { status }   : {}),
      ...(category ? { category } : {}),
    },
    include: { group: true, _count: { select: { versions: true } } },
    orderBy: { updatedAt: 'desc' },
  });

const getPromptById = (id) =>
  prisma.aiPrompt.findUnique({
    where: { id },
    include: {
      group: true,
      versions: { orderBy: { versionNumber: 'desc' } },
    },
  });

const createPrompt = (data) =>
  prisma.aiPrompt.create({ data });

const updatePrompt = (id, data) =>
  prisma.aiPrompt.update({ where: { id }, data });

// ── Versions ──────────────────────────────────────────────────────────────────

const getVersions = (promptId) =>
  prisma.aiPromptVersion.findMany({ where: { promptId }, orderBy: { versionNumber: 'desc' } });

const getVersion = (id) =>
  prisma.aiPromptVersion.findUnique({ where: { id } });

const getNextVersionNumber = async (promptId) => {
  const latest = await prisma.aiPromptVersion.findFirst({ where: { promptId }, orderBy: { versionNumber: 'desc' } });
  return (latest?.versionNumber ?? 0) + 1;
};

const createVersion = async (promptId, { content, changeNotes, createdBy }) => {
  const versionNumber = await getNextVersionNumber(promptId);
  return prisma.aiPromptVersion.create({
    data: { promptId, versionNumber, content, changeNotes, createdBy, status: 'draft' },
  });
};

const updateVersionStatus = (id, status) =>
  prisma.aiPromptVersion.update({ where: { id }, data: { status } });

// ── Tests ─────────────────────────────────────────────────────────────────────

const createTest = (data) =>
  prisma.aiPromptTest.create({ data });

const listTests = (promptId) =>
  prisma.aiPromptTest.findMany({ where: { promptId }, orderBy: { createdAt: 'desc' }, take: 20 });

module.exports = {
  listGroups, createGroup,
  listPrompts, getPromptById, createPrompt, updatePrompt,
  getVersions, getVersion, createVersion, updateVersionStatus,
  createTest, listTests,
};
