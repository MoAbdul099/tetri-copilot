import api from '../../../lib/api.js';

export const listReimbursements        = (p)     => api.get('/reimbursements', { params: p }).then((r) => r.data.data);
export const getReimbursement          = (id)    => api.get(`/reimbursements/${id}`).then((r) => r.data.data);
export const getReimbursementDashboard = ()      => api.get('/reimbursements/dashboard').then((r) => r.data.data);
export const createReimbursement       = (d)     => api.post('/reimbursements', d).then((r) => r.data.data);
export const approveReimbursement      = (id, d) => api.post(`/reimbursements/${id}/approve`, d).then((r) => r.data.data);
export const rejectReimbursement       = (id, d) => api.post(`/reimbursements/${id}/reject`, d).then((r) => r.data.data);
export const recordReimbursementPayment= (id, d) => api.post(`/reimbursements/${id}/payments`, d).then((r) => r.data.data);
export const cancelReimbursement       = (id)    => api.delete(`/reimbursements/${id}`).then((r) => r.data.data);
