import api from './api';

const BASE = '/billing';

export const getDashboard     = ()       => api.get(`${BASE}/dashboard`).then((r) => r.data.data);
export const listEvents        = (params) => api.get(`${BASE}/events`, { params }).then((r) => r.data.data);
export const getEvent          = (id)     => api.get(`${BASE}/events/${id}`).then((r) => r.data.data);
export const listSubscriptions = (params) => api.get(`${BASE}/subscriptions`, { params }).then((r) => r.data.data);
