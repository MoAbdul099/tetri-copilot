const { clerkClient } = require('../../middleware/requireAuth');
const authRepository = require('./auth.repository');
const prisma = require('../../lib/prisma');

const syncAndGetMe = async ({ clerkUserId, ipAddress, userAgent }) => {
  // Check if user already exists in local DB
  let localUser = await authRepository.getUserByClerkId(clerkUserId);

  if (!localUser) {
    // New user — fetch profile from Clerk to seed local record
    let email = '';
    let fullName = null;
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      );
      email    = primaryEmail?.emailAddress || '';
      fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
    } catch (err) {
      // Clerk API call failed — create user with no email/name; can be updated later
      console.error('[auth.service] Clerk API error on new user lookup:', err?.message);
    }

    localUser = await authRepository.upsertUser({ clerkUserId, email, fullName });

    await authRepository.createActivityLog({
      userId:      localUser.id,
      action:      'user.signup',
      entityType:  'user',
      entityId:    localUser.id,
      description: 'User signed up via Clerk',
      ipAddress:   ipAddress || null,
      userAgent:   userAgent || null,
    });
  } else {
    // Existing user — record the login without calling Clerk's REST API
    await authRepository.createActivityLog({
      userId:      localUser.id,
      action:      'user.login',
      entityType:  'user',
      entityId:    localUser.id,
      description: 'User logged in via Clerk',
      ipAddress:   ipAddress || null,
      userAgent:   userAgent || null,
    });
  }

  const memberships = await authRepository.getWorkspaceMemberships(localUser.id);

  const workspaces = await Promise.all(memberships.map(async (m) => {
    const company = await prisma.company.findUnique({
      where:  { workspaceId: m.workspace.id },
      select: { id: true, companyName: true },
    });
    return {
      id:           m.workspace.id,
      name:         m.workspace.name,
      role:         m.role,
      setupComplete: !!company,
      companyName:  company?.companyName || null,
    };
  }));

  const workspace = workspaces[0] || null;

  return {
    user: {
      id:              localUser.id,
      email:           localUser.email,
      fullName:        localUser.fullName,
      status:          localUser.status,
      isPlatformAdmin: localUser.isPlatformAdmin,
    },
    workspaces,
    workspace,
  };
};

module.exports = { syncAndGetMe };
