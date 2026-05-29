import api from './api';

export const listWorkspaces  = (params) => api.get('/workspaces', { params }).then((r) => r.data.data);
export const getWorkspace    = (id)     => api.get(`/workspaces/${id}`).then((r) => r.data.data);
export const changeStatus    = (id, status) => api.patch(`/workspaces/${id}/status`, { status }).then((r) => r.data);
export const getUsage        = (id)     => api.get(`/workspaces/${id}/usage`).then((r) => r.data.data);
export const getActivity     = (id)     => api.get(`/workspaces/${id}/activity`).then((r) => r.data.data);
export const addNote         = (id, text) => api.post(`/workspaces/${id}/notes`, { text }).then((r) => r.data);
