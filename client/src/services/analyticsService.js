import api from './api';

export async function getAnalyticsSummary() {
  const { data } = await api.get('/admin/analytics/summary');
  return data;
}
