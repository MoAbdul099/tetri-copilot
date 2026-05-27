import api from '../../../lib/api.js';

const BASE = '/api/v1/document-templates';

export const getMeta            = ()       => api.get(`${BASE}/meta`).then(r => r.data.data);
export const listTemplates      = (p)      => api.get(BASE, { params: p }).then(r => r.data.data);
export const getTemplate        = (id)     => api.get(`${BASE}/${id}`).then(r => r.data.data);
export const createTemplate     = (d)      => api.post(BASE, d).then(r => r.data.data);
export const updateTemplate     = (id, d)  => api.put(`${BASE}/${id}`, d).then(r => r.data.data);
export const deleteTemplate     = (id)     => api.delete(`${BASE}/${id}`).then(r => r.data);
export const cloneTemplate      = (id)     => api.post(`${BASE}/${id}/clone`).then(r => r.data.data);
export const archiveTemplate    = (id)     => api.post(`${BASE}/${id}/archive`).then(r => r.data.data);
export const previewTemplate    = (id, p)  => api.get(`${BASE}/${id}/preview`, { params: p }).then(r => r.data.data);
export const generateFromTpl    = (id, d)  => api.post(`${BASE}/${id}/generate`, d).then(r => r.data.data);
export const aiAssistTemplate   = (d)      => api.post(`${BASE}/ai-assist`, d).then(r => r.data.data);
export const getBranding        = ()       => api.get(`${BASE}/branding`).then(r => r.data.data);
export const upsertBranding     = (d)      => api.put(`${BASE}/branding`, d).then(r => r.data.data);
