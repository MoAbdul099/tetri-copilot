const membersService = require('./members.service');
const { inviteSchema, updateStatusSchema, updateRoleSchema } = require('./members.validation');
const { success } = require('../../utils/response');

const getMembers = async (req, res, next) => {
  try {
    const [members, invitations] = await Promise.all([
      membersService.getMembers(req.workspaceId),
      membersService.getInvitations(req.workspaceId),
    ]);
    return success(res, { members, invitations }, 'Members retrieved');
  } catch (err) {
    next(err);
  }
};

const getMember = async (req, res, next) => {
  try {
    const member = await membersService.getMember(req.params.id, req.workspaceId);
    return success(res, { member }, 'Member retrieved');
  } catch (err) {
    next(err);
  }
};

const inviteUser = async (req, res, next) => {
  try {
    const { email, role } = inviteSchema.parse(req.body);
    const invitation = await membersService.inviteUser(
      req.workspaceId,
      email,
      role,
      req.user.id
    );
    return success(res, { invitation }, 'Invitation created', 201);
  } catch (err) {
    next(err);
  }
};

const updateMemberStatus = async (req, res, next) => {
  try {
    const { status } = updateStatusSchema.parse(req.body);
    const member = await membersService.updateMemberStatus(
      req.params.id,
      req.workspaceId,
      status,
      req.user.id
    );
    return success(res, { member }, 'Member status updated');
  } catch (err) {
    next(err);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = updateRoleSchema.parse(req.body);
    const member = await membersService.updateMemberRole(
      req.params.id,
      req.workspaceId,
      role,
      req.user.id
    );
    return success(res, { member }, 'Member role updated');
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await membersService.removeMember(req.params.id, req.workspaceId, req.user.id);
    return success(res, {}, 'Member removed');
  } catch (err) {
    next(err);
  }
};

module.exports = { getMembers, getMember, inviteUser, updateMemberStatus, updateMemberRole, removeMember };
