const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const localizationController = require('./localization.controller');

const countries = Router();
const languages = Router();
const currencies = Router();

countries.use(protect, requireWorkspace);
languages.use(protect, requireWorkspace);
currencies.use(protect, requireWorkspace);

countries.get('/', localizationController.getCountries);
languages.get('/', localizationController.getLanguages);
currencies.get('/', localizationController.getCurrencies);

module.exports = { countries, languages, currencies };
