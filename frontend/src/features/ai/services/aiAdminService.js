import api from '../../../lib/api';

const base = '/api/admin/ai';

const aiAdminService = {
  // Providers
  listProviders:   ()       => api.get(`${base}/providers`).then(r => r.data.data),
  updateProvider:  (id, d)  => api.put(`${base}/providers/${id}`, d).then(r => r.data.data),
  deleteProvider:  (id)     => api.delete(`${base}/providers/${id}`).then(r => r.data.data),

  // Models
  listModels:      (p)      => api.get(`${base}/models`, { params: p }).then(r => r.data.data),
  createModel:     (d)      => api.post(`${base}/models`, d).then(r => r.data.data),
  updateModel:     (id, d)  => api.put(`${base}/models/${id}`, d).then(r => r.data.data),

  // Config
  getConfig:       ()       => api.get(`${base}/config`).then(r => r.data.data),
  updateConfig:    (d)      => api.put(`${base}/config`, d).then(r => r.data.data),

  // Quotas
  listQuotas:      ()       => api.get(`${base}/quotas`).then(r => r.data.data),
  upsertQuota:     (d)      => api.post(`${base}/quotas`, d).then(r => r.data.data),

  // Dashboards
  getUsage:        (p)      => api.get(`${base}/usage`, { params: p }).then(r => r.data.data),
  getCosts:        ()       => api.get(`${base}/costs`).then(r => r.data.data),
  getHealth:       ()       => api.get(`${base}/health`).then(r => r.data.data),
  triggerHealth:   ()       => api.post(`${base}/health/check`).then(r => r.data.data),
};

export default aiAdminService;
