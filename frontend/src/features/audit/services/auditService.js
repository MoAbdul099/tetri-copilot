import api, { getApiToken, API_BASE_URL } from '../../../lib/api';

const base = '/api/v1/audit';

const auditService = {
  list:              (params = {}) => api.get(base, { params }).then((r) => r.data.data),
  getById:           (id)          => api.get(`${base}/${id}`).then((r) => r.data.data),
  getEntityTrail:    (entityId, params = {}) => api.get(`${base}/entity/${entityId}`, { params }).then((r) => r.data.data),
  getUserTrail:      (userId, params = {})   => api.get(`${base}/user/${userId}`, { params }).then((r) => r.data.data),
  verifyChain:       (entityId = null) => api.get(`${base}/verify`, { params: entityId ? { entityId } : {} }).then((r) => r.data.data),
  setLegalHold:      (id, isLegalHold) => api.patch(`${base}/${id}/legal-hold`, { isLegalHold }).then((r) => r.data),

  async exportCsv(params = {}) {
    const token = await getApiToken();
    const apiBase = API_BASE_URL;
    const qs = new URLSearchParams(params).toString();
    const url = `${apiBase}${base}/export${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}`, 'X-Workspace-Id': localStorage.getItem('tetri_active_workspace') || '' } : {} });
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = 'audit-log.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objUrl);
  },
};

export default auditService;
