import api from '../../../lib/api.js';

const getInvitations = async () => {
  const { data } = await api.get('/api/v1/invitations');
  return data.data.invitations;
};

const createInvitation = async (email, role = 'user') => {
  const { data } = await api.post('/api/v1/invitations', { email, role });
  return data.data.invitation;
};

const cancelInvitation = async (id) => {
  await api.patch(`/api/v1/invitations/${id}/cancel`);
};

const resendInvitation = async (id) => {
  const { data } = await api.patch(`/api/v1/invitations/${id}/resend`);
  return data.data.invitation;
};

const acceptInvitation = async (token) => {
  const { data } = await api.post('/api/v1/invitations/accept', { token });
  return data.data;
};

export default { getInvitations, createInvitation, cancelInvitation, resendInvitation, acceptInvitation };
