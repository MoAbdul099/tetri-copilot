const prisma = require('../../lib/prisma');

const SEED_FEATURES = [
  { featureCode: 'workspace_assistant',  featureName: 'Workspace Assistant',  description: 'General-purpose AI assistant for the workspace',    permissionScope: 'member',  beta: false },
  { featureCode: 'invoice_assistant',    featureName: 'Invoice Assistant',     description: 'AI-powered invoice creation and analysis',           permissionScope: 'member',  beta: true  },
  { featureCode: 'expense_assistant',    featureName: 'Expense Assistant',     description: 'AI-powered expense categorization and insights',     permissionScope: 'member',  beta: true  },
  { featureCode: 'compliance_assistant', featureName: 'Compliance Assistant',  description: 'AI guidance on compliance requirements and filings', permissionScope: 'member',  beta: true  },
  { featureCode: 'analytics_assistant',  featureName: 'Analytics Assistant',   description: 'AI-powered analytics interpretation and forecasting',permissionScope: 'member',  beta: true  },
  { featureCode: 'customer_assistant',   featureName: 'Customer Assistant',    description: 'AI assistance for customer communications',          permissionScope: 'member',  beta: true  },
  { featureCode: 'prompt_test',          featureName: 'Prompt Testing',        description: 'Internal prompt testing framework',                  permissionScope: 'admin',   beta: false },
];

async function seedFeatures() {
  for (const f of SEED_FEATURES) {
    await prisma.aiFeatureRegistry.upsert({
      where:  { featureCode: f.featureCode },
      update: { featureName: f.featureName, description: f.description },
      create: { ...f, enabled: true },
    });
  }
}

async function listFeatures() {
  return prisma.aiFeatureRegistry.findMany({
    orderBy: { featureName: 'asc' },
    include: { _count: { select: { flags: true } } },
  });
}

async function updateFeature(id, { enabled, beta, description, permissionScope }) {
  return prisma.aiFeatureRegistry.update({ where: { id }, data: { enabled, beta, description, permissionScope } });
}

async function getWorkspaceFlags(featureId) {
  return prisma.aiFeatureFlag.findMany({ where: { featureId } });
}

async function setWorkspaceFlag(featureId, workspaceId, enabled) {
  return prisma.aiFeatureFlag.upsert({
    where:  { featureId_workspaceId: { featureId, workspaceId } },
    update: { enabled },
    create: { featureId, workspaceId, enabled },
  });
}

async function isFeatureEnabled(featureCode, workspaceId) {
  const feature = await prisma.aiFeatureRegistry.findUnique({ where: { featureCode } });
  if (!feature || !feature.enabled) return false;
  const flag = await prisma.aiFeatureFlag.findUnique({
    where: { featureId_workspaceId: { featureId: feature.id, workspaceId } },
  });
  // If no workspace flag, use global enabled state
  return flag ? flag.enabled : feature.enabled;
}

module.exports = { seedFeatures, listFeatures, updateFeature, getWorkspaceFlags, setWorkspaceFlag, isFeatureEnabled };
