const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../../config/env');
const repo = require('./admin.auth.repository');

async function login({ email, password, ipAddress }) {
  const admin = await repo.findByEmail(email);
  if (!admin || admin.status !== 'active') {
    await repo.logActivity({ adminId: admin?.id ?? '00000000-0000-0000-0000-000000000000', action: 'login_failed', meta: { email }, ipAddress }).catch(() => {});
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    await repo.logActivity({ adminId: admin.id, action: 'login_failed', meta: { email }, ipAddress }).catch(() => {});
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  await repo.updateLastLogin(admin.id);
  await repo.logActivity({ adminId: admin.id, action: 'login', ipAddress });

  const token = jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role, type: 'admin' },
    env.ADMIN_JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, admin: safeAdmin(admin) };
}

async function getMe(adminId) {
  const admin = await repo.findById(adminId);
  if (!admin) throw Object.assign(new Error('Admin not found'), { status: 404 });
  return safeAdmin(admin);
}

async function logout({ adminId, ipAddress }) {
  await repo.logActivity({ adminId, action: 'logout', ipAddress }).catch(() => {});
}

function safeAdmin(admin) {
  const { passwordHash, ...rest } = admin;
  return rest;
}

module.exports = { login, getMe, logout };
