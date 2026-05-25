import api from '../../../lib/api.js';

const BASE = '/api/v1/announcements';

export const listAnnouncements   = (params) => api.get(BASE, { params }).then((r) => r.data.data);
export const getActiveAnnouncements = () => api.get(`${BASE}/active`).then((r) => r.data.data);
export const getAnnouncementStats   = () => api.get(`${BASE}/stats`).then((r) => r.data.data);
export const getAnnouncement     = (id)    => api.get(`${BASE}/${id}`).then((r) => r.data.data);
export const createAnnouncement  = (data)  => api.post(BASE, data).then((r) => r.data.data);
export const updateAnnouncement  = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data.data);
export const publishAnnouncement = (id)    => api.post(`${BASE}/${id}/publish`).then((r) => r.data.data);
export const archiveAnnouncement = (id)    => api.post(`${BASE}/${id}/archive`).then((r) => r.data.data);
export const deleteAnnouncement  = (id)    => api.delete(`${BASE}/${id}`).then((r) => r.data);
export const markAnnouncementRead = (id)   => api.post(`${BASE}/${id}/read`).then((r) => r.data);
