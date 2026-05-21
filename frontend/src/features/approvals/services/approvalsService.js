import api from '../../../lib/api.js';

export const submitExpense      = (id)       => api.post(`/expenses/${id}/submit`).then((r) => r.data.data);
export const approveExpense     = (id, data) => api.post(`/expenses/${id}/approve`, data).then((r) => r.data.data);
export const rejectExpense      = (id, data) => api.post(`/expenses/${id}/reject`, data).then((r) => r.data.data);
export const returnExpense      = (id, data) => api.post(`/expenses/${id}/return`, data).then((r) => r.data.data);
export const withdrawExpense    = (id)       => api.post(`/expenses/${id}/withdraw`).then((r) => r.data.data);
export const getApprovalHistory = (id)       => api.get(`/expenses/${id}/approval-history`).then((r) => r.data.data);

export const getApprovalInbox    = ()    => api.get('/approvals').then((r) => r.data.data);
export const getApprovalDashboard= ()    => api.get('/approvals/dashboard').then((r) => r.data.data);

export const listApprovalRules   = ()    => api.get('/approvals/rules').then((r) => r.data.data);
export const createApprovalRule  = (d)   => api.post('/approvals/rules', d).then((r) => r.data.data);
export const updateApprovalRule  = (id, d) => api.put(`/approvals/rules/${id}`, d).then((r) => r.data.data);
export const deleteApprovalRule  = (id)  => api.delete(`/approvals/rules/${id}`).then((r) => r.data.data);
