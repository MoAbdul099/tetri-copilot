const workspacesRepository = require('./workspaces.repository');
const authRepository = require('../auth/auth.repository');

const bootstrap = async ({ clerkUserId, name }) => {
  const user = await authRepository.getUserByClerkId(clerkUserId);
  if (!user) {
    const err = new Error('Local user record not found. Call GET /api/v1/auth/me first.');
    err.statusCode = 400;
    throw err;
  }

  const existing = await workspacesRepository.findUserWorkspace(user.id);
  if (existing) {
    return {
      workspace: existing.workspace,
      membership: { role: existing.role, status: existing.status },
      alreadyExisted: true,
    };
  }

  const { workspace, membership } = await workspacesRepository.createWorkspaceWithOwner({
    userId: user.id,
    name,
  });

  await authRepository.createActivityLog({
    workspaceId: workspace.id,
    userId: user.id,
    action: 'workspace.created',
    entityType: 'workspace',
    entityId: workspace.id,
    description: `Workspace "${workspace.name}" bootstrapped`,
  });

  return { workspace, membership, alreadyExisted: false };
};

const getCurrent = (workspaceId) => workspacesRepository.findWorkspaceById(workspaceId);

const updateCurrent = (workspaceId, data) =>
  workspacesRepository.updateWorkspace(workspaceId, data);

module.exports = { bootstrap, getCurrent, updateCurrent };
