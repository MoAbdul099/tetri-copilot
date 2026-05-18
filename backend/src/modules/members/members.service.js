const membersRepository = require('./members.repository');
const { logActivity, logAudit } = require('../../lib/activityLogger');
const { sendInvitationEmail } = require('../../lib/emailService');

const getMembers = (workspaceId) => membersRepository.listMembers(workspaceId);

const getInvitations = (workspaceId) => membersRepository.listInvitations(workspaceId);

const getMember = async (id, workspaceId) => {
  const member = await membersRepository.findMemberByIdWithUser(id, workspaceId);
  if (!member) {
    const err = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }
  return member;
};

const inviteUser = async (workspaceId, email, role, invitedByUserId) => {
  const existing = await membersRepository.findPendingInvitation(workspaceId, email);
  if (existing) {
    const err = new Error('An active invitation already exists for this email');
    err.statusCode = 409;
    throw err;
  }

  const invitation = await membersRepository.createInvitation(workspaceId, email, role, invitedByUserId);

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

const updateMemberStatus = async (id, workspaceId, status, requestingUserId) => {
  const member = await membersRepository.findMemberById(id, workspaceId);
  if (!member) {
    const err = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }

  if (member.userId === requestingUserId) {
    const err = new Error('Cannot change your own membership status');
    err.statusCode = 400;
    throw err;
  }

  if (member.role === 'owner' && status === 'inactive') {
    const ownerCount = await membersRepository.countOwners(workspaceId);
    if (ownerCount <= 1) {
      const err = new Error('Cannot deactivate the last owner');
      err.statusCode = 400;
      throw err;
    }
  }

  const updated = await membersRepository.updateMemberStatus(id, status);

  logActivity({
    workspaceId,
    userId: requestingUserId,
    action: status === 'active' ? 'member.activated' : 'member.inactivated',
    entityType: 'workspace_member',
    entityId: id,
    description: `Member ${status === 'active' ? 'activated' : 'inactivated'}`,
  });

  return updated;
};

const updateMemberRole = async (id, workspaceId, role, requestingUserId) => {
  const member = await membersRepository.findMemberById(id, workspaceId);
  if (!member) {
    const err = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }

  if (member.userId === requestingUserId) {
    const err = new Error('Cannot change your own role');
    err.statusCode = 400;
    throw err;
  }

  if (member.role === 'owner' && role !== 'owner') {
    const ownerCount = await membersRepository.countOwners(workspaceId);
    if (ownerCount <= 1) {
      const err = new Error('Cannot demote the last owner');
      err.statusCode = 400;
      throw err;
    }
  }

  const oldRole = member.role;
  const updated = await membersRepository.updateMemberRole(id, role);

  logActivity({
    workspaceId,
    userId: requestingUserId,
    action: 'member.role_updated',
    entityType: 'workspace_member',
    entityId: id,
    description: `Member role changed from ${oldRole} to ${role}`,
  });

  logAudit({
    workspaceId,
    adminUserId: requestingUserId,
    action: 'member.role_updated',
    entityType: 'workspace_member',
    entityId: id,
    oldValue: { role: oldRole },
    newValue: { role },
  });

  return updated;
};

const removeMember = async (id, workspaceId, requestingUserId) => {
  const member = await membersRepository.findMemberById(id, workspaceId);
  if (!member) {
    const err = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }

  if (member.userId === requestingUserId) {
    const err = new Error('Cannot remove yourself');
    err.statusCode = 400;
    throw err;
  }

  if (member.role === 'owner') {
    const ownerCount = await membersRepository.countOwners(workspaceId);
    if (ownerCount <= 1) {
      const err = new Error('Cannot remove the last owner');
      err.statusCode = 400;
      throw err;
    }
  }

  await membersRepository.deleteMember(id);

  logActivity({
    workspaceId,
    userId: requestingUserId,
    action: 'member.removed',
    entityType: 'workspace_member',
    entityId: id,
    description: `Member removed`,
  });

  logAudit({
    workspaceId,
    adminUserId: requestingUserId,
    action: 'member.removed',
    entityType: 'workspace_member',
    entityId: id,
    oldValue: { userId: member.userId, role: member.role, status: member.status },
    newValue: null,
  });
};

module.exports = { getMembers, getMember, getInvitations, inviteUser, updateMemberStatus, updateMemberRole, removeMember };
