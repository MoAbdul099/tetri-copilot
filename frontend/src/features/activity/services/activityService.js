import api, { API_BASE_URL } from '../../../lib/api';

const base = '/api/v1/activity';

const activityService = {
  list:              (params = {}) => api.get(base, { params }).then((r) => r.data.data),
  getById:           (id)          => api.get(`${base}/${id}`).then((r) => r.data.data),
  getEntityTimeline: (entityId, params = {}) => api.get(`${base}/entity/${entityId}`, { params }).then((r) => r.data.data),
  getMyActivity:     (params = {}) => api.get(`${base}/user/me`, { params }).then((r) => r.data.data),
  getRecent:         (limit = 20)  => api.get(`${base}/recent`, { params: { limit } }).then((r) => r.data.data),
  getExportUrl:      (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `${API_BASE_URL}${base}/export${qs ? `?${qs}` : ''}`;
  },
};

export default activityService;
