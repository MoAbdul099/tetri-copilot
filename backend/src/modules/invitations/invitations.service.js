const repo = require('./invitations.repository');

const listInvitations = (workspaceId) => repo.listPending(workspaceId);

const createInvitation = async (workspaceId, email, role, invitedByUserId) => {
  const existing = await repo.findPending(workspaceId, email);
  if (existing) {
    const err = new Error('An active invitation already exists for this email');
    err.statusCode = 409;
    throw err;
  }
  return repo.create(workspaceId, email, role, invitedByUserId);
};

const cancelInvitation = async (id, workspaceId) => {
  const inv = await repo.findById(id, workspaceId);
  if (!inv) {
    const err = new Error('Invitation not found');
    err.statusCode = 404;
    throw err;
  }
  return repo.cancel(id);
};

const resendInvitation = async (id, workspaceId) => {
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
  return repo.resetExpiry(id);
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
  let user = await repo.findUserByEmail(inv.email);
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

  return { membership, workspaceId: inv.workspaceId };
};

module.exports = { listInvitations, createInvitation, cancelInvitation, resendInvitation, acceptInvitation };
