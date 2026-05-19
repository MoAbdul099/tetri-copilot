import api from '../../../lib/api';

export const listCustomers = async (params = {}) => {
  const { data } = await api.get('/api/v1/customers', { params });
  return data.data;
};

export const getCustomer = async (id) => {
  const { data } = await api.get(`/api/v1/customers/${id}`);
  return data.data.customer;
};

export const createCustomer = async (payload) => {
  const { data } = await api.post('/api/v1/customers', payload);
  return data.data.customer;
};

export const updateCustomer = async (id, payload) => {
  const { data } = await api.put(`/api/v1/customers/${id}`, payload);
  return data.data.customer;
};

export const archiveCustomer = async (id) => {
  const { data } = await api.patch(`/api/v1/customers/${id}/archive`);
  return data.data.customer;
};

export const restoreCustomer = async (id) => {
  const { data } = await api.patch(`/api/v1/customers/${id}/restore`);
  return data.data.customer;
};

// Contacts
export const listContacts = async (customerId) => {
  const { data } = await api.get(`/api/v1/customers/${customerId}/contacts`);
  return data.data.contacts;
};

export const createContact = async (customerId, payload) => {
  const { data } = await api.post(`/api/v1/customers/${customerId}/contacts`, payload);
  return data.data.contact;
};

export const updateContact = async (customerId, contactId, payload) => {
  const { data } = await api.put(`/api/v1/customers/${customerId}/contacts/${contactId}`, payload);
  return data.data.contact;
};

export const setPrimaryContact = async (customerId, contactId) => {
  const { data } = await api.patch(`/api/v1/customers/${customerId}/contacts/${contactId}/set-primary`);
  return data.data.contact;
};

export const deactivateContact = async (customerId, contactId) => {
  const { data } = await api.patch(`/api/v1/customers/${customerId}/contacts/${contactId}/deactivate`);
  return data.data.contact;
};

export const reactivateContact = async (customerId, contactId) => {
  const { data } = await api.patch(`/api/v1/customers/${customerId}/contacts/${contactId}/reactivate`);
  return data.data.contact;
};

export const deleteContact = async (customerId, contactId) => {
  await api.delete(`/api/v1/customers/${customerId}/contacts/${contactId}`);
};

// Notes
export const listNotes = async (customerId) => {
  const { data } = await api.get(`/api/v1/customers/${customerId}/notes`);
  return data.data.notes;
};

export const createNote = async (customerId, noteText) => {
  const { data } = await api.post(`/api/v1/customers/${customerId}/notes`, { noteText });
  return data.data.note;
};

export const updateNote = async (noteId, noteText) => {
  const { data } = await api.put(`/api/v1/customers/notes/${noteId}`, { noteText });
  return data.data.note;
};

export const deleteNote = async (noteId) => {
  await api.delete(`/api/v1/customers/notes/${noteId}`);
};

// Attachments
export const listAttachments = async (customerId) => {
  const { data } = await api.get(`/api/v1/customers/${customerId}/attachments`);
  return data.data.attachments;
};

export const uploadAttachment = async (customerId, formData) => {
  const { data } = await api.post(`/api/v1/customers/${customerId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.attachment;
};

export const updateAttachmentMeta = async (attachmentId, payload) => {
  const { data } = await api.put(`/api/v1/customers/attachments/${attachmentId}`, payload);
  return data.data.attachment;
};

export const deleteAttachmentApi = async (attachmentId) => {
  await api.delete(`/api/v1/customers/attachments/${attachmentId}`);
};

export const getAttachmentDownloadUrl = (attachmentId) =>
  `/api/v1/customers/attachments/${attachmentId}/download`;

// Tags
export const listTags = async () => {
  const { data } = await api.get('/api/v1/customers/tags');
  return data.data.tags;
};

export const createTag = async (payload) => {
  const { data } = await api.post('/api/v1/customers/tags', payload);
  return data.data.tag;
};

export const assignTag = async (customerId, tagId) => {
  const { data } = await api.post(`/api/v1/customers/${customerId}/tags`, { tagId });
  return data.data.tag;
};

export const removeTag = async (customerId, tagId) => {
  await api.delete(`/api/v1/customers/${customerId}/tags/${tagId}`);
};

// Import / Export
export const importCustomers = async (formData) => {
  const { data } = await api.post('/api/v1/customers/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.results;
};

export const exportCustomers = async (format = 'csv') => {
  const response = await api.get('/api/v1/customers/export', {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
};
