import api from '../../../lib/api';

const BASE = '/notifications';

export const listNotifications    = (params) => api.get(BASE, { params }).then((r) => r.data.data);
export const getUnreadCount       = ()        => api.get(`${BASE}/unread-count`).then((r) => r.data.data);
export const markRead             = (id)      => api.put(`${BASE}/${id}/read`).then((r) => r.data.data);
export const markAllRead          = ()        => api.put(`${BASE}/read-all`).then((r) => r.data);
export const archiveNotification  = (id)      => api.put(`${BASE}/${id}/archive`).then((r) => r.data.data);
export const snoozeNotification   = (id, until) => api.put(`${BASE}/${id}/snooze`, { until }).then((r) => r.data.data);

export const getPreference        = ()        => api.get(`${BASE}/preferences`).then((r) => r.data.data);
export const updatePreference     = (data)    => api.put(`${BASE}/preferences`, data).then((r) => r.data.data);

export const listProfiles         = ()        => api.get(`${BASE}/profiles`).then((r) => r.data.data);
export const createProfile        = (data)    => api.post(`${BASE}/profiles`, data).then((r) => r.data.data);
export const updateProfile        = (id, data) => api.put(`${BASE}/profiles/${id}`, data).then((r) => r.data.data);
export const deleteProfile        = (id)      => api.delete(`${BASE}/profiles/${id}`).then((r) => r.data);
export const addRule              = (profileId, data) => api.post(`${BASE}/profiles/${profileId}/rules`, data).then((r) => r.data.data);
export const updateRule           = (ruleId, data) => api.put(`${BASE}/rules/${ruleId}`, data).then((r) => r.data.data);
export const deleteRule           = (ruleId)  => api.delete(`${BASE}/rules/${ruleId}`).then((r) => r.data);

export const listEscalationProfiles  = ()       => api.get(`${BASE}/escalation-profiles`).then((r) => r.data.data);
export const createEscalationProfile = (data)   => api.post(`${BASE}/escalation-profiles`, data).then((r) => r.data.data);
export const updateEscalationProfile = (id, data) => api.put(`${BASE}/escalation-profiles/${id}`, data).then((r) => r.data.data);
export const addEscalationRule       = (profileId, data) => api.post(`${BASE}/escalation-profiles/${profileId}/rules`, data).then((r) => r.data.data);
export const updateEscalationRule    = (ruleId, data)    => api.put(`${BASE}/escalation-rules/${ruleId}`, data).then((r) => r.data.data);
export const deleteEscalationRule    = (ruleId)  => api.delete(`${BASE}/escalation-rules/${ruleId}`).then((r) => r.data);

export const listEscalations         = (params) => api.get(`${BASE}/escalations`, { params }).then((r) => r.data.data);
export const acknowledgeEscalation   = (id)     => api.put(`${BASE}/escalations/${id}/acknowledge`).then((r) => r.data.data);
