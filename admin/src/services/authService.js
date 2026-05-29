import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data.data;
}

export async function logout() {
  await api.post('/auth/logout').catch(() => {});
  localStorage.removeItem('admin_token');
}
