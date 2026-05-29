import api from './api';

export const listCountries    = (params) => api.get('/countries', { params }).then((r) => r.data.data);
export const getCountry       = (id)     => api.get(`/countries/${id}`).then((r) => r.data.data);
export const createCountry    = (data)   => api.post('/countries', data).then((r) => r.data.data);
export const updateCountry    = (id, data) => api.put(`/countries/${id}`, data).then((r) => r.data.data);
export const changeStatus     = (id, status) => api.patch(`/countries/${id}/status`, { status }).then((r) => r.data.data);
export const cloneCountry     = (id, newCode, newName) => api.post(`/countries/${id}/clone`, { newCode, newName }).then((r) => r.data.data);
export const getWorkspaces    = (id)     => api.get(`/countries/${id}/workspaces`).then((r) => r.data.data);
export const addHoliday       = (id, data) => api.post(`/countries/${id}/holidays`, data).then((r) => r.data.data);
export const updateHoliday    = (id, hid, data) => api.patch(`/countries/${id}/holidays/${hid}`, data).then((r) => r.data.data);
export const deleteHoliday    = (id, hid) => api.delete(`/countries/${id}/holidays/${hid}`).then((r) => r.data);
