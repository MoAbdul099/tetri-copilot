import api from '../../../lib/api.js';

const BASE = '/email-templates';

export const listTemplates    = (params) => api.get(BASE, { params }).then((r) => r.data.data);
export const getTemplate      = (id)     => api.get(`${BASE}/${id}`).then((r) => r.data.data);
export const createTemplate   = (data)   => api.post(BASE, data).then((r) => r.data.data);
export const updateTemplate   = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data.data);
export const deleteTemplate   = (id)     => api.delete(`${BASE}/${id}`).then((r) => r.data);
export const publishTemplate  = (id)     => api.post(`${BASE}/${id}/publish`).then((r) => r.data.data);
export const archiveTemplate  = (id)     => api.post(`${BASE}/${id}/archive`).then((r) => r.data.data);
export const getVersions      = (id)     => api.get(`${BASE}/${id}/versions`).then((r) => r.data.data);
export const previewTemplate  = (id, vars) => api.post(`${BASE}/${id}/preview`, vars).then((r) => r.data.data);
export const sendTestEmail    = (id, data) => api.post(`${BASE}/${id}/test`, data).then((r) => r.data);
export const getAnalytics     = (days)   => api.get(`${BASE}/analytics/summary`, { params: { days } }).then((r) => r.data.data);
export const listDeliveries   = (params) => api.get(`${BASE}/analytics/deliveries`, { params }).then((r) => r.data.data);
