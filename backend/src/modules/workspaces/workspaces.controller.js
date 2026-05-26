const { getAuth } = require('../../middleware/requireAuth');
const workspacesService = require('./workspaces.service');
const { bootstrapSchema, patchWorkspaceSchema } = require('./workspaces.validation');
const { success } = require('../../utils/response');
const authRepository = require('../auth/auth.repository');
const prisma = require('../../lib/prisma');

const bootstrapWorkspace = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { name } = bootstrapSchema.parse(req.body);

    const data = await workspacesService.bootstrap({ clerkUserId: userId, name });
    const statusCode = data.alreadyExisted ? 200 : 201;

    return success(
      res,
      { workspace: data.workspace, membership: data.membership },
      data.alreadyExisted ? 'Workspace already exists' : 'Workspace created successfully',
      statusCode
    );
  } catch (err) {
    next(err);
  }
};

const getCurrentWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspacesService.getCurrent(req.workspaceId);
    return success(res, { workspace }, 'Workspace retrieved');
  } catch (err) {
    next(err);
  }
};

const updateCurrentWorkspace = async (req, res, next) => {
  try {
    const data = patchWorkspaceSchema.parse(req.body);
    const workspace = await workspacesService.updateCurrent(req.workspaceId, data);
    return success(res, { workspace }, 'Workspace updated');
  } catch (err) {
    next(err);
  }
};

const getMyWorkspaces = async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const user = await authRepository.getUserByClerkId(clerkUserId);
    if (!user) return res.status(401).json({ success: false, error: 'User not found', details: [] });

    const memberships = await authRepository.getWorkspaceMemberships(user.id);
    const workspaces  = await Promise.all(memberships.map(async (m) => {
      const company = await prisma.company.findUnique({
        where:  { workspaceId: m.workspace.id },
        select: { companyName: true },
      });
      return {
        id:           m.workspace.id,
        name:         m.workspace.name,
        role:         m.role,
        setupComplete: !!company,
        companyName:  company?.companyName || null,
      };
    }));

    return success(res, workspaces);
  } catch (err) {
    next(err);
  }
};

module.exports = { bootstrapWorkspace, getCurrentWorkspace, updateCurrentWorkspace, getMyWorkspaces };
