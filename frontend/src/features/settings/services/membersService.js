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

const updateRole = async (memberId, role) => {
  const { data } = await api.patch(`/api/v1/members/${memberId}/role`, { role });
  return data.data.member;
};

const removeMember = async (memberId) => {
  await api.delete(`/api/v1/members/${memberId}`);
};

export default { getMembers, invite, updateStatus, updateRole, removeMember };
