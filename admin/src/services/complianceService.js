import api from './api';

const BASE = '/compliance';

const getStats          = ()         => api.get(`${BASE}/stats`).then(r => r.data.data);
const listJurisdictions = ()         => api.get(`${BASE}/jurisdictions`).then(r => r.data.data);
const listCategories    = ()         => api.get(`${BASE}/categories`).then(r => r.data.data);

const listTemplates     = (params)   => api.get(`${BASE}`, { params }).then(r => r.data.data);
const getTemplate       = (id)       => api.get(`${BASE}/${id}`).then(r => r.data.data);
const createTemplate    = (body)     => api.post(`${BASE}`, body).then(r => r.data.data);
const updateTemplate    = (id, body) => api.put(`${BASE}/${id}`, body).then(r => r.data.data);
const publishTemplate   = (id)       => api.post(`${BASE}/${id}/publish`).then(r => r.data.data);
const archiveTemplate   = (id)       => api.post(`${BASE}/${id}/archive`).then(r => r.data.data);
const cloneTemplate     = (id)       => api.post(`${BASE}/${id}/clone`).then(r => r.data.data);
const getWorkspaceImpact = (id)      => api.get(`${BASE}/${id}/workspaces`).then(r => r.data.data);

const createObligation  = (tid, body)      => api.post(`${BASE}/${tid}/obligations`, body).then(r => r.data.data);
const updateObligation  = (tid, oid, body) => api.put(`${BASE}/${tid}/obligations/${oid}`, body).then(r => r.data.data);
const deleteObligation  = (tid, oid)       => api.delete(`${BASE}/${tid}/obligations/${oid}`).then(r => r.data.data);

export default {
  getStats, listJurisdictions, listCategories,
  listTemplates, getTemplate, createTemplate, updateTemplate,
  publishTemplate, archiveTemplate, cloneTemplate, getWorkspaceImpact,
  createObligation, updateObligation, deleteObligation,
};
