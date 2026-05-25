import api from '../../../lib/api.js';

const BASE = '/api/v1/analytics';

const analyticsService = {
  getAnalytics:     ()         => api.get(BASE).then((r) => r.data.data),
  getHealthScore:   ()         => api.get(`${BASE}/health`).then((r) => r.data.data),
  refresh:          ()         => api.post(`${BASE}/refresh`).then((r) => r.data.data),
  listInsights:     (params)   => api.get(`${BASE}/insights`, { params }).then((r) => r.data.data),
  dismissInsight:   (id)       => api.patch(`${BASE}/insights/${id}/dismiss`).then((r) => r.data.data),
  listRiskAlerts:   ()         => api.get(`${BASE}/risks`).then((r) => r.data.data),
  dismissRiskAlert: (id)       => api.patch(`${BASE}/risks/${id}/dismiss`).then((r) => r.data.data),
};

export default analyticsService;
