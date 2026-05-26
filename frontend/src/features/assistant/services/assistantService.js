import api from '../../../lib/api';

const base = '/api/v1/assistant';

const assistantService = {
  // Sessions
  listSessions:   (params)   => api.get(`${base}/sessions`, { params }).then(r => r.data.data),
  createSession:  (data)     => api.post(`${base}/sessions`, data).then(r => r.data.data),
  getSession:     (id)       => api.get(`${base}/sessions/${id}`).then(r => r.data.data),
  archiveSession: (id)       => api.delete(`${base}/sessions/${id}`).then(r => r.data.data),

  // Chat
  chat:           (id, msg)  => api.post(`${base}/sessions/${id}/chat`, { message: msg }).then(r => r.data.data),

  // Messages
  getMessages:    (sessionId) => api.get(`${base}/sessions/${sessionId}/messages`).then(r => r.data.data),

  // Feedback
  submitFeedback: (data)     => api.post(`${base}/feedback`, data).then(r => r.data.data),

  // Suggestions & quick prompts
  getSuggestions: ()         => api.get(`${base}/suggestions`).then(r => r.data.data),
  getQuickPrompts:()         => api.get(`${base}/quick-prompts`).then(r => r.data.data),

  // Capabilities
  listCapabilities: ()       => api.get(`${base}/capabilities`).then(r => r.data.data),
};

export default assistantService;
