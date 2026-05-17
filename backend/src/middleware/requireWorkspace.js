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

    const membership = await authRepository.getWorkspaceMembership(user.id);
    if (!membership) {
      return res.status(403).json({ success: false, error: 'No workspace membership found', details: [] });
    }

    req.user = user;
    req.workspaceId = membership.workspace.id;
    req.role = membership.role;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireWorkspace;
