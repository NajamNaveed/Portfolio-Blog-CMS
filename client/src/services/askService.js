import api from './api';

export async function askAboutWork(question, history) {
  const { data } = await api.post('/ask', { question, history });
  return data;
}
