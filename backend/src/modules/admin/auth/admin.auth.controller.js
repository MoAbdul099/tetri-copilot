const service = require('./admin.auth.service');

const ip = (req) =>
  req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required', details: [] });
    }
    const result = await service.login({ email, password, ipAddress: ip(req) });
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message, details: [] });
  }
}

async function me(req, res) {
  try {
    const admin = await service.getMe(req.adminUser.sub);
    return res.json({ success: true, data: admin });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message, details: [] });
  }
}

async function logout(req, res) {
  try {
    await service.logout({ adminId: req.adminUser.sub, ipAddress: ip(req) });
    return res.json({ success: true, data: null, message: 'Logged out' });
  } catch {
    return res.json({ success: true, data: null, message: 'Logged out' });
  }
}

module.exports = { login, me, logout };
