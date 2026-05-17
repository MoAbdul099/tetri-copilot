import api from '../../../lib/api.js';

const getCompany = async () => {
  const { data } = await api.get('/api/v1/company');
  return data.data.company;
};

const updateCompany = async (payload) => {
  const { data } = await api.patch('/api/v1/company', payload);
  return data.data.company;
};

export default { getCompany, updateCompany };
