import api from '../../../lib/api.js';

const BASE = '/api/v1/recurring-expenses';

export const listRecurring        = ()       => api.get(BASE).then(r => r.data.data);
export const getRecurring         = (id)     => api.get(`${BASE}/${id}`).then(r => r.data.data);
export const createRecurring      = (d)      => api.post(BASE, d).then(r => r.data.data);
export const updateRecurring      = (id, d)  => api.put(`${BASE}/${id}`, d).then(r => r.data.data);
export const deleteRecurring      = (id)     => api.delete(`${BASE}/${id}`).then(r => r.data.data);
export const generateFromRecurring= (id)     => api.post(`${BASE}/${id}/generate`).then(r => r.data.data);
