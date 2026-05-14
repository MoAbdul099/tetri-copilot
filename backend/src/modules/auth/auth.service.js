const { clerkClient } = require('../../middleware/requireAuth');
const authRepository = require('./auth.repository');

const syncAndGetMe = async ({ clerkUserId, ipAddress, userAgent }) => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  );
  const email = primaryEmail?.emailAddress || '';
  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;

  const isNewUser = !(await authRepository.getUserByClerkId(clerkUserId));
  const user = await authRepository.upsertUser({ clerkUserId, email, fullName });

  await authRepository.createActivityLog({
    userId: user.id,
    action: isNewUser ? 'user.signup' : 'user.login',
    entityType: 'user',
    entityId: user.id,
    description: isNewUser ? 'User signed up via Clerk' : 'User logged in via Clerk',
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });

  const membership = await authRepository.getWorkspaceMembership(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      isPlatformAdmin: user.isPlatformAdmin,
    },
    workspace: membership
      ? {
          id: membership.workspace.id,
          name: membership.workspace.name,
          role: membership.role,
        }
      : null,
  };
};

module.exports = { syncAndGetMe };
