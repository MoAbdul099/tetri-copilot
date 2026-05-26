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
  getAnalytics:    (p)      => api.get(`${base}/analytics`, { params: p }).then(r => r.data.data),

  // Prompt Groups
  listPromptGroups:  ()     => api.get(`${base}/prompts/groups`).then(r => r.data.data),
  createPromptGroup: (d)    => api.post(`${base}/prompts/groups`, d).then(r => r.data.data),

  // Prompts
  listPrompts:       (p)    => api.get(`${base}/prompts`, { params: p }).then(r => r.data.data),
  createPrompt:      (d)    => api.post(`${base}/prompts`, d).then(r => r.data.data),
  getPrompt:         (id)   => api.get(`${base}/prompts/${id}`).then(r => r.data.data),
  updatePrompt:      (id,d) => api.put(`${base}/prompts/${id}`, d).then(r => r.data.data),
  archivePrompt:     (id)   => api.delete(`${base}/prompts/${id}`).then(r => r.data.data),

  // Versions
  listVersions:      (id)   => api.get(`${base}/prompts/${id}/versions`).then(r => r.data.data),
  createVersion:     (id,d) => api.post(`${base}/prompts/${id}/versions`, d).then(r => r.data.data),
  activateVersion:   (id,d) => api.post(`${base}/prompts/${id}/activate`, d).then(r => r.data.data),
  rollbackVersion:   (id,d) => api.post(`${base}/prompts/${id}/rollback`, d).then(r => r.data.data),
  listPromptTests:   (id)   => api.get(`${base}/prompts/${id}/tests`).then(r => r.data.data),
  testPrompt:        (d)    => api.post(`${base}/prompts/test`, d).then(r => r.data.data),

  // Feature Registry
  listFeatures:      ()     => api.get(`${base}/features`).then(r => r.data.data),
  updateFeature:     (id,d) => api.put(`${base}/features/${id}`, d).then(r => r.data.data),
  getFeatureFlags:   (id)   => api.get(`${base}/features/${id}/flags`).then(r => r.data.data),
  setFeatureFlag:    (id,d) => api.post(`${base}/features/${id}/flags`, d).then(r => r.data.data),

  // Conversations (admin)
  listConversations: (p)    => api.get(`${base}/conversations`, { params: p }).then(r => r.data.data),
};

export default aiAdminService;
