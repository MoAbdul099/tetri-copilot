import api from '../../../lib/api.js';

export const listReimbursements        = (p)     => api.get('/api/v1/reimbursements', { params: p }).then((r) => r.data.data);
export const getReimbursement          = (id)    => api.get(`/api/v1/reimbursements/${id}`).then((r) => r.data.data);
export const getReimbursementDashboard = ()      => api.get('/api/v1/reimbursements/dashboard').then((r) => r.data.data);
export const createReimbursement       = (d)     => api.post('/api/v1/reimbursements', d).then((r) => r.data.data);
export const approveReimbursement      = (id, d) => api.post(`/api/v1/reimbursements/${id}/approve`, d).then((r) => r.data.data);
export const rejectReimbursement       = (id, d) => api.post(`/api/v1/reimbursements/${id}/reject`, d).then((r) => r.data.data);
export const recordReimbursementPayment= (id, d) => api.post(`/api/v1/reimbursements/${id}/payments`, d).then((r) => r.data.data);
export const cancelReimbursement       = (id)    => api.delete(`/api/v1/reimbursements/${id}`).then((r) => r.data.data);
