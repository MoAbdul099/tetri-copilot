import api from '../../../lib/api.js';

const BASE = '/escalation-rules';

export const listEscalationRules    = ()       => api.get(BASE).then((r) => r.data.data);
export const getEscalationStats     = ()       => api.get(`${BASE}/stats`).then((r) => r.data.data);
export const listEscalationInstances = (params) => api.get(`${BASE}/instances`, { params }).then((r) => r.data.data);
export const getEscalationRule      = (id)     => api.get(`${BASE}/${id}`).then((r) => r.data.data);
export const createEscalationRule   = (data)   => api.post(BASE, data).then((r) => r.data.data);
export const updateEscalationRule   = (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data.data);
export const deleteEscalationRule   = (id)     => api.delete(`${BASE}/${id}`).then((r) => r.data);
export const resolveEscalationInstance = (id)  => api.put(`${BASE}/instances/${id}/resolve`).then((r) => r.data.data);
