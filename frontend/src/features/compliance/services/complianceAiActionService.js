import api from '../../../lib/api.js';

const BASE = '/api/v1/compliance-ai-actions';

export const getDashboard      = ()          => api.get(`${BASE}/dashboard`).then(r => r.data.data);
export const listActions       = (params)    => api.get(`${BASE}/actions`, { params }).then(r => r.data.data);
export const suggestActions    = ()          => api.post(`${BASE}/suggest`).then(r => r.data.data);
export const fromRecommendation = (recommendationId) => api.post(`${BASE}/from-recommendation`, { recommendationId }).then(r => r.data.data);
export const generatePackage   = (body)      => api.post(`${BASE}/generate-package`, body).then(r => r.data.data);
export const generateChecklist = (body)      => api.post(`${BASE}/generate-checklist`, body).then(r => r.data.data);
export const draftReminder     = (occurrenceId) => api.post(`${BASE}/draft-reminder`, { occurrenceId }).then(r => r.data.data);
export const listPackages      = (params)    => api.get(`${BASE}/packages`, { params }).then(r => r.data.data);
export const getPackage        = (id)        => api.get(`${BASE}/packages/${id}`).then(r => r.data.data);
export const listChecklists    = (params)    => api.get(`${BASE}/checklists`, { params }).then(r => r.data.data);
export const getChecklist      = (id)        => api.get(`${BASE}/checklists/${id}`).then(r => r.data.data);
