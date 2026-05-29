/**
 * Seed initial platform admin user.
 * Run: node src/modules/admin/admin.seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    || 'admin@tetrisuite.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@2026!';
const ADMIN_FIRST    = process.env.SEED_ADMIN_FIRST    || 'Platform';
const ADMIN_LAST     = process.env.SEED_ADMIN_LAST     || 'Admin';

async function main() {
  const existing = await prisma.adminUser.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log(`Admin ${ADMIN_EMAIL} already exists — skipping.`);
    return;
  }
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.adminUser.create({
    data: { email: ADMIN_EMAIL, passwordHash, firstName: ADMIN_FIRST, lastName: ADMIN_LAST, role: 'superadmin', status: 'active' },
  });
  console.log(`Created admin: ${admin.email} (id: ${admin.id})`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
