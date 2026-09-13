import api from './api';

export async function getSiteContent() {
  const { data } = await api.get('/site-content');
  return data.content;
}

export async function getAdminSiteContent() {
  const { data } = await api.get('/admin/site-content');
  return data.content;
}

export async function updateSiteContent(payload) {
  const { data } = await api.put('/admin/site-content', payload);
  return data.content;
}
