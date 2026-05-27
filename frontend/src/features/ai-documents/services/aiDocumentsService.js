import api from '../../../lib/api.js';

const BASE = '/api/v1/ai-documents';

export const getCategories  = ()      => api.get(`${BASE}/categories`).then(r => r.data.data);
export const listDocuments  = (p)     => api.get(BASE, { params: p }).then(r => r.data.data);
export const getDocument    = (id)    => api.get(`${BASE}/${id}`).then(r => r.data.data);
export const generateDoc    = (d)     => api.post(`${BASE}/generate`, d).then(r => r.data.data);
export const saveDocument   = (d)     => api.post(`${BASE}/save`, d).then(r => r.data.data);
export const updateDocument = (id, d) => api.put(`${BASE}/${id}`, d).then(r => r.data.data);
export const deleteDocument = (id)    => api.delete(`${BASE}/${id}`).then(r => r.data);
export const regenerateDoc  = (id)    => api.post(`${BASE}/${id}/regenerate`).then(r => r.data.data);
