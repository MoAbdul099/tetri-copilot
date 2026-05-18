const service = require('./invitations.service');
const { createSchema, acceptSchema } = require('./invitations.validation');
const { success } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const invitations = await service.listInvitations(req.workspaceId);
    return success(res, { invitations }, 'Invitations retrieved');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { email, role } = createSchema.parse(req.body);
    const invitation = await service.createInvitation(req.workspaceId, email, role, req.user.id);
    return success(res, { invitation }, 'Invitation created', 201);
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    await service.cancelInvitation(req.params.id, req.workspaceId, req.user.id);
    return success(res, {}, 'Invitation cancelled');
  } catch (err) {
    next(err);
  }
};

const resend = async (req, res, next) => {
  try {
    const invitation = await service.resendInvitation(req.params.id, req.workspaceId, req.user.id);
    return success(res, { invitation }, 'Invitation resent');
  } catch (err) {
    next(err);
  }
};

const accept = async (req, res, next) => {
  try {
    const { token } = acceptSchema.parse(req.body);
    const result = await service.acceptInvitation(token);
    return success(res, result, 'Invitation accepted');
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, cancel, resend, accept };
