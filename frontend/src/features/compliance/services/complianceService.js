import api from "../../../lib/api.js";

const q = (params) => {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== "");
  return entries.length ? "?" + new URLSearchParams(entries).toString() : "";
};

export const listJurisdictions = () =>
  api.get("/api/v1/compliance/jurisdictions").then((r) => r.data.data);

export const listAuthorities = (params) =>
  api.get(`/api/v1/compliance/authorities${q(params)}`).then((r) => r.data.data);

export const listCategories = () =>
  api.get("/api/v1/compliance/categories").then((r) => r.data.data);

export const createCategory = (data) =>
  api.post("/api/v1/compliance/categories", data).then((r) => r.data.data);

export const updateCategory = (id, data) =>
  api.put(`/api/v1/compliance/categories/${id}`, data).then((r) => r.data.data);

export const deleteCategory = (id) =>
  api.delete(`/api/v1/compliance/categories/${id}`).then((r) => r.data.data);

export const listPacks = (params) =>
  api.get(`/api/v1/compliance/packs${q(params)}`).then((r) => r.data.data);

export const getPack = (id) =>
  api.get(`/api/v1/compliance/packs/${id}`).then((r) => r.data.data);

export const installPack = (id, data) =>
  api.post(`/api/v1/compliance/packs/${id}/install`, data).then((r) => r.data.data);

export const listTemplates = (params) =>
  api.get(`/api/v1/compliance/templates${q(params)}`).then((r) => r.data.data);

export const getTemplate = (id) =>
  api.get(`/api/v1/compliance/templates/${id}`).then((r) => r.data.data);

export const createTemplate = (data) =>
  api.post("/api/v1/compliance/templates", data).then((r) => r.data.data);

export const updateTemplate = (id, data) =>
  api.put(`/api/v1/compliance/templates/${id}`, data).then((r) => r.data.data);

export const deleteTemplate = (id) =>
  api.delete(`/api/v1/compliance/templates/${id}`).then((r) => r.data.data);

export const generateOccurrences = (id) =>
  api.post(`/api/v1/compliance/templates/${id}/generate`).then((r) => r.data.data);

export const listOccurrences = (params) =>
  api.get(`/api/v1/compliance/occurrences${q(params)}`).then((r) => r.data.data);

export const getOccurrence = (id) =>
  api.get(`/api/v1/compliance/occurrences/${id}`).then((r) => r.data.data);

export const updateOccurrence = (id, data) =>
  api.put(`/api/v1/compliance/occurrences/${id}`, data).then((r) => r.data.data);

export const recordSubmission = (id, data) =>
  api.post(`/api/v1/compliance/occurrences/${id}/submit`, data).then((r) => r.data.data);

export const addComment = (id, body) =>
  api.post(`/api/v1/compliance/occurrences/${id}/comments`, { body }).then((r) => r.data.data);

export const deleteComment = (id, commentId) =>
  api.delete(`/api/v1/compliance/occurrences/${id}/comments/${commentId}`).then((r) => r.data.data);

export const getCalendarEvents = (params) =>
  api.get(`/api/v1/compliance/calendar${q(params)}`).then((r) => r.data.data);

export const getStats = () =>
  api.get("/api/v1/compliance/stats").then((r) => r.data.data);

export const getRecommendations = () =>
  api.get("/api/v1/compliance/recommendations").then((r) => r.data.data);

// Slice 9.3 — Dashboard & Analytics
export const getDashboard            = () => api.get("/api/v1/compliance/dashboard").then((r) => r.data.data);
export const getTrends               = (months = 6) => api.get(`/api/v1/compliance/analytics/trends?months=${months}`).then((r) => r.data.data);
export const getCategoryAnalytics    = () => api.get("/api/v1/compliance/analytics/categories").then((r) => r.data.data);
export const getJurisdictionAnalytics = () => api.get("/api/v1/compliance/analytics/jurisdictions").then((r) => r.data.data);
export const getEscalationAnalytics  = () => api.get("/api/v1/compliance/analytics/escalations").then((r) => r.data.data);
export const getReminderAnalytics    = () => api.get("/api/v1/compliance/analytics/reminders").then((r) => r.data.data);

// Reports
export const getRegisterReport  = (params) => api.get(`/api/v1/compliance/reports/register${q(params)}`).then((r) => r.data.data);
export const getFilingsReport   = (params) => api.get(`/api/v1/compliance/reports/filings${q(params)}`).then((r) => r.data.data);
export const getRenewalsReport  = (days = 90) => api.get(`/api/v1/compliance/reports/renewals?days=${days}`).then((r) => r.data.data);
export const getOverdueReport   = (params) => api.get(`/api/v1/compliance/reports/overdue${q(params)}`).then((r) => r.data.data);
export const exportReport       = (type, filters = {}, format = 'csv') =>
  api.post("/api/v1/compliance/reports/export", { type, filters, format }, { responseType: 'blob' });

// Saved reports
export const listSavedReports   = () => api.get("/api/v1/compliance/reports/saved").then((r) => r.data.data);
export const createSavedReport  = (data) => api.post("/api/v1/compliance/reports/saved", data).then((r) => r.data.data);
export const updateSavedReport  = (id, data) => api.put(`/api/v1/compliance/reports/saved/${id}`, data).then((r) => r.data.data);
export const deleteSavedReport  = (id) => api.delete(`/api/v1/compliance/reports/saved/${id}`).then((r) => r.data.data);
