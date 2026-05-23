import api from '../../../lib/api.js';

const base = () => api.defaults.baseURL || '';

// Read auth token without any module-level dependency.
// window.__clerkTokenGetter is set by setClerkTokenGetter() in api.js,
// which ProtectedLayout and ClerkApiSync both call on mount.
// window.Clerk.session is the Clerk SDK's live session object — always valid when signed in.
async function getToken() {
  if (window.__clerkTokenGetter) {
    const t = await window.__clerkTokenGetter();
    if (t) return t;
  }
  if (window.Clerk?.session) {
    const t = await window.Clerk.session.getToken();
    if (t) return t;
  }
  return null;
}

async function apiFetch(method, path, body) {
  const token = await getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let fetchBody;
  if (body instanceof FormData) {
    fetchBody = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }
  const res = await fetch(`${base()}${path}`, { method, headers, body: fetchBody });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { response: { data }, status: res.status });
  return data.data;
}

function buildQuery(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  if (!entries.length) return '';
  return '?' + new URLSearchParams(entries).toString();
}

export const uploadFiles = (formData) =>
  apiFetch('POST', '/api/v1/files/upload', formData);

export const listFiles = (params) =>
  apiFetch('GET', `/api/v1/files${buildQuery(params)}`);

export const getFile = (id) =>
  apiFetch('GET', `/api/v1/files/${id}`);

export const downloadFile = (id) =>
  `${base()}/api/v1/files/${id}/download`;

export const serveFile = (id) =>
  `${base()}/api/v1/files/${id}/serve`;

export const renameFile = (id, fileName) =>
  apiFetch('PUT', `/api/v1/files/${id}`, { fileName });

export const deleteFile = (id) =>
  apiFetch('DELETE', `/api/v1/files/${id}`);

export const restoreFile = (id) =>
  apiFetch('POST', `/api/v1/files/${id}/restore`);

export const linkFile = (fileId, entityType, entityId) =>
  apiFetch('POST', '/api/v1/files/link', { fileId, entityType, entityId });

export const unlinkFile = (linkId) =>
  apiFetch('DELETE', `/api/v1/files/link/${linkId}`);

export const getEntityFiles = (entityType, entityId) =>
  apiFetch('GET', `/api/v1/files/entity/${entityType}/${entityId}`);
