import api from '../../../lib/api.js';

function buildQuery(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  if (!entries.length) return '';
  return '?' + new URLSearchParams(entries).toString();
}

const base = () => api.defaults.baseURL || '';

export const uploadFiles = (formData) =>
  api.post('/api/v1/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.data);

export const listFiles = (params) =>
  api.get(`/api/v1/files${buildQuery(params)}`).then((r) => r.data.data);

export const getFile = (id) =>
  api.get(`/api/v1/files/${id}`).then((r) => r.data.data);

export const downloadFile = (id) =>
  `${base()}/api/v1/files/${id}/download`;

export const serveFile = (id) =>
  `${base()}/api/v1/files/${id}/serve`;

export const renameFile = (id, fileName) =>
  api.put(`/api/v1/files/${id}`, { fileName }).then((r) => r.data.data);

export const deleteFile = (id) =>
  api.delete(`/api/v1/files/${id}`).then((r) => r.data.data);

export const restoreFile = (id) =>
  api.post(`/api/v1/files/${id}/restore`).then((r) => r.data.data);

export const linkFile = (fileId, entityType, entityId) =>
  api.post('/api/v1/files/link', { fileId, entityType, entityId }).then((r) => r.data.data);

export const unlinkFile = (linkId) =>
  api.delete(`/api/v1/files/link/${linkId}`).then((r) => r.data.data);

export const getEntityFiles = (entityType, entityId) =>
  api.get(`/api/v1/files/entity/${entityType}/${entityId}`).then((r) => r.data.data);
