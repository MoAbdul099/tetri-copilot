import api from '../../../lib/api';

const BASE = '/api/v1/dashboard';

const dashboardService = {
  getSummary:       ()           => api.get(`${BASE}/summary`).then((r) => r.data.data),
  getFinancial:     (period)     => api.get(`${BASE}/financial`, { params: { period } }).then((r) => r.data.data),
  getReceivables:   ()           => api.get(`${BASE}/receivables`).then((r) => r.data.data),
  getExpenses:      ()           => api.get(`${BASE}/expenses`).then((r) => r.data.data),
  getCompliance:    ()           => api.get(`${BASE}/compliance`).then((r) => r.data.data),
  getNotifications: ()           => api.get(`${BASE}/notifications`).then((r) => r.data.data),
  getActivity:      (limit = 20) => api.get(`${BASE}/activity`, { params: { limit } }).then((r) => r.data.data),
  getSubscription:  ()           => api.get(`${BASE}/subscription`).then((r) => r.data.data),
  getTasks:         ()           => api.get(`${BASE}/tasks`).then((r) => r.data.data),
  getPreferences:   ()           => api.get(`${BASE}/preferences`).then((r) => r.data.data),
  updatePreferences:(data)       => api.put(`${BASE}/preferences`, data).then((r) => r.data.data),
};

export default dashboardService;
