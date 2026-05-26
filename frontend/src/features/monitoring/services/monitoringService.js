import api from '../../../lib/api';

const monitoringService = {
  getStatus:         ()       => api.get('/api/v1/monitoring/status').then(r => r.data.data),
  getUptimeReport:   ()       => api.get('/api/v1/monitoring/uptime').then(r => r.data.data),
  getMetrics:        (params) => api.get('/api/v1/monitoring/metrics', { params }).then(r => r.data.data),
  listEvents:        (params) => api.get('/api/v1/monitoring/events', { params }).then(r => r.data.data),
  resolveEvent:      (id)     => api.patch(`/api/v1/monitoring/events/${id}/resolve`).then(r => r.data.data),
  listIncidents:     (params) => api.get('/api/v1/monitoring/incidents', { params }).then(r => r.data.data),
  createIncident:    (data)   => api.post('/api/v1/monitoring/incidents', data).then(r => r.data.data),
  updateIncident:    (id, data) => api.patch(`/api/v1/monitoring/incidents/${id}`, data).then(r => r.data.data),
  getLaunchReadiness: ()      => api.get('/api/v1/monitoring/launch-readiness').then(r => r.data.data),
};

export default monitoringService;
