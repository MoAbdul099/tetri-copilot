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
  const planData = [
    {
      code: 'free',
      name: 'Free',
      description: 'Get started with essential tools for solo operators and small teams.',
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
      isActive: true,
    },
    {
      code: 'business',
      name: 'Business',
      description: 'Full-scale platform for established businesses with advanced needs.',
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
