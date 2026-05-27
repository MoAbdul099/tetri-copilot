import api from '../../../lib/api.js';

const BASE = '/api/v1/compliance-intelligence';

export const getDashboard          = ()       => api.get(BASE).then(r => r.data.data);
export const runAnalysis           = ()       => api.post(`${BASE}/analyze`).then(r => r.data.data);
export const listRisks             = (params) => api.get(`${BASE}/risks`, { params }).then(r => r.data.data);
export const listRecommendations   = ()       => api.get(`${BASE}/recommendations`).then(r => r.data.data);
export const getHistory            = ()       => api.get(`${BASE}/history`).then(r => r.data.data);
export const generateAiInsights    = ()       => api.post(`${BASE}/insights`).then(r => r.data.data);
export const generateExecSummary   = ()       => api.post(`${BASE}/executive-summary`).then(r => r.data.data);
