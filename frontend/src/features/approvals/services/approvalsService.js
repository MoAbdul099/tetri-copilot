import api from '../../../lib/api.js';

export const submitExpense      = (id)       => api.post(`/api/v1/expenses/${id}/submit`).then((r) => r.data.data);
export const approveExpense     = (id, data) => api.post(`/api/v1/expenses/${id}/approve`, data).then((r) => r.data.data);
export const rejectExpense      = (id, data) => api.post(`/api/v1/expenses/${id}/reject`, data).then((r) => r.data.data);
export const returnExpense      = (id, data) => api.post(`/api/v1/expenses/${id}/return`, data).then((r) => r.data.data);
export const withdrawExpense    = (id)       => api.post(`/api/v1/expenses/${id}/withdraw`).then((r) => r.data.data);
export const getApprovalHistory = (id)       => api.get(`/api/v1/expenses/${id}/approval-history`).then((r) => r.data.data);

export const getApprovalInbox    = ()    => api.get('/api/v1/approvals').then((r) => r.data.data);
export const getApprovalDashboard= ()    => api.get('/api/v1/approvals/dashboard').then((r) => r.data.data);

export const listApprovalRules   = ()    => api.get('/api/v1/approvals/rules').then((r) => r.data.data);
export const createApprovalRule  = (d)   => api.post('/api/v1/approvals/rules', d).then((r) => r.data.data);
export const updateApprovalRule  = (id, d) => api.put(`/api/v1/approvals/rules/${id}`, d).then((r) => r.data.data);
export const deleteApprovalRule  = (id)  => api.delete(`/api/v1/approvals/rules/${id}`).then((r) => r.data.data);
