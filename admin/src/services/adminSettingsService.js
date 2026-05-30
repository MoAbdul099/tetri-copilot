import api from './api';

const BASE = '/settings';

export const getSettings      = ()          => api.get(BASE).then((r) => r.data.data);
export const updateSettings   = (updates)   => api.put(BASE, { updates }).then((r) => r.data.data);
export const getSecuritySettings = ()       => api.get(`${BASE}/security`).then((r) => r.data.data);
export const listFeatureFlags = ()          => api.get(`${BASE}/feature-flags`).then((r) => r.data.data);
export const updateFeatureFlag = (payload)  => api.put(`${BASE}/feature-flags`, payload).then((r) => r.data.data);
export const setMaintenance   = (payload)   => api.post(`${BASE}/maintenance`, payload).then((r) => r.data.data);
export const getHistory       = (params)    => api.get(`${BASE}/history`, { params }).then((r) => r.data.data);
