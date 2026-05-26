import api from '../../../lib/api';

const systemService = {
  getHealth:        ()             => api.get('/api/v1/health').then((r) => r.data.data),
  getDbHealth:      ()             => api.get('/api/v1/health/db').then((r) => r.data.data),
  getStorageHealth: ()             => api.get('/api/v1/health/storage').then((r) => r.data.data),
  getVersion:       ()             => api.get('/api/v1/health/version').then((r) => r.data.data),
  getBuildInfo:     ()             => api.get('/api/v1/system/build-info').then((r) => r.data.data),
  getSystemVersion: ()             => api.get('/api/v1/system/version').then((r) => r.data.data),
  listDeployments:  (params = {})  => api.get('/api/v1/deployments', { params }).then((r) => r.data.data),
  getDeployment:    (id)           => api.get(`/api/v1/deployments/${id}`).then((r) => r.data.data),
  getLatest:        (env)          => api.get(`/api/v1/deployments/latest/${env}`).then((r) => r.data.data),
};

export default systemService;
