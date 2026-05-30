const prisma = require('../../../lib/prisma');
const settingsCache = require('../../../lib/settingsCache');

// ── Default seeds ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = [
  // General
  { key: 'platform_name',     category: 'general',      value: 'Tetri Copilot',          description: 'Platform display name' },
  { key: 'platform_url',      category: 'general',      value: 'https://app.tetri.co',   description: 'Platform URL' },
  { key: 'support_email',     category: 'general',      value: 'support@tetri.co',       description: 'Support email address' },
  { key: 'support_website',   category: 'general',      value: 'https://tetri.co',       description: 'Support website URL' },
  { key: 'contact_info',      category: 'general',      value: '',                       description: 'Contact information' },
  // Branding
  { key: 'logo_url',          category: 'branding',     value: '/logo.svg',              description: 'Platform logo URL' },
  { key: 'favicon_url',       category: 'branding',     value: '/favicon.ico',           description: 'Favicon URL' },
  { key: 'primary_color',     category: 'branding',     value: '#2563eb',                description: 'Primary brand color (hex)' },
  { key: 'footer_content',    category: 'branding',     value: '© 2026 Tetri Copilot',  description: 'Footer text' },
  // Security
  { key: 'session_timeout',   category: 'security',     value: 60,                       description: 'Session timeout in minutes' },
  { key: 'min_password_len',  category: 'security',     value: 8,                        description: 'Minimum password length' },
  { key: 'require_mfa',       category: 'security',     value: false,                    description: 'Require MFA for all users' },
  { key: 'max_login_attempts',category: 'security',     value: 5,                        description: 'Max failed login attempts before lockout' },
  { key: 'lockout_duration',  category: 'security',     value: 15,                       description: 'Account lockout duration in minutes' },
  // Notifications
  { key: 'inapp_enabled',     category: 'notifications',value: true,                     description: 'Enable in-app notifications' },
  { key: 'email_enabled',     category: 'notifications',value: true,                     description: 'Enable email notifications' },
  { key: 'sms_enabled',       category: 'notifications',value: false,                    description: 'Enable SMS notifications (future)' },
  { key: 'reminder_days',     category: 'notifications',value: 3,                        description: 'Default reminder days before due date' },
  { key: 'escalation_days',   category: 'notifications',value: 2,                        description: 'Default escalation days after due date' },
  // AI
  { key: 'ai_default_provider',  category: 'ai',        value: 'gemini',                 description: 'Default AI provider' },
  { key: 'ai_default_model',     category: 'ai',        value: 'gemini-1.5-flash',       description: 'Default AI model' },
  { key: 'ai_max_requests_day',  category: 'ai',        value: 1000,                     description: 'Max AI requests per workspace per day' },
  { key: 'ai_max_cost_month',    category: 'ai',        value: 50,                       description: 'Max AI cost per workspace per month (USD)' },
  // Compliance
  { key: 'compliance_reminder_days',   category: 'compliance', value: 7,  description: 'Days before deadline to send compliance reminder' },
  { key: 'compliance_escalation_days', category: 'compliance', value: 3,  description: 'Days after deadline to escalate' },
  // Storage
  { key: 'max_file_size_mb',    category: 'storage',    value: 25,                       description: 'Max file upload size in MB' },
  { key: 'allowed_file_types',  category: 'storage',    value: 'pdf,docx,xlsx,csv,jpg,png,jpeg', description: 'Comma-separated allowed file extensions' },
  { key: 'retention_days',      category: 'storage',    value: 365,                      description: 'Default file retention period in days' },
  // Maintenance
  { key: 'maintenance_mode',    category: 'maintenance', value: false,                   description: 'Enable maintenance mode' },
  { key: 'maintenance_message', category: 'maintenance', value: 'We are performing scheduled maintenance. Please check back shortly.', description: 'Maintenance mode message' },
];

