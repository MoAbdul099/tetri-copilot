import api from './api';

const BASE = '/ai';

export const getDashboard       = ()       => api.get(`${BASE}/dashboard`).then((r) => r.data.data);
export const listWorkspaceUsage = (params) => api.get(`${BASE}/workspaces`, { params }).then((r) => r.data.data);
export const listUserUsage      = (params) => api.get(`${BASE}/users`,      { params }).then((r) => r.data.data);
export const getProviderAnalytics = (params) => api.get(`${BASE}/providers`, { params }).then((r) => r.data.data);
export const getCostAnalytics   = ()       => api.get(`${BASE}/costs`).then((r) => r.data.data);
export const listQuotas         = ()       => api.get(`${BASE}/quotas`).then((r) => r.data.data);
export const upsertQuota        = (data)   => api.put(`${BASE}/quotas`, data).then((r) => r.data);
export const deleteQuota        = (id)     => api.delete(`${BASE}/quotas/${id}`).then((r) => r.data);
export const getAbuseAlerts     = ()       => api.get(`${BASE}/abuse`).then((r) => r.data.data);
export const listLogs           = (params) => api.get(`${BASE}/logs`, { params }).then((r) => r.data.data);
