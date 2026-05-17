const localizationService = require('./localization.service');
const { success } = require('../../utils/response');

const getCountries = async (req, res, next) => {
  try {
    const countries = await localizationService.getCountries();
    return success(res, { countries }, 'Countries retrieved');
  } catch (err) {
    next(err);
  }
};

const getLanguages = async (req, res, next) => {
  try {
    const languages = await localizationService.getLanguages();
    return success(res, { languages }, 'Languages retrieved');
  } catch (err) {
    next(err);
  }
};

const getCurrencies = async (req, res, next) => {
  try {
    const currencies = await localizationService.getCurrencies();
    return success(res, { currencies }, 'Currencies retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCountries, getLanguages, getCurrencies };