const DEFAULT_FLAGS = [
  { name: 'ai_copilot',               enabled: true,  rolloutPercentage: 100, isBeta: false, description: 'AI Copilot chat assistant' },
  { name: 'ai_expense_categorization',enabled: true,  rolloutPercentage: 100, isBeta: false, description: 'AI-powered expense categorization' },
  { name: 'ai_document_generation',   enabled: true,  rolloutPercentage: 100, isBeta: false, description: 'AI document generation wizard' },
  { name: 'compliance_assistant',     enabled: true,  rolloutPercentage: 100, isBeta: false, description: 'AI compliance assistant' },
  { name: 'billing_portal',           enabled: true,  rolloutPercentage: 100, isBeta: false, description: 'Billing and subscription management' },
  { name: 'beta_analytics',           enabled: false, rolloutPercentage: 20,  isBeta: true,  description: 'Advanced analytics dashboard (beta)' },
  { name: 'smart_forecasting',        enabled: false, rolloutPercentage: 10,  isBeta: true,  description: 'AI-powered financial forecasting (beta)' },
  { name: 'multi_currency',           enabled: true,  rolloutPercentage: 100, isBeta: false, description: 'Multi-currency support' },
];

async function seedDefaults() {
  for (const s of DEFAULT_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: s,
      update: {},
    });
  }
  for (const f of DEFAULT_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { name: f.name },
      create: f,
      update: {},
    });
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

async function getAll() {
  await seedDefaults();
  const settings = await prisma.systemSetting.findMany({ orderBy: [{ category: 'asc' }, { key: 'asc' }] });
  const grouped = {};
  for (const s of settings) {
    if (!grouped[s.category]) grouped[s.category] = {};
    grouped[s.category][s.key] = s.value;
  }
  return { settings, grouped };
}

async function getByCategory(category) {
  await seedDefaults();
  return prisma.systemSetting.findMany({ where: { category }, orderBy: { key: 'asc' } });
}

async function upsertMany(updates, modifiedBy) {
  const results = [];
  for (const { key, value } of updates) {
    const existing = await prisma.systemSetting.findUnique({ where: { key } });
    if (existing) {
      await prisma.settingsHistory.create({
        data: {
          settingKey:    key,
          previousValue: existing.value,
          newValue:      value,
          modifiedBy,
        },
      });
    }
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value, lastModifiedBy: modifiedBy, lastModifiedAt: new Date() },
      create: { key, value, category: 'general', lastModifiedBy: modifiedBy },
    });
    results.push(setting);
  }
  settingsCache.invalidate();
  return results;
}

// ── Feature Flags ─────────────────────────────────────────────────────────────

async function listFlags() {
  await seedDefaults();
  return prisma.featureFlag.findMany({ orderBy: { name: 'asc' } });
}

async function upsertFlag({ name, enabled, rolloutPercentage, description, isBeta }, modifiedBy) {
  settingsCache.invalidate();
  return prisma.featureFlag.upsert({
    where: { name },
    update: { enabled, rolloutPercentage, description, isBeta, lastModifiedBy: modifiedBy, lastModifiedAt: new Date() },
    create: { name, enabled, rolloutPercentage: rolloutPercentage ?? 100, description, isBeta: isBeta ?? false, lastModifiedBy: modifiedBy },
  });
}

// ── History ───────────────────────────────────────────────────────────────────

async function getHistory({ page = 1, limit = 25, key } = {}) {
  const where = key ? { settingKey: key } : {};
  const [total, items] = await Promise.all([
    prisma.settingsHistory.count({ where }),
    prisma.settingsHistory.findMany({
      where,
      orderBy: { modifiedAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
}

// ── Maintenance shortcut ──────────────────────────────────────────────────────

async function setMaintenance({ enabled, message }, modifiedBy) {
  return upsertMany([
    { key: 'maintenance_mode',    value: enabled },
    { key: 'maintenance_message', value: message ?? 'Scheduled maintenance in progress.' },
  ], modifiedBy);
}

module.exports = { getAll, getByCategory, upsertMany, listFlags, upsertFlag, getHistory, setMaintenance };
