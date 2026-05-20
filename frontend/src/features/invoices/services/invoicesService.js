import api from '../../../lib/api';

export const listInvoices = async (params = {}) => {
  const { data } = await api.get('/api/v1/invoices', { params });
  return data.data;
};

export const getInvoice = async (id) => {
  const { data } = await api.get(`/api/v1/invoices/${id}`);
  return data.data;
};

export const createInvoice = async (payload) => {
  const { data } = await api.post('/api/v1/invoices', payload);
  return data.data;
};

export const updateInvoice = async (id, payload) => {
  const { data } = await api.put(`/api/v1/invoices/${id}`, payload);
  return data.data;
};

export const deleteInvoice = async (id) => {
  await api.delete(`/api/v1/invoices/${id}`);
};

export const issueInvoice = async (id) => {
  const { data } = await api.post(`/api/v1/invoices/${id}/issue`);
  return data.data;
};

export const cancelInvoice = async (id) => {
  const { data } = await api.post(`/api/v1/invoices/${id}/cancel`);
  return data.data;
};

export const voidInvoice = async (id, reason) => {
  const { data } = await api.post(`/api/v1/invoices/${id}/void`, { reason });
  return data.data;
};

export const duplicateInvoice = async (id) => {
  const { data } = await api.post(`/api/v1/invoices/${id}/duplicate`);
  return data.data;
};

export const getInvoicePdfUrl = (id) => `/api/v1/invoices/${id}/pdf`;

export const downloadInvoicePdf = async (id, invoiceNumber) => {
  const response = await api.get(`/api/v1/invoices/${id}/pdf`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoiceNumber}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const sendInvoice = async (id, payload) => {
  const { data } = await api.post(`/api/v1/invoices/${id}/send`, payload);
  return data.data;
};

export const getInvoiceStats = async () => {
  const { data } = await api.get('/api/v1/invoices/stats');
  return data.data;
};

// Attachments
export const listInvoiceAttachments = async (id) => {
  const { data } = await api.get(`/api/v1/invoices/${id}/attachments`);
  return data.data;
};

export const uploadInvoiceAttachment = async (id, formData) => {
  const { data } = await api.post(`/api/v1/invoices/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const deleteInvoiceAttachment = async (invoiceId, attachmentId) => {
  await api.delete(`/api/v1/invoices/${invoiceId}/attachments/${attachmentId}`);
};

export const getAttachmentDownloadUrl = (invoiceId, attachmentId) =>
  `/api/v1/invoices/${invoiceId}/attachments/${attachmentId}/download`;

// AI
export const suggestDescription = async (draft) => {
  const { data } = await api.post('/api/v1/invoices/suggest-description', { draft });
  return data.data.suggestion;
};
