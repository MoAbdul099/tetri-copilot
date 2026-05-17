const prisma = require('../../lib/prisma');

const getCountries = () =>
  prisma.countryProfile.findMany({
    where: { isActive: true },
    include: {
      defaultCurrency: true,
      defaultLanguage: true,
    },
    orderBy: { countryName: 'asc' },
  });

const getLanguages = () =>
  prisma.language.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

const getCurrencies = () =>
  prisma.currency.findMany({
    where: { isActive: true },
    orderBy: { code: 'asc' },
  });

module.exports = { getCountries, getLanguages, getCurrencies };
