import api from '../../../lib/api.js';

const getSettings = async () => {
  const { data } = await api.get('/api/v1/settings');
  return data.data.settings;
};

const updateSettings = async (payload) => {
  const { data } = await api.patch('/api/v1/settings', payload);
  return data.data.settings;
};

export default { getSettings, updateSettings };
