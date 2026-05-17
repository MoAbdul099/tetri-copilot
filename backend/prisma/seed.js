const { PrismaClient } = require('@prisma/client');

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
