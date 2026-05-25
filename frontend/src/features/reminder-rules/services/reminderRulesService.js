import api from '../../../lib/api.js';

const BASE = '/api/v1/reminder-rules';

export const listReminderRules   = ()       => api.get(BASE).then((r) => r.data.data);
export const getReminderStats    = ()       => api.get(`${BASE}/stats`).then((r) => r.data.data);
export const getReminderRule     = (id)     => api.get(`${BASE}/${id}`).then((r) => r.data.data);
export const createReminderRule  = (data)   => api.post(BASE, data).then((r) => r.data.data);
export const updateReminderRule  = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data.data);
export const deleteReminderRule  = (id)     => api.delete(`${BASE}/${id}`).then((r) => r.data);
