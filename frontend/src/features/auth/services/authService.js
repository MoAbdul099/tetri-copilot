import api from '../../../lib/api.js';

const getMe = async () => {
  const { data } = await api.get('/api/v1/auth/me');
  return data.data;
};

export default { getMe };
