import axios from 'axios';
import { getActiveWorkspaceId } from './workspace.js';

// Persist the token getter across Vite HMR by storing it on window.
// When HMR replaces this module, the module-level variable resets to null,
// but window.__clerkTokenGetter survives and is restored immediately.
let clerkTokenGetter = window.__clerkTokenGetter || null;

export const setClerkTokenGetter = (getter) => {
  clerkTokenGetter = getter;
  window.__clerkTokenGetter = getter;
};

export const getApiToken = async () => {
  const fn = clerkTokenGetter || window.__clerkTokenGetter || null;
  if (fn) return fn();
  // Last-resort fallback: Clerk JS SDK exposes window.Clerk in browser
  if (typeof window !== 'undefined' && window.Clerk?.session) {
    return window.Clerk.session.getToken();
  }
  return null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const fn = clerkTokenGetter || window.__clerkTokenGetter || null;
  if (fn) {
    const token = await fn();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  const wsId = getActiveWorkspaceId();
  if (wsId) config.headers['X-Workspace-Id'] = wsId;
  return config;
});

export default api;
