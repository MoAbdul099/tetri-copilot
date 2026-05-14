const { getAuth } = require('../../middleware/requireAuth');
const authService = require('./auth.service');
const { success } = require('../../utils/response');

const getMe = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const data = await authService.syncAndGetMe({
      clerkUserId: userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return success(res, data, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe };
