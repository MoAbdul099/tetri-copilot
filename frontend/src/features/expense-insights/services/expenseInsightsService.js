import api from '../../../lib/api.js';

const BASE = '/api/v1/expense-insights';

export const getDashboard         = ()      => api.get(`${BASE}/dashboard`).then(r => r.data.data);
export const getAnalytics         = (p)     => api.get(`${BASE}/analytics`, { params: p }).then(r => r.data.data);
export const getInsights          = ()      => api.get(`${BASE}/insights`).then(r => r.data.data);
export const generateInsights     = ()      => api.post(`${BASE}/insights/generate`).then(r => r.data.data);
export const getForecast          = ()      => api.get(`${BASE}/forecast`).then(r => r.data.data);
export const getAnomalies         = ()      => api.get(`${BASE}/anomalies`).then(r => r.data.data);
export const detectAnomalies      = ()      => api.post(`${BASE}/anomalies/detect`).then(r => r.data.data);
export const reviewAnomaly        = (id)    => api.post(`${BASE}/anomalies/${id}/review`).then(r => r.data.data);
export const checkDuplicates      = (d)     => api.post(`${BASE}/check-duplicates`, d).then(r => r.data.data);
export const suggestCategory      = (d)     => api.post(`${BASE}/categorize`, d).then(r => r.data.data);
export const naturalLanguageSearch= (d)     => api.post(`${BASE}/search`, d).then(r => r.data.data);
export const getRecommendations   = ()      => api.get(`${BASE}/recommendations`).then(r => r.data.data);
export const getVendors           = ()      => api.get(`${BASE}/vendors`).then(r => r.data.data);
export const generateSummary      = ()      => api.post(`${BASE}/summary`).then(r => r.data.data);
