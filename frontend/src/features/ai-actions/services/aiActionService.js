import api from '../../../lib/api.js';

const BASE = '/api/v1/ai-actions';

export const getRegistry         = ()           => api.get(`${BASE}/registry`).then(r => r.data.data);
export const getDashboard        = ()           => api.get(`${BASE}/dashboard`).then(r => r.data.data);
export const listActions         = (params)     => api.get(BASE, { params }).then(r => r.data.data);
export const createAction        = (data)       => api.post(BASE, data).then(r => r.data.data);
export const getAction           = (id)         => api.get(`${BASE}/${id}`).then(r => r.data.data);
export const submitAction        = (id)         => api.post(`${BASE}/${id}/submit`).then(r => r.data.data);
export const approveAction       = (id, data)   => api.post(`${BASE}/${id}/approve`, data).then(r => r.data.data);
export const rejectAction        = (id, data)   => api.post(`${BASE}/${id}/reject`, data).then(r => r.data.data);
export const executeAction       = (id)         => api.post(`${BASE}/${id}/execute`).then(r => r.data.data);
export const cancelAction        = (id)         => api.post(`${BASE}/${id}/cancel`).then(r => r.data.data);
export const getAuditLogs        = (id)         => api.get(`${BASE}/${id}/audit`).then(r => r.data.data);
export const getPendingApprovals = ()           => api.get(`${BASE}/approvals/pending`).then(r => r.data.data);
export const getGovernance       = ()           => api.get(`${BASE}/governance`).then(r => r.data.data);
export const setGovernanceMode   = (mode)       => api.post(`${BASE}/governance/mode`, { mode }).then(r => r.data.data);
export const listTemplates       = (module)     => api.get(`${BASE}/templates`, { params: { module } }).then(r => r.data.data);
