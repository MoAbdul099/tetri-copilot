import api from '../../../lib/api.js';

const bootstrapWorkspace = async (name) => {
  const { data } = await api.post('/api/v1/workspaces/bootstrap', { name });
  return data.data;
};

export default { bootstrapWorkspace };
