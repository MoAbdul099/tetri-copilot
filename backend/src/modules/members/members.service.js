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

  return membersRepository.updateMemberStatus(id, status);
};

module.exports = { getMembers, getInvitations, inviteUser, updateMemberStatus };
