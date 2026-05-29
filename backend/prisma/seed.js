const { PrismaClient } = require('@prisma/client');
const { seedCompliance } = require('./compliance-seed');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding localization data...');

  // Languages
  const [en, ar, ka] = await Promise.all([
    prisma.language.upsert({
      where: { code: 'en' },
      create: { code: 'en', name: 'English', nativeName: 'English', isActive: true },
      update: {},
    }),
    prisma.language.upsert({
      where: { code: 'ar' },
      create: { code: 'ar', name: 'Arabic', nativeName: 'العربية', isActive: true },
      update: {},
    }),
    prisma.language.upsert({
      where: { code: 'ka' },
      create: { code: 'ka', name: 'Georgian', nativeName: 'ქართული', isActive: true },
      update: {},
    }),
  ]);
  console.log('Languages seeded: English, Arabic, Georgian');

  // Currencies
  const [, aed, sar, qar, gel] = await Promise.all([
    prisma.currency.upsert({
      where: { code: 'USD' },
      create: { code: 'USD', name: 'US Dollar', symbol: '$', isActive: true },
      update: {},
    }),
    prisma.currency.upsert({
      where: { code: 'AED' },
      create: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', isActive: true },
      update: {},
    }),
    prisma.currency.upsert({
      where: { code: 'SAR' },
      create: { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', isActive: true },
      update: {},
    }),
    prisma.currency.upsert({
      where: { code: 'QAR' },
      create: { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', isActive: true },
      update: {},
    }),
    prisma.currency.upsert({
      where: { code: 'GEL' },
      create: { code: 'GEL', name: 'Georgian Lari', symbol: 'GEL', isActive: true },
      update: {},
    }),
  ]);
  console.log('Currencies seeded: USD, AED, SAR, QAR, GEL');

  // Country profiles
  await Promise.all([
    prisma.countryProfile.upsert({
      where: { countryCode: 'AE' },
      create: {
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        defaultCurrencyId: aed.id,
        defaultLanguageId: ar.id,
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Dubai',
        taxLabel: 'VAT',
        taxNumberLabel: 'TRN',
        defaultTaxRate: 5,
        isActive: true,
      },
      update: {},
    }),
    prisma.countryProfile.upsert({
      where: { countryCode: 'SA' },
      create: {
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        defaultCurrencyId: sar.id,
        defaultLanguageId: ar.id,
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Riyadh',
        taxLabel: 'VAT',
        taxNumberLabel: 'VAT Number',
        defaultTaxRate: 15,
        isActive: true,
      },
      update: {},
    }),
    prisma.countryProfile.upsert({
      where: { countryCode: 'QA' },
      create: {
        countryCode: 'QA',
        countryName: 'Qatar',
        defaultCurrencyId: qar.id,
        defaultLanguageId: ar.id,
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Qatar',
        taxLabel: 'Tax',
        taxNumberLabel: 'Tax Number',
        defaultTaxRate: 0,
        isActive: true,
      },
      update: {},
    }),
    prisma.countryProfile.upsert({
      where: { countryCode: 'GE' },
      create: {
        countryCode: 'GE',
        countryName: 'Georgia',
        defaultCurrencyId: gel.id,
        defaultLanguageId: ka.id,
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Tbilisi',
        taxLabel: 'VAT',
        taxNumberLabel: 'TIN',
        defaultTaxRate: 18,
        isActive: true,
      },
      update: {},
    }),
  ]);
  console.log('Country profiles seeded: UAE, Saudi Arabia, Qatar, Georgia');

  // Plans
  const FREE_FEATURES = [
    // Invoicing
    { category: 'Invoicing', label: 'Create & send invoices (up to 10/month)', included: true },
    { category: 'Invoicing', label: 'PDF invoice generation', included: true },
    { category: 'Invoicing', label: 'Customer management', included: true },
    { category: 'Invoicing', label: 'Invoice status tracking', included: true },
    { category: 'Invoicing', label: 'Unlimited invoices', included: false },
    { category: 'Invoicing', label: 'Recurring invoices', included: false },
    // Payments
    { category: 'Payments', label: 'Record payments manually', included: true },
    { category: 'Payments', label: 'Payment allocation to invoices', included: false },
    { category: 'Payments', label: 'Payment history & reports', included: false },
    // Expenses
    { category: 'Expenses', label: 'Expense tracking', included: false },
    { category: 'Expenses', label: 'Expense categories & suppliers', included: false },
    { category: 'Expenses', label: 'Receipt attachments', included: false },
    { category: 'Expenses', label: 'Expense approval workflows', included: false },
    { category: 'Expenses', label: 'Reimbursement management', included: false },
    // Receivables
    { category: 'Receivables', label: 'Accounts receivable dashboard', included: false },
    { category: 'Receivables', label: 'Aging analysis', included: false },
    { category: 'Receivables', label: 'Collections management', included: false },
    { category: 'Receivables', label: 'Customer statements', included: false },
    // AI
    { category: 'AI Assistant', label: 'Basic AI assistant (5 requests/month)', included: true },
    { category: 'AI Assistant', label: 'AI expense categorization', included: false },
    { category: 'AI Assistant', label: 'AI document generation', included: false },
    { category: 'AI Assistant', label: 'AI compliance assistant', included: false },
    { category: 'AI Assistant', label: 'Workspace AI copilot', included: false },
    // Compliance
    { category: 'Compliance', label: 'Compliance calendar', included: false },
    { category: 'Compliance', label: 'Compliance templates & occurrences', included: false },
    { category: 'Compliance', label: 'Compliance intelligence & risk detection', included: false },
    { category: 'Compliance', label: 'AI compliance actions', included: false },
    // Documents
    { category: 'Documents', label: 'Document templates & branding', included: false },
    { category: 'Documents', label: 'PDF / DOCX / HTML export', included: false },
    { category: 'Documents', label: 'Document version history', included: false },
    // Reports & Analytics
    { category: 'Reports & Analytics', label: 'Basic dashboard', included: true },
    { category: 'Reports & Analytics', label: 'Standard reports & CSV export', included: false },
    { category: 'Reports & Analytics', label: 'Scheduled reports', included: false },
    { category: 'Reports & Analytics', label: 'Advanced analytics & forecasting', included: false },
    { category: 'Reports & Analytics', label: 'Business health score', included: false },
    // Platform
    { category: 'Platform', label: '1 user seat', included: true },
    { category: 'Platform', label: '100 MB file storage', included: true },
    { category: 'Platform', label: 'Email notifications', included: true },
    { category: 'Platform', label: 'Multi-user access (up to 5)', included: false },
    { category: 'Platform', label: 'Role-based permissions', included: false },
    { category: 'Platform', label: 'Audit logs', included: false },
    { category: 'Platform', label: 'Priority support', included: false },
  ];

  const STARTER_FEATURES = [
    // Invoicing
    { category: 'Invoicing', label: 'Up to 50 invoices/month', included: true },
    { category: 'Invoicing', label: 'PDF invoice generation', included: true },
    { category: 'Invoicing', label: 'Customer management', included: true },
    { category: 'Invoicing', label: 'Invoice status tracking', included: true },
    { category: 'Invoicing', label: 'Recurring invoices', included: true },
    { category: 'Invoicing', label: 'Unlimited invoices', included: false },
    // Payments
    { category: 'Payments', label: 'Payment recording & allocation', included: true },
    { category: 'Payments', label: 'Payment history & reports', included: true },
    { category: 'Payments', label: 'Accounts receivable dashboard', included: true },
    { category: 'Payments', label: 'Aging analysis', included: true },
    { category: 'Payments', label: 'Collections management', included: false },
    { category: 'Payments', label: 'Customer statements', included: false },
    // Expenses
    { category: 'Expenses', label: 'Expense tracking & categories', included: true },
    { category: 'Expenses', label: 'Supplier management', included: true },
    { category: 'Expenses', label: 'Receipt & file attachments', included: true },
    { category: 'Expenses', label: 'Expense export (CSV)', included: true },
    { category: 'Expenses', label: 'Expense approval workflows', included: false },
    { category: 'Expenses', label: 'Reimbursement management', included: false },
    { category: 'Expenses', label: 'Budget tracking', included: false },
    // AI
    { category: 'AI Assistant', label: '50 AI requests/month', included: true },
    { category: 'AI Assistant', label: 'Basic AI assistant', included: true },
    { category: 'AI Assistant', label: 'AI expense categorization', included: false },
    { category: 'AI Assistant', label: 'AI document generation', included: false },
    { category: 'AI Assistant', label: 'AI compliance assistant', included: false },
    { category: 'AI Assistant', label: 'Workspace AI copilot', included: false },
    // Compliance
    { category: 'Compliance', label: 'Compliance calendar (view only)', included: true },
    { category: 'Compliance', label: 'Compliance templates & tracking', included: false },
    { category: 'Compliance', label: 'Compliance intelligence & risk detection', included: false },
    { category: 'Compliance', label: 'AI compliance actions', included: false },
    // Documents
    { category: 'Documents', label: 'Basic document generation', included: true },
    { category: 'Documents', label: 'Document templates & branding', included: false },
    { category: 'Documents', label: 'PDF / DOCX / HTML export', included: false },
    { category: 'Documents', label: 'Document version history', included: false },
    // Reports & Analytics
    { category: 'Reports & Analytics', label: 'Dashboard & KPI center', included: true },
    { category: 'Reports & Analytics', label: 'Standard reports & CSV/PDF export', included: true },
    { category: 'Reports & Analytics', label: 'Scheduled reports', included: false },
    { category: 'Reports & Analytics', label: 'Advanced analytics & forecasting', included: false },
    { category: 'Reports & Analytics', label: 'Business health score', included: false },
    // Platform
    { category: 'Platform', label: 'Up to 5 users (3 included)', included: true },
    { category: 'Platform', label: '1 GB file storage', included: true },
    { category: 'Platform', label: 'Email & in-app notifications', included: true },
    { category: 'Platform', label: 'Role-based permissions', included: true },
    { category: 'Platform', label: 'Audit logs', included: false },
    { category: 'Platform', label: 'Priority support', included: false },
  ];

  const PROFESSIONAL_FEATURES = [
    // Invoicing
    { category: 'Invoicing', label: 'Up to 200 invoices/month', included: true },
    { category: 'Invoicing', label: 'PDF invoice generation & branding', included: true },
    { category: 'Invoicing', label: 'Customer management & contacts', included: true },
    { category: 'Invoicing', label: 'Recurring invoices & automation', included: true },
    { category: 'Invoicing', label: 'Unlimited invoices', included: false },
    // Payments & Receivables
    { category: 'Payments', label: 'Full payment recording & allocation', included: true },
    { category: 'Payments', label: 'Accounts receivable dashboard', included: true },
    { category: 'Payments', label: 'Aging analysis & aging reports', included: true },
    { category: 'Payments', label: 'Collections management & follow-ups', included: true },
    { category: 'Payments', label: 'Customer statements & credit notes', included: true },
    // Expenses
    { category: 'Expenses', label: 'Full expense management', included: true },
    { category: 'Expenses', label: 'Expense approval workflows', included: true },
    { category: 'Expenses', label: 'Reimbursement management', included: true },
    { category: 'Expenses', label: 'Budget tracking & alerts', included: true },
    { category: 'Expenses', label: 'Recurring expenses', included: true },
    { category: 'Expenses', label: 'Anomaly detection', included: true },
    // AI
    { category: 'AI Assistant', label: '200 AI requests/month', included: true },
    { category: 'AI Assistant', label: 'Workspace AI copilot & chatbot', included: true },
    { category: 'AI Assistant', label: 'AI expense categorization', included: true },
    { category: 'AI Assistant', label: 'AI vendor intelligence & duplicate detection', included: true },
    { category: 'AI Assistant', label: 'AI document generation', included: true },
    { category: 'AI Assistant', label: 'Natural language expense search', included: true },
    { category: 'AI Assistant', label: 'AI compliance assistant', included: false },
    { category: 'AI Assistant', label: 'AI action framework & governance', included: false },
    // Compliance
    { category: 'Compliance', label: 'Full compliance calendar & tracking', included: true },
    { category: 'Compliance', label: 'Compliance templates & occurrence management', included: true },
    { category: 'Compliance', label: 'Submission tracking & activity logs', included: true },
    { category: 'Compliance', label: 'Compliance reminders & escalations', included: true },
    { category: 'Compliance', label: 'Compliance intelligence & risk detection', included: false },
    { category: 'Compliance', label: 'AI compliance actions', included: false },
    // Documents
    { category: 'Documents', label: 'Document templates & branding profiles', included: true },
    { category: 'Documents', label: 'AI-powered document generation', included: true },
    { category: 'Documents', label: 'PDF / DOCX / HTML export', included: true },
    { category: 'Documents', label: 'Document version history & comparison', included: true },
    { category: 'Documents', label: 'AI tone & quality enhancement', included: true },
    // Reports & Analytics
    { category: 'Reports & Analytics', label: 'Full dashboard & KPI center', included: true },
    { category: 'Reports & Analytics', label: '14 standard reports with CSV/Excel/PDF export', included: true },
    { category: 'Reports & Analytics', label: 'Scheduled & saved reports', included: true },
    { category: 'Reports & Analytics', label: 'Advanced analytics & 90-day forecasting', included: true },
    { category: 'Reports & Analytics', label: 'Business health score & risk alerts', included: true },
    { category: 'Reports & Analytics', label: 'AI-powered insights', included: true },
    // Platform
    { category: 'Platform', label: 'Up to 10 users (5 included)', included: true },
    { category: 'Platform', label: '5 GB file storage', included: true },
    { category: 'Platform', label: 'Email, in-app & SMS notifications', included: true },
    { category: 'Platform', label: 'Role-based permissions (admin/owner/user/viewer)', included: true },
    { category: 'Platform', label: 'Audit logs & activity history', included: true },
    { category: 'Platform', label: 'Priority support', included: false },
    { category: 'Platform', label: 'API access', included: false },
  ];

  const BUSINESS_FEATURES = [
    // Invoicing
    { category: 'Invoicing', label: 'Unlimited invoices', included: true },
    { category: 'Invoicing', label: 'Branded PDF generation & custom templates', included: true },
    { category: 'Invoicing', label: 'Full customer management & contacts', included: true },
    { category: 'Invoicing', label: 'Recurring invoices & automation', included: true },
    // Payments & Receivables
    { category: 'Payments', label: 'Full payment recording & allocation', included: true },
    { category: 'Payments', label: 'Accounts receivable dashboard', included: true },
    { category: 'Payments', label: 'Aging analysis & collections', included: true },
    { category: 'Payments', label: 'Customer statements & credit notes', included: true },
    // Expenses
    { category: 'Expenses', label: 'Full expense management & approval workflows', included: true },
    { category: 'Expenses', label: 'Reimbursement management & payments', included: true },
    { category: 'Expenses', label: 'Budget tracking, alerts & anomaly detection', included: true },
    { category: 'Expenses', label: 'Recurring expenses & forecasting', included: true },
    // AI
    { category: 'AI Assistant', label: 'Unlimited AI requests', included: true },
    { category: 'AI Assistant', label: 'Workspace AI copilot & advanced chatbot', included: true },
    { category: 'AI Assistant', label: 'AI expense categorization & intelligence', included: true },
    { category: 'AI Assistant', label: 'AI vendor intelligence & duplicate detection', included: true },
    { category: 'AI Assistant', label: 'AI document generation & enhancement', included: true },
    { category: 'AI Assistant', label: 'AI compliance assistant & chatbot', included: true },
    { category: 'AI Assistant', label: 'AI action framework with governance modes', included: true },
    { category: 'AI Assistant', label: 'Natural language queries across all modules', included: true },
    // Compliance
    { category: 'Compliance', label: 'Full compliance calendar & tracking', included: true },
    { category: 'Compliance', label: 'Compliance templates & jurisdiction management', included: true },
    { category: 'Compliance', label: 'Compliance intelligence & health scoring', included: true },
    { category: 'Compliance', label: 'Risk detection & recommendations', included: true },
    { category: 'Compliance', label: 'AI compliance actions & automation', included: true },
    { category: 'Compliance', label: 'Compliance audit trail & governance', included: true },
    { category: 'Compliance', label: 'Multi-jurisdiction compliance management', included: true },
    // Documents
    { category: 'Documents', label: 'Full document templates & branding profiles', included: true },
    { category: 'Documents', label: 'AI-powered document generation', included: true },
    { category: 'Documents', label: 'PDF / DOCX / HTML export', included: true },
    { category: 'Documents', label: 'Document versioning & comparison', included: true },
    { category: 'Documents', label: 'AI tone, quality & executive summary', included: true },
    // Reports & Analytics
    { category: 'Reports & Analytics', label: 'Full dashboard & KPI center', included: true },
    { category: 'Reports & Analytics', label: 'All standard reports with multi-format export', included: true },
    { category: 'Reports & Analytics', label: 'Scheduled & saved reports', included: true },
    { category: 'Reports & Analytics', label: 'Advanced analytics & 90-day forecasting', included: true },
    { category: 'Reports & Analytics', label: 'Business health score & risk alerts', included: true },
    { category: 'Reports & Analytics', label: 'AI-powered insights & executive summaries', included: true },
    // Platform
    { category: 'Platform', label: 'Up to 25 users (10 included)', included: true },
    { category: 'Platform', label: '20 GB file storage', included: true },
    { category: 'Platform', label: 'Email, in-app & SMS notifications', included: true },
    { category: 'Platform', label: 'Full role-based permissions & RBAC', included: true },
    { category: 'Platform', label: 'Complete audit logs & security events', included: true },
    { category: 'Platform', label: 'Priority support & dedicated onboarding', included: true },
    { category: 'Platform', label: 'API access', included: true },
    { category: 'Platform', label: 'Custom branding & white-label options', included: true },
  ];

  const planData = [
    {
      code: 'free',
      name: 'Free',
      description: 'Get started with essential invoicing tools for solo operators and small teams.',
      monthlyPriceUsd: 0,
      yearlyPriceUsd: 0,
      displayOrder: 0,
      isRecommended: false,
      isPublic: true,
      includedUsers: 1,
      maxUsers: 1,
      maxMonthlyInvoices: 10,
      maxMonthlyAiRequests: 5,
      maxStorageMb: 100,
      hasExpenses: false,
      hasAiCategorization: false,
      hasAdvancedCompliance: false,
      trialDays: 0,
      features: FREE_FEATURES,
      isActive: true,
    },
    {
      code: 'starter',
      name: 'Starter',
      description: 'Everything you need to run a growing small business efficiently.',
      monthlyPriceUsd: 19,
      yearlyPriceUsd: 190,
      displayOrder: 1,
      isRecommended: false,
      isPublic: true,
      includedUsers: 3,
      maxUsers: 5,
      maxMonthlyInvoices: 50,
      maxMonthlyAiRequests: 50,
      maxStorageMb: 1024,
      hasExpenses: true,
      hasAiCategorization: false,
      hasAdvancedCompliance: false,
      trialDays: 14,
      features: STARTER_FEATURES,
      isActive: true,
    },
    {
      code: 'professional',
      name: 'Professional',
      description: 'AI-powered operations for ambitious teams ready to scale.',
      monthlyPriceUsd: 49,
      yearlyPriceUsd: 490,
      displayOrder: 2,
      isRecommended: true,
      isPublic: true,
      includedUsers: 5,
      maxUsers: 10,
      maxMonthlyInvoices: 200,
      maxMonthlyAiRequests: 200,
      maxStorageMb: 5120,
      hasExpenses: true,
      hasAiCategorization: true,
      hasAdvancedCompliance: false,
      trialDays: 14,
      features: PROFESSIONAL_FEATURES,
      isActive: true,
    },
    {
      code: 'business',
      name: 'Business',
      description: 'Full-scale platform for established businesses with advanced AI and compliance needs.',
      monthlyPriceUsd: 99,
      yearlyPriceUsd: 990,
      displayOrder: 3,
      isRecommended: false,
      isPublic: true,
      includedUsers: 10,
      maxUsers: 25,
      maxMonthlyInvoices: null,
      maxMonthlyAiRequests: null,
      maxStorageMb: 20480,
      hasExpenses: true,
      hasAiCategorization: true,
      hasAdvancedCompliance: true,
      trialDays: 14,
      features: BUSINESS_FEATURES,
      isActive: true,
    },
  ];

  for (const plan of planData) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }
  console.log('Plans seeded: Free, Starter, Professional, Business');

  await seedCompliance(prisma);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
