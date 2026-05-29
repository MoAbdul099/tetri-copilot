import api from './api';

export const listUsers      = (params) => api.get('/users', { params }).then((r) => r.data.data);
export const getUser        = (id)     => api.get(`/users/${id}`).then((r) => r.data.data);
export const changeStatus   = (id, status) => api.patch(`/users/${id}/status`, { status }).then((r) => r.data);
export const getActivity    = (id)     => api.get(`/users/${id}/activity`).then((r) => r.data.data);
export const getSecurity    = (id)     => api.get(`/users/${id}/security`).then((r) => r.data.data);
export const addNote        = (id, text) => api.post(`/users/${id}/notes`, { text }).then((r) => r.data);
