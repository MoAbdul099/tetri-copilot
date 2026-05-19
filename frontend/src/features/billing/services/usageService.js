import api from '../../../lib/api';

export const getUsageSummary = async () => {
  const { data } = await api.get('/api/v1/usage/summary');
  return data.data.summary;
};
