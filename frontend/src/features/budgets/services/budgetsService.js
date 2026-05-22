import api from '../../../lib/api.js';

const BASE = '/api/v1/budgets';

export const listBudgets    = ()       => api.get(BASE).then(r => r.data.data);
export const getBudget      = (id)     => api.get(`${BASE}/${id}`).then(r => r.data.data);
export const getMonitoring  = ()       => api.get(`${BASE}/monitoring`).then(r => r.data.data);
export const createBudget   = (d)      => api.post(BASE, d).then(r => r.data.data);
export const updateBudget   = (id, d)  => api.put(`${BASE}/${id}`, d).then(r => r.data.data);
export const deleteBudget   = (id)     => api.delete(`${BASE}/${id}`).then(r => r.data.data);
