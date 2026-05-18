const repo = require('./invitations.repository');
const { logActivity } = require('../../lib/activityLogger');
const { sendInvitationEmail } = require('../../lib/emailService');

const listInvitations = (workspaceId) => repo.listPending(workspaceId);

const createInvitation = async (workspaceId, email, role, invitedByUserId) => {
  const existing = await repo.findPending(workspaceId, email);
  if (existing) {
    const err = new Error('An active invitation already exists for this email');
    err.statusCode = 409;
    throw err;
  }
  const invitation = await repo.create(workspaceId, email, role, invitedByUserId);

  sendInvitationEmail({
    email,
    inviterName: invitation.invitedByUser?.fullName,
    workspaceName: invitation.workspace?.name,
    role,
    token: invitation.invitationToken,
  }).catch(() => {});

  logActivity({
    workspaceId,
    userId: invitedByUserId,
    action: 'invitation.created',
    entityType: 'invitation',
    entityId: invitation.id,
    description: `Invited ${email} as ${role}`,
  });

  return invitation;
};

const cancelInvitation = async (id, workspaceId, requestingUserId) => {
  const inv = await repo.findById(id, workspaceId);
  if (!inv) {
    const err = new Error('Invitation not found');
    err.statusCode = 404;
    throw err;
  }
  await repo.cancel(id);

  logActivity({
    workspaceId,
    userId: requestingUserId,
    action: 'invitation.cancelled',
    entityType: 'invitation',
    entityId: id,
    description: `Cancelled invitation for ${inv.email}`,
  });
};

const resendInvitation = async (id, workspaceId, requestingUserId) => {
  const inv = await repo.findById(id, workspaceId);
  if (!inv) {
    const err = new Error('Invitation not found');
    err.statusCode = 404;
    throw err;
  }
  if (inv.acceptedAt) {
    const err = new Error('Invitation already accepted');
    err.statusCode = 400;
    throw err;
  }
  const updated = await repo.resetExpiry(id);

  sendInvitationEmail({
    email: inv.email,
    inviterName: updated.invitedByUser?.fullName,
    workspaceName: updated.workspace?.name,
    role: inv.role,
    token: updated.invitationToken,
  }).catch(() => {});

  logActivity({
    workspaceId,
    userId: requestingUserId,
    action: 'invitation.resent',
    entityType: 'invitation',
    entityId: id,
    description: `Resent invitation to ${inv.email}`,
  });

  return updated;
};

const acceptInvitation = async (token) => {
  const inv = await repo.findByToken(token);
  if (!inv) {
    const err = new Error('Invalid invitation token');
    err.statusCode = 404;
    throw err;
  }
  if (inv.acceptedAt) {
    const err = new Error('Invitation already accepted');
    err.statusCode = 400;
    throw err;
  }
  if (inv.expiresAt < new Date()) {
    const err = new Error('Invitation has expired');
    err.statusCode = 400;
    throw err;
  }

  // Find user by email — they must sign up first, then accept
  const user = await repo.findUserByEmail(inv.email);
  if (!user) {
    const err = new Error('Please sign up first, then use this invitation link');
    err.statusCode = 400;
    throw err;
  }

  const existing = await repo.findMembership(inv.workspaceId, user.id);
  if (existing) {
    const err = new Error('You are already a member of this workspace');
    err.statusCode = 409;
    throw err;
  }

  const [membership] = await Promise.all([
    repo.createMembership(inv.workspaceId, user.id, inv.role, inv.invitedByUserId),
    repo.accept(inv.id, new Date()),
  ]);

  logActivity({
    workspaceId: inv.workspaceId,
    userId: user.id,
    action: 'invitation.accepted',
    entityType: 'invitation',
    entityId: inv.id,
    description: `${user.email} accepted invitation as ${inv.role}`,
  });

  return { membership, workspaceId: inv.workspaceId };
};

module.exports = { listInvitations, createInvitation, cancelInvitation, resendInvitation, acceptInvitation };
