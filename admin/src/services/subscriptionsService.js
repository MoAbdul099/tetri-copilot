import api from './api';

export const listSubscriptions = (params) => api.get('/subscriptions', { params }).then((r) => r.data.data);
export const getSubscription   = (id)     => api.get(`/subscriptions/${id}`).then((r) => r.data.data);
export const changeStatus      = (id, status) => api.patch(`/subscriptions/${id}/status`, { status }).then((r) => r.data);
export const getRevenue        = ()       => api.get('/subscriptions/revenue').then((r) => r.data.data);
export const getRenewals       = ()       => api.get('/subscriptions/renewals').then((r) => r.data.data);
export const getPlans          = ()       => api.get('/subscriptions/plans').then((r) => r.data.data);
export const updatePlan        = (planId, data) => api.patch(`/subscriptions/plans/${planId}`, data).then((r) => r.data.data);
export const manageTrial       = (id, action, days) => api.patch(`/subscriptions/${id}/trial`, { action, days }).then((r) => r.data);
