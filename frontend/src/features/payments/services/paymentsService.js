import api from '../../../lib/api';

export const listPayments    = (params = {})    => api.get('/api/v1/payments',              { params }).then((r) => r.data.data);
export const getPayment      = (id)             => api.get(`/api/v1/payments/${id}`).then((r) => r.data.data);
export const recordPayment   = (data)           => api.post('/api/v1/payments', data).then((r) => r.data.data);
export const updatePayment   = (id, data)       => api.patch(`/api/v1/payments/${id}`, data).then((r) => r.data.data);
export const postPayment     = (id)             => api.post(`/api/v1/payments/${id}/post`).then((r) => r.data.data);
export const reversePayment  = (id, data)       => api.post(`/api/v1/payments/${id}/reverse`, data).then((r) => r.data.data);
export const voidPayment     = (id)             => api.post(`/api/v1/payments/${id}/void`).then((r) => r.data.data);
export const allocatePayment = (id, data)       => api.post(`/api/v1/payments/${id}/allocate`, data).then((r) => r.data.data);
export const autoAllocate    = (id)             => api.post(`/api/v1/payments/${id}/auto-allocate`).then((r) => r.data.data);
export const removeAllocation = (id, allocId)  => api.delete(`/api/v1/payments/${id}/allocations/${allocId}`).then((r) => r.data.data);
export const createCredit    = (id, amount)     => api.post(`/api/v1/payments/${id}/credits`, { amount }).then((r) => r.data.data);
export const listCredits     = (params = {})    => api.get('/api/v1/payments/credits', { params }).then((r) => r.data.data);
export const applyCredit     = (id, data)       => api.post(`/api/v1/payments/credits/${id}/apply`, data).then((r) => r.data.data);
export const getStats        = ()               => api.get('/api/v1/payments/stats').then((r) => r.data.data);

export const uploadAttachment = (id, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post(`/api/v1/payments/${id}/attachments`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data);
};

export const deleteAttachment = (id, attachmentId) =>
  api.delete(`/api/v1/payments/${id}/attachments/${attachmentId}`);
