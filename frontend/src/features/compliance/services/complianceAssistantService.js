import api from '../../../lib/api.js';

const BASE = '/api/v1/ai-compliance';

export const getSuggestedQuestions = () =>
  api.get(`${BASE}/suggested-questions`).then(r => r.data.data);

export const getContextSummary = () =>
  api.get(`${BASE}/context-summary`).then(r => r.data.data);

export const listConversations = (params) =>
  api.get(BASE, { params }).then(r => r.data.data);

export const createConversation = (data) =>
  api.post(BASE, data).then(r => r.data.data);

export const getConversation = (id) =>
  api.get(`${BASE}/${id}`).then(r => r.data.data);

export const updateConversation = (id, data) =>
  api.patch(`${BASE}/${id}`, data).then(r => r.data.data);

export const deleteConversation = (id) =>
  api.delete(`${BASE}/${id}`).then(r => r.data);

export const archiveConversation = (id) =>
  api.patch(`${BASE}/${id}/archive`).then(r => r.data.data);

export const sendMessage = (id, message) =>
  api.post(`${BASE}/${id}/chat`, { message }).then(r => r.data.data);

export const submitFeedback = (data) =>
  api.post(`${BASE}/feedback`, data).then(r => r.data.data);

export const exportConversation = (id, format = 'md') =>
  api.get(`${BASE}/${id}/export`, { params: { format }, responseType: 'blob' }).then(r => r.data);
