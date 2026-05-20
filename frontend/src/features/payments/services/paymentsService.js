import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const authHeader = async () => {
  const { getToken } = await import('@clerk/clerk-react').then((m) => m.useAuth?.() ?? {});
  return {};
};

const client = axios.create({ baseURL: API, withCredentials: true });

client.interceptors.request.use(async (config) => {
  try {
    const { Clerk } = window;
    if (Clerk?.session) {
      const token = await Clerk.session.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

const workspaceParam = () => {
  const match = window.location.pathname.match(/\/workspaces\/([^/]+)/);
  return match ? match[1] : null;
};

const wid = () => {
  const id = localStorage.getItem('activeWorkspaceId');
  return id || '';
};

const withWid = (params = {}) => ({ ...params, workspaceId: wid() });

export const listPayments   = (params = {}) => client.get('/payments',        { params: withWid(params) }).then((r) => r.data.data);
export const getPayment     = (id)          => client.get(`/payments/${id}`,  { params: withWid() }).then((r) => r.data.data);
export const recordPayment  = (data)        => client.post('/payments',        { ...data, ...withWid() }).then((r) => r.data.data);
export const updatePayment  = (id, data)    => client.patch(`/payments/${id}`, { ...data, ...withWid() }).then((r) => r.data.data);
export const postPayment    = (id)          => client.post(`/payments/${id}/post`,    withWid()).then((r) => r.data.data);
export const reversePayment = (id, data)    => client.post(`/payments/${id}/reverse`, { ...data, ...withWid() }).then((r) => r.data.data);
export const voidPayment    = (id)          => client.post(`/payments/${id}/void`,    withWid()).then((r) => r.data.data);
export const allocatePayment = (id, data)   => client.post(`/payments/${id}/allocate`, { ...data, ...withWid() }).then((r) => r.data.data);
export const autoAllocate   = (id)          => client.post(`/payments/${id}/auto-allocate`, withWid()).then((r) => r.data.data);
export const removeAllocation = (id, allocationId) => client.delete(`/payments/${id}/allocations/${allocationId}`, { params: withWid() }).then((r) => r.data.data);
export const createCredit   = (id, amount)  => client.post(`/payments/${id}/credits`, { amount, ...withWid() }).then((r) => r.data.data);
export const listCredits    = (params = {}) => client.get('/payments/credits',  { params: withWid(params) }).then((r) => r.data.data);
export const applyCredit    = (id, data)    => client.post(`/payments/credits/${id}/apply`, { ...data, ...withWid() }).then((r) => r.data.data);
export const getStats       = ()            => client.get('/payments/stats',    { params: withWid() }).then((r) => r.data.data);

export const uploadAttachment = (id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('workspaceId', wid());
  return client.post(`/payments/${id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
};
export const deleteAttachment = (id, attachmentId) =>
  client.delete(`/payments/${id}/attachments/${attachmentId}`, { params: withWid() });
