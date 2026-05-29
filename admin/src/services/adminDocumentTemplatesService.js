import api from './api';

const BASE = '/document-templates';

export const getStats          = ()       => api.get(`${BASE}/stats`).then((r) => r.data.data);
export const listCountries     = ()       => api.get(`${BASE}/countries`).then((r) => r.data.data);
export const list              = (params) => api.get(BASE, { params }).then((r) => r.data.data);
export const getOne            = (id)     => api.get(`${BASE}/${id}`).then((r) => r.data.data);
export const create            = (data)   => api.post(BASE, data).then((r) => r.data);
export const update            = (id, d)  => api.put(`${BASE}/${id}`, d).then((r) => r.data);
export const publish           = (id)     => api.post(`${BASE}/${id}/publish`).then((r) => r.data);
export const archive           = (id)     => api.post(`${BASE}/${id}/archive`).then((r) => r.data);
export const clone             = (id)     => api.post(`${BASE}/${id}/clone`).then((r) => r.data);
export const remove            = (id)     => api.delete(`${BASE}/${id}`).then((r) => r.data);
