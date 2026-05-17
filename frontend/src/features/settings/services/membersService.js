import api from '../../../lib/api.js';

const getMembers = async () => {
  const { data } = await api.get('/api/v1/members');
  return data.data;
};

const invite = async (email, role = 'user') => {
  const { data } = await api.post('/api/v1/members/invite', { email, role });
  return data.data.invitation;
};

const updateStatus = async (memberId, status) => {
  const { data } = await api.patch(`/api/v1/members/${memberId}/status`, { status });
  return data.data.member;
};

export default { getMembers, invite, updateStatus };
