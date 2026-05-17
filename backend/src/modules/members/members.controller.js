const membersService = require('./members.service');
const { inviteSchema, updateStatusSchema } = require('./members.validation');
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

module.exports = { getMembers, inviteUser, updateMemberStatus };
