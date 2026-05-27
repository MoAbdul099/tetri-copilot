import api from '../../../lib/api.js';

const BASE = '/api/v1/ai-documents';

// Core
export const getCategories  = ()      => api.get(`${BASE}/categories`).then(r => r.data.data);
export const listDocuments  = (p)     => api.get(BASE, { params: p }).then(r => r.data.data);
export const getDocument    = (id)    => api.get(`${BASE}/${id}`).then(r => r.data.data);
export const generateDoc    = (d)     => api.post(`${BASE}/generate`, d).then(r => r.data.data);
export const saveDocument   = (d)     => api.post(`${BASE}/save`, d).then(r => r.data.data);
export const updateDocument = (id, d) => api.put(`${BASE}/${id}`, d).then(r => r.data.data);
export const deleteDocument = (id)    => api.delete(`${BASE}/${id}`).then(r => r.data);
export const regenerateDoc  = (id)    => api.post(`${BASE}/${id}/regenerate`).then(r => r.data.data);
export const duplicateDoc   = (id)    => api.post(`${BASE}/${id}/duplicate`).then(r => r.data.data);

// Versioning
export const listVersions    = (id)           => api.get(`${BASE}/${id}/versions`).then(r => r.data.data);
export const getVersion      = (id, vid)      => api.get(`${BASE}/${id}/versions/${vid}`).then(r => r.data.data);
export const restoreVersion  = (id, vid)      => api.post(`${BASE}/${id}/restore/${vid}`).then(r => r.data.data);
export const compareVersions = (id, d)        => api.post(`${BASE}/${id}/compare`, d).then(r => r.data.data);

// AI Enhancement
export const enhanceDoc      = (id, d)  => api.post(`${BASE}/${id}/enhance`, d).then(r => r.data.data);
export const transformTone   = (id, d)  => api.post(`${BASE}/${id}/transform-tone`, d).then(r => r.data.data);
export const generateSummary = (id, d)  => api.post(`${BASE}/${id}/summary`, d).then(r => r.data.data);
export const qualityReview   = (id)     => api.post(`${BASE}/${id}/quality-review`).then(r => r.data.data);

// Export
export const exportDocHtml   = (id) => api.post(`${BASE}/${id}/export/html`).then(r => r.data.data);
export const getExportHistory = (id) => api.get(`${BASE}/${id}/exports`).then(r => r.data.data);

export const exportDocPdf  = (id) =>
  api.post(`${BASE}/${id}/export/pdf`, {}, { responseType: 'blob' }).then(r => r.data);

export const exportDocDocx = (id) =>
  api.post(`${BASE}/${id}/export/docx`, {}, { responseType: 'blob' }).then(r => r.data);
