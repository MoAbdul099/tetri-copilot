import api from './api';

const BASE = '/logs';

export const getDashboard     = ()       => api.get(`${BASE}/dashboard`).then((r) => r.data.data);
export const listActivity     = (params) => api.get(`${BASE}/activity`,   { params }).then((r) => r.data.data);
export const listAudit        = (params) => api.get(`${BASE}/audit`,      { params }).then((r) => r.data.data);
export const listSecurity     = (params) => api.get(`${BASE}/security`,   { params }).then((r) => r.data.data);
export const listAi           = (params) => api.get(`${BASE}/ai`,         { params }).then((r) => r.data.data);
export const listCompliance   = (params) => api.get(`${BASE}/compliance`, { params }).then((r) => r.data.data);
export const listAdminActions = (params) => api.get(`${BASE}/admin`,      { params }).then((r) => r.data.data);

export const exportCsv = (type, params = {}) => {
  const token = localStorage.getItem('admin_token');
  const qs = new URLSearchParams({ type, ...params }).toString();
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin'}/logs/export?${qs}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}-logs.csv`;
  // attach auth header via fetch then blob
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const burl = URL.createObjectURL(blob);
      a.href = burl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(burl);
    });
};
