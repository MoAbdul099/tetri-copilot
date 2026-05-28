/**
 * Compliance seed data — jurisdictions, authorities, categories, packs
 * Run: node prisma/compliance-seed.js
 */
const { PrismaClient } = require('@prisma/client');

async function seedCompliance(prisma) {
  console.log('Seeding compliance reference data...');

  // ── Jurisdictions ──────────────────────────────────────────────────────────
  const jurisdictions = await Promise.all([
    prisma.complianceJurisdiction.upsert({
      where: { code: 'UAE' },
      update: {},
      create: { name: 'United Arab Emirates', code: 'UAE', isoCode: 'AE', defaultCurrency: 'AED' },
    }),
    prisma.complianceJurisdiction.upsert({
      where: { code: 'GEO' },
      update: {},
      create: { name: 'Georgia', code: 'GEO', isoCode: 'GE', defaultCurrency: 'GEL' },
    }),
    prisma.complianceJurisdiction.upsert({
      where: { code: 'SAU' },
      update: {},
      create: { name: 'Saudi Arabia', code: 'SAU', isoCode: 'SA', defaultCurrency: 'SAR' },
    }),
    prisma.complianceJurisdiction.upsert({
      where: { code: 'QAT' },
      update: {},
      create: { name: 'Qatar', code: 'QAT', isoCode: 'QA', defaultCurrency: 'QAR' },
    }),
    prisma.complianceJurisdiction.upsert({
      where: { code: 'BHR' },
      update: {},
      create: { name: 'Bahrain', code: 'BHR', isoCode: 'BH', defaultCurrency: 'BHD' },
    }),
    prisma.complianceJurisdiction.upsert({
      where: { code: 'KWT' },
      update: {},
      create: { name: 'Kuwait', code: 'KWT', isoCode: 'KW', defaultCurrency: 'KWD' },
    }),
    prisma.complianceJurisdiction.upsert({
      where: { code: 'OMN' },
      update: {},
      create: { name: 'Oman', code: 'OMN', isoCode: 'OM', defaultCurrency: 'OMR' },
    }),
    prisma.complianceJurisdiction.upsert({
      where: { code: 'GBR' },
      update: {},
      create: { name: 'United Kingdom', code: 'GBR', isoCode: 'GB', defaultCurrency: 'GBP' },
    }),
    prisma.complianceJurisdiction.upsert({
      where: { code: 'USA' },
      update: {},
      create: { name: 'United States', code: 'USA', isoCode: 'US', defaultCurrency: 'USD' },
    }),
  ]);

  const jMap = Object.fromEntries(jurisdictions.map((j) => [j.code, j.id]));
  console.log(`  ✓ ${jurisdictions.length} jurisdictions`);

  // ── Authorities ────────────────────────────────────────────────────────────
  const authorityData = [
    // UAE
    { jurisdictionId: jMap.UAE, name: 'Federal Tax Authority (FTA)', website: 'https://www.tax.gov.ae' },
    { jurisdictionId: jMap.UAE, name: 'Ministry of Human Resources & Emiratisation (MOHRE)', website: 'https://www.mohre.gov.ae' },
    { jurisdictionId: jMap.UAE, name: 'Ministry of Economy', website: 'https://www.economy.gov.ae' },
    { jurisdictionId: jMap.UAE, name: 'Department of Economic Development (DED)', website: 'https://www.dubaided.gov.ae' },
    // Georgia
    { jurisdictionId: jMap.GEO, name: 'Revenue Service of Georgia', website: 'https://rs.ge' },
    { jurisdictionId: jMap.GEO, name: 'National Agency of Public Registry', website: 'https://www.napr.gov.ge' },
    // Saudi Arabia
    { jurisdictionId: jMap.SAU, name: 'Zakat, Tax and Customs Authority (ZATCA)', website: 'https://www.zatca.gov.sa' },
    { jurisdictionId: jMap.SAU, name: 'Ministry of Commerce', website: 'https://mc.gov.sa' },
    { jurisdictionId: jMap.SAU, name: 'Ministry of Human Resources', website: 'https://www.hrsd.gov.sa' },
    // Qatar
    { jurisdictionId: jMap.QAT, name: 'General Tax Authority (GTA)', website: 'https://www.gta.gov.qa' },
    { jurisdictionId: jMap.QAT, name: 'Ministry of Commerce and Industry', website: 'https://www.moci.gov.qa' },
    // Bahrain
    { jurisdictionId: jMap.BHR, name: 'National Bureau for Revenue (NBR)', website: 'https://www.nbr.gov.bh' },
    // Kuwait
    { jurisdictionId: jMap.KWT, name: 'Ministry of Finance', website: 'https://www.mof.gov.kw' },
    // Oman
    { jurisdictionId: jMap.OMN, name: 'Tax Authority of Oman', website: 'https://taxoman.gov.om' },
    // UK
    { jurisdictionId: jMap.GBR, name: 'HM Revenue & Customs (HMRC)', website: 'https://www.gov.uk/government/organisations/hm-revenue-customs' },
    { jurisdictionId: jMap.GBR, name: "Companies House", website: 'https://www.gov.uk/government/organisations/companies-house' },
    // USA
    { jurisdictionId: jMap.USA, name: 'Internal Revenue Service (IRS)', website: 'https://www.irs.gov' },
  ];

  for (const auth of authorityData) {
    await prisma.complianceAuthority.upsert({
      where: { id: (await prisma.complianceAuthority.findFirst({ where: { jurisdictionId: auth.jurisdictionId, name: auth.name } }))?.id || '00000000-0000-0000-0000-000000000000' },
      update: {},
      create: auth,
    }).catch(() => prisma.complianceAuthority.create({ data: auth }));
  }
  console.log(`  ✓ ${authorityData.length} authorities`);

  // ── System Categories ──────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Tax', color: '#ef4444', isSystem: true },
    { name: 'Regulatory', color: '#f97316', isSystem: true },
    { name: 'Licenses', color: '#eab308', isSystem: true },
    { name: 'Employment', color: '#22c55e', isSystem: true },
    { name: 'Finance', color: '#3b82f6', isSystem: true },
    { name: 'Internal', color: '#8b5cf6', isSystem: true },
  ];

  for (const cat of categoryData) {
    const existing = await prisma.complianceCategory.findFirst({ where: { name: cat.name, workspaceId: null, isSystem: true } });
    if (!existing) {
      await prisma.complianceCategory.create({ data: cat });
    }
  }
  console.log(`  ✓ ${categoryData.length} system categories`);

  // ── Compliance Packs ───────────────────────────────────────────────────────
  const uaePack = await prisma.compliancePack.upsert({
    where: { id: (await prisma.compliancePack.findFirst({ where: { jurisdictionId: jMap.UAE } }))?.id || '00000000-0000-0000-0000-000000000000' },
    update: {},
    create: {
      jurisdictionId: jMap.UAE,
      name: 'UAE Core Compliance Pack',
      description: 'Essential compliance obligations for UAE businesses including VAT, Corporate Tax, and Trade License.',
    },
  }).catch(() => prisma.compliancePack.create({
    data: {
      jurisdictionId: jMap.UAE,
      name: 'UAE Core Compliance Pack',
      description: 'Essential compliance obligations for UAE businesses including VAT, Corporate Tax, and Trade License.',
    },
  }));

  const uaePackTemplates = [
    { packId: uaePack.id, name: 'UAE VAT Return', description: 'Monthly VAT return filing with the Federal Tax Authority.', frequency: 'monthly', priority: 'high' },
    { packId: uaePack.id, name: 'UAE Corporate Tax Return', description: 'Annual corporate tax filing with FTA.', frequency: 'annual', priority: 'critical' },
    { packId: uaePack.id, name: 'Trade License Renewal', description: 'Annual renewal of trade license with DED or Free Zone authority.', frequency: 'annual', priority: 'critical' },
    { packId: uaePack.id, name: 'ESR Filing', description: 'Economic Substance Regulations notification and report.', frequency: 'annual', priority: 'high' },
  ];

  const geoPack = await prisma.compliancePack.create({
    data: {
      jurisdictionId: jMap.GEO,
      name: 'Georgia Core Compliance Pack',
      description: 'Core compliance obligations for businesses registered in Georgia.',
    },
  }).catch(async () => {
    const existing = await prisma.compliancePack.findFirst({ where: { jurisdictionId: jMap.GEO } });
    return existing;
  });

  const geoPackTemplates = [
    { packId: geoPack.id, name: 'Georgia VAT Declaration', description: 'Monthly VAT declaration with Revenue Service.', frequency: 'monthly', priority: 'high' },
    { packId: geoPack.id, name: 'Annual Income Tax Return', description: 'Annual income tax filing with Revenue Service.', frequency: 'annual', priority: 'critical' },
    { packId: geoPack.id, name: 'Financial Statement Submission', description: 'Annual financial statements to Revenue Service.', frequency: 'annual', priority: 'high' },
  ];

  const sauPack = await prisma.compliancePack.create({
    data: {
      jurisdictionId: jMap.SAU,
      name: 'Saudi Arabia Core Compliance Pack',
      description: 'Key compliance obligations for businesses operating in Saudi Arabia.',
    },
  }).catch(async () => {
    const existing = await prisma.compliancePack.findFirst({ where: { jurisdictionId: jMap.SAU } });
    return existing;
  });

  const sauPackTemplates = [
    { packId: sauPack.id, name: 'Saudi VAT Return', description: 'VAT return filing with ZATCA.', frequency: 'monthly', priority: 'high' },
    { packId: sauPack.id, name: 'Corporate Tax Filing', description: 'Annual corporate income tax filing with ZATCA.', frequency: 'annual', priority: 'critical' },
    { packId: sauPack.id, name: 'Commercial Registration Renewal', description: 'Annual renewal of commercial registration.', frequency: 'annual', priority: 'critical' },
  ];

  // Create pack templates
  for (const tpl of [...uaePackTemplates, ...geoPackTemplates, ...sauPackTemplates]) {
    const existing = await prisma.compliancePackTemplate.findFirst({ where: { packId: tpl.packId, name: tpl.name } });
    if (!existing) {
      await prisma.compliancePackTemplate.create({ data: tpl });
    }
  }

  console.log('  ✓ 3 compliance packs with templates');
  console.log('Compliance seed complete.');
}

module.exports = { seedCompliance };

// Standalone runner
if (require.main === module) {
  const prisma = new PrismaClient();
  seedCompliance(prisma)
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
