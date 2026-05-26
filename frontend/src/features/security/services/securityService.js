import api from '../../../lib/api';

const base = '/api/v1/security';

const securityService = {
  getDashboard:      ()             => api.get(`${base}/dashboard`).then((r) => r.data.data),
  listAlerts:        (params = {})  => api.get(`${base}/alerts`, { params }).then((r) => r.data.data),
  getAlert:          (id)           => api.get(`${base}/alerts/${id}`).then((r) => r.data.data),
  acknowledgeAlert:  (id, notes)    => api.post(`${base}/alerts/${id}/acknowledge`, { notes }).then((r) => r.data),
  investigateAlert:  (id, notes)    => api.post(`${base}/alerts/${id}/investigate`, { notes }).then((r) => r.data),
  resolveAlert:      (id, notes)    => api.post(`${base}/alerts/${id}/resolve`, { notes }).then((r) => r.data),
  dismissAlert:      (id, notes)    => api.post(`${base}/alerts/${id}/dismiss`, { notes }).then((r) => r.data),
  falsePositive:     (id, notes)    => api.post(`${base}/alerts/${id}/false-positive`, { notes }).then((r) => r.data),
  listEvents:        (params = {})  => api.get(`${base}/events`, { params }).then((r) => r.data.data),
  listRules:         ()             => api.get(`${base}/rules`).then((r) => r.data.data),
  updateRule:        (id, data)     => api.patch(`${base}/rules/${id}`, data).then((r) => r.data),
};

export default securityService;
