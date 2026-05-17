const membersRepository = require('./members.repository');

const getMembers = (workspaceId) => membersRepository.listMembers(workspaceId);

const getInvitations = (workspaceId) => membersRepository.listInvitations(workspaceId);

const inviteUser = async (workspaceId, email, role, invitedByUserId) => {
  const existing = await membersRepository.findPendingInvitation(workspaceId, email);
  if (existing) {
    const err = new Error('An active invitation already exists for this email');
    err.statusCode = 409;
    throw err;
  }

  return membersRepository.createInvitation(workspaceId, email, role, invitedByUserId);
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

  return membersRepository.updateMemberStatus(id, status);
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

  return membersRepository.updateMemberRole(id, role);
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

  return membersRepository.deleteMember(id);
};

module.exports = { getMembers, getInvitations, inviteUser, updateMemberStatus, updateMemberRole, removeMember };
