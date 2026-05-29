import api from './api';

export const getOverview       = () => api.get('/dashboard').then((r) => r.data.data);
export const getOrganizations  = () => api.get('/dashboard/organizations').then((r) => r.data.data);
export const getUsers          = () => api.get('/dashboard/users').then((r) => r.data.data);
export const getSubscriptions  = () => api.get('/dashboard/subscriptions').then((r) => r.data.data);
export const getAi             = () => api.get('/dashboard/ai').then((r) => r.data.data);
export const getCompliance     = () => api.get('/dashboard/compliance').then((r) => r.data.data);
export const getStorage        = () => api.get('/dashboard/storage').then((r) => r.data.data);
export const getActivity       = () => api.get('/dashboard/activity').then((r) => r.data.data);

export function exportCsv() {
  const token = localStorage.getItem('admin_token');
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin';
  const url  = `${base}/dashboard/export`;
  const a = document.createElement('a');
  a.href = url;
  // Token auth via header not possible for direct link; use query param workaround
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = `platform-dashboard-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(href);
    });
}
