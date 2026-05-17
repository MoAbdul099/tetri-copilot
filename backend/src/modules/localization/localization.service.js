const localizationRepository = require('./localization.repository');

module.exports = {
  getCountries: () => localizationRepository.getCountries(),
  getLanguages: () => localizationRepository.getLanguages(),
  getCurrencies: () => localizationRepository.getCurrencies(),
};
