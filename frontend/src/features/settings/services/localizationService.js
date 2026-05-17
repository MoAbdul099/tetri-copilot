import api from '../../../lib/api.js';

const getCountries = async () => {
  const { data } = await api.get('/api/v1/countries');
  return data.data.countries;
};

const getLanguages = async () => {
  const { data } = await api.get('/api/v1/languages');
  return data.data.languages;
};

const getCurrencies = async () => {
  const { data } = await api.get('/api/v1/currencies');
  return data.data.currencies;
};

export default { getCountries, getLanguages, getCurrencies };
