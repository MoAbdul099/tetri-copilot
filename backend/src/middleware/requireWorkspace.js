const prisma  = require('../lib/prisma');
const authRepository = require('../modules/auth/auth.repository');

const requireWorkspace = async (req, res, next) => {
  try {
    const { userId: clerkUserId } = req.auth || {};
    if (!clerkUserId) {
      return res.status(401).json({ success: false, error: 'Unauthorized', details: [] });
    }

    const user = await authRepository.getUserByClerkId(clerkUserId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found', details: [] });
    }

    const requestedWsId = req.headers['x-workspace-id'] || null;

    let membership;
    if (requestedWsId) {
      // Validate the user is actually a member of the requested workspace
      membership = await prisma.workspaceMember.findFirst({
        where: { workspaceId: requestedWsId, userId: user.id, status: 'active' },
        include: { workspace: true },
      });
      if (!membership) {
        return res.status(403).json({ success: false, error: 'Access to this workspace is not permitted', details: [] });
      }
    } else {
      // Fall back to first membership (single-workspace users, backward compat)
      membership = await authRepository.getWorkspaceMembership(user.id);
      if (!membership) {
        return res.status(403).json({ success: false, error: 'No workspace membership found', details: [] });
      }
    }

    req.user        = user;
    req.workspaceId = membership.workspace.id;
    req.role        = membership.role;
    req.workspaceMember = membership;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireWorkspace;
