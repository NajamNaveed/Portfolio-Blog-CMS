import api from './api';

export async function sendContactMessage(payload) {
  const { data } = await api.post('/contact', payload);
  return data;
}

export async function getAdminMessages(params = {}) {
  const { data } = await api.get('/admin/messages', { params });
  return data;
}

export async function getAdminMessage(id) {
  const { data } = await api.get(`/admin/messages/${id}`);
  return data;
}

export async function updateMessageStatus(id, status) {
  const { data } = await api.patch(`/admin/messages/${id}/status`, { status });
  return data;
}

export async function deleteMessage(id) {
  const { data } = await api.delete(`/admin/messages/${id}`);
  return data;
}
