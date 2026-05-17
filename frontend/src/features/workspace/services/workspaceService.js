import api from '../../../lib/api.js';

const getCurrent = async () => {
  const { data } = await api.get('/api/v1/workspaces/current');
  return data.data.workspace;
};

const updateCurrent = async (payload) => {
  const { data } = await api.patch('/api/v1/workspaces/current', payload);
  return data.data.workspace;
};

export default { getCurrent, updateCurrent };
