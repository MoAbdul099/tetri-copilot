import api from '../../../lib/api';

// ── Expenses ───────────────────────────────────────────────
export const listExpenses = async (params = {}) => {
  const { data } = await api.get('/api/v1/expenses', { params });
  return data.data;
};

export const getExpense = async (id) => {
  const { data } = await api.get(`/api/v1/expenses/${id}`);
  return data.data;
};

export const createExpense = async (payload) => {
  const { data } = await api.post('/api/v1/expenses', payload);
  return data.data;
};

export const updateExpense = async (id, payload) => {
  const { data } = await api.patch(`/api/v1/expenses/${id}`, payload);
  return data.data;
};

export const deleteExpense = async (id) => {
  await api.delete(`/api/v1/expenses/${id}`);
};

export const duplicateExpense = async (id) => {
  const { data } = await api.post(`/api/v1/expenses/${id}/duplicate`);
  return data.data;
};

export const getExpenseStats = async () => {
  const { data } = await api.get('/api/v1/expenses/stats');
  return data.data;
};

// ── Attachments ────────────────────────────────────────────
export const uploadExpenseAttachment = async (expenseId, formData) => {
  const { data } = await api.post(`/api/v1/expenses/${expenseId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const deleteExpenseAttachment = async (expenseId, attachmentId) => {
  await api.delete(`/api/v1/expenses/${expenseId}/attachments/${attachmentId}`);
};

export const getAttachmentDownloadUrl = (expenseId, attachmentId) =>
  `/api/v1/expenses/${expenseId}/attachments/${attachmentId}/download`;

// ── Export ─────────────────────────────────────────────────
export const exportExpensesCsv = async (params = {}) => {
  const response = await api.get('/api/v1/expenses/export/csv', { params, responseType: 'blob' });
  triggerDownload(response.data, 'expenses.csv', 'text/csv');
};

export const exportExpensesXlsx = async (params = {}) => {
  const response = await api.get('/api/v1/expenses/export/xlsx', {
    params,
    responseType: 'blob',
  });
  triggerDownload(
    response.data,
    'expenses.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
};

function triggerDownload(blob, filename, type) {
  const url = window.URL.createObjectURL(new Blob([blob], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ── Categories ─────────────────────────────────────────────
export const listCategories = async (params = {}) => {
  const { data } = await api.get('/api/v1/expense-categories', { params });
  return data.data;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/api/v1/expense-categories', payload);
  return data.data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.patch(`/api/v1/expense-categories/${id}`, payload);
  return data.data;
};

export const archiveCategory = async (id) => {
  const { data } = await api.post(`/api/v1/expense-categories/${id}/archive`);
  return data.data;
};

export const restoreCategory = async (id) => {
  const { data } = await api.post(`/api/v1/expense-categories/${id}/restore`);
  return data.data;
};

export const seedDefaultCategories = async () => {
  const { data } = await api.post('/api/v1/expense-categories/seed-defaults');
  return data.data;
};

// ── Suppliers ──────────────────────────────────────────────
export const listSuppliers = async (params = {}) => {
  const { data } = await api.get('/api/v1/suppliers', { params });
  return data.data;
};

export const getSupplier = async (id) => {
  const { data } = await api.get(`/api/v1/suppliers/${id}`);
  return data.data;
};

export const createSupplier = async (payload) => {
  const { data } = await api.post('/api/v1/suppliers', payload);
  return data.data;
};

export const updateSupplier = async (id, payload) => {
  const { data } = await api.patch(`/api/v1/suppliers/${id}`, payload);
  return data.data;
};

export const archiveSupplier = async (id) => {
  const { data } = await api.post(`/api/v1/suppliers/${id}/archive`);
  return data.data;
};

export const restoreSupplier = async (id) => {
  const { data } = await api.post(`/api/v1/suppliers/${id}/restore`);
  return data.data;
};

// ── AI Categorization ──────────────────────────────────────
export const aiCategorize = async (payload) => {
  const { data } = await api.post('/api/v1/expenses/ai/categorize', payload);
  return data.data;
};

export const aiAccept = async (payload) => {
  const { data } = await api.post('/api/v1/expenses/ai/accept', payload);
  return data.data;
};

export const aiReject = async (payload) => {
  const { data } = await api.post('/api/v1/expenses/ai/reject', payload);
  return data.data;
};

export const aiGetHistory = async (params = {}) => {
  const { data } = await api.get('/api/v1/expenses/ai/history', { params });
  return data.data;
};

export const aiGetExpenseHistory = async (expenseId) => {
  const { data } = await api.get(`/api/v1/expenses/ai/${expenseId}/history`);
  return data.data;
};

export const aiGetSettings = async () => {
  const { data } = await api.get('/api/v1/expenses/ai/settings');
  return data.data;
};

export const aiUpdateSettings = async (payload) => {
  const { data } = await api.patch('/api/v1/expenses/ai/settings', payload);
  return data.data;
};

// Namespace object for dynamic import in AiCategorizationPanel
export const expensesService = { aiAccept, aiReject };
