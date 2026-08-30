import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { success, token, user }
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data.user;
}

export default { login, getCurrentUser };