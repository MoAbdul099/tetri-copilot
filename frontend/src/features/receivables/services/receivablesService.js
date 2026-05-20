import api from '../../../lib/api';

// ── Receivables ────────────────────────────────────────────
export const getARSummary   = ()       => api.get('/api/v1/receivables/summary').then(r => r.data.data);
export const getAgingData   = (params) => api.get('/api/v1/receivables/aging', { params }).then(r => r.data.data);
export const getTopDebtors  = ()       => api.get('/api/v1/receivables/top-debtors').then(r => r.data.data);
export const getCustomerReceivables = (params) => api.get('/api/v1/receivables/customers', { params }).then(r => r.data.data);
export const getCustomerProfile = (id) => api.get(`/api/v1/receivables/customers/${id}`).then(r => r.data.data);

// ── Collections ────────────────────────────────────────────
export const listActivities  = (params) => api.get('/api/v1/collections', { params }).then(r => r.data.data);
export const getActivity     = (id)     => api.get(`/api/v1/collections/${id}`).then(r => r.data.data);
export const createActivity  = (data)   => api.post('/api/v1/collections', data).then(r => r.data.data);
export const updateActivity  = (id, data) => api.patch(`/api/v1/collections/${id}`, data).then(r => r.data.data);
export const deleteActivity  = (id)     => api.delete(`/api/v1/collections/${id}`);
export const getQueue        = ()       => api.get('/api/v1/collections/queue').then(r => r.data.data);

export const listPromises    = (params) => api.get('/api/v1/collections/promises', { params }).then(r => r.data.data);
export const createPromise   = (data)   => api.post('/api/v1/collections/promises', data).then(r => r.data.data);
export const updatePromise   = (id, data) => api.patch(`/api/v1/collections/promises/${id}`, data).then(r => r.data.data);
export const deletePromise   = (id)     => api.delete(`/api/v1/collections/promises/${id}`);

// ── Statements ─────────────────────────────────────────────
export const generateStatement = (data) => api.post('/api/v1/statements/generate', data).then(r => r.data.data);
export const listStatements    = (params) => api.get('/api/v1/statements', { params }).then(r => r.data.data);
