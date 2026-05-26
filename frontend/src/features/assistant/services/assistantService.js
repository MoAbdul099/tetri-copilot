import api from '../../../lib/api';
import { getApiToken } from '../../../lib/api';
import { getActiveWorkspaceId } from '../../../lib/workspace';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const base     = '/api/v1/assistant';

const assistantService = {
  // ── Sessions ────────────────────────────────────────────────────────────────
  listSessions:    (params)    => api.get(`${base}/sessions`, { params }).then((r) => r.data.data),
  createSession:   (data)      => api.post(`${base}/sessions`, data).then((r) => r.data.data),
  getSession:      (id)        => api.get(`${base}/sessions/${id}`).then((r) => r.data.data),
  renameSession:   (id, title) => api.patch(`${base}/sessions/${id}`, { title }).then((r) => r.data.data),
  archiveSession:  (id)        => api.patch(`${base}/sessions/${id}/archive`).then((r) => r.data.data),
  restoreSession:  (id)        => api.patch(`${base}/sessions/${id}/restore`).then((r) => r.data.data),
  deleteSession:   (id)        => api.delete(`${base}/sessions/${id}`).then((r) => r.data.data),

  // exportSession returns the URL for a direct file download (authenticated via token in URL not needed — handled via Axios interceptor on separate call)
  getExportUrl:    (id, fmt)   => `${BASE_URL}${base}/sessions/${id}/export?format=${fmt || 'txt'}`,

  // ── Chat ────────────────────────────────────────────────────────────────────
  chat:               (id, msg) => api.post(`${base}/sessions/${id}/chat`,      { message: msg }).then((r) => r.data.data),
  regenerateResponse: (id)      => api.post(`${base}/sessions/${id}/regenerate`).then((r) => r.data.data),

  // ── Streaming chat (SSE via native fetch) ────────────────────────────────────
  async streamChat(sessionId, message, { onChunk, onUserSaved, onDone, onError } = {}) {
    const token = await getApiToken();
    const wsId  = getActiveWorkspaceId();

    let response;
    try {
      response = await fetch(`${BASE_URL}${base}/sessions/${sessionId}/stream`, {
        method:  'POST',
        headers: {
          'Content-Type':    'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(wsId  ? { 'X-Workspace-Id': wsId }           : {}),
        },
        body: JSON.stringify({ message }),
      });
    } catch (err) {
      onError?.(err.message || 'Network error');
      return;
    }

    if (!response.ok) {
      try {
        const errJson = await response.json();
        onError?.(errJson.error || 'Stream request failed');
      } catch {
        onError?.('Stream request failed');
      }
      return;
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          try {
            const event = JSON.parse(json);
            if      (event.type === 'chunk')      onChunk?.(event.text);
            else if (event.type === 'user_saved') onUserSaved?.(event.messageId);
            else if (event.type === 'done')       onDone?.(event);
            else if (event.type === 'error')      onError?.(event.message);
          } catch {}
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // ── Messages ─────────────────────────────────────────────────────────────────
  getMessages:      (sessionId) => api.get(`${base}/sessions/${sessionId}/messages`).then((r) => r.data.data),

  // ── Feedback ─────────────────────────────────────────────────────────────────
  submitFeedback:   (data)      => api.post(`${base}/feedback`, data).then((r) => r.data.data),

  // ── Suggestions & prompts ───────────────────────────────────────────────────
  getSuggestions:   ()          => api.get(`${base}/suggestions`).then((r) => r.data.data),
  getQuickPrompts:  ()          => api.get(`${base}/quick-prompts`).then((r) => r.data.data),
  listCapabilities: ()          => api.get(`${base}/capabilities`).then((r) => r.data.data),
};

export default assistantService;
