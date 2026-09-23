import api from './api';

export async function getJobCriteria() {
  const { data } = await api.get('/admin/jobs/criteria');
  return data.criteria;
}

export async function updateJobCriteria(payload) {
  const { data } = await api.put('/admin/jobs/criteria', payload);
  return data.criteria;
}

export async function getJobs(params = {}) {
  const { data } = await api.get('/admin/jobs', { params });
  return data;
}

export async function updateJobStatus(id, status) {
  const { data } = await api.patch(`/admin/jobs/${id}/status`, { status });
  return data.job;
}

export async function deleteJob(id) {
  const { data } = await api.delete(`/admin/jobs/${id}`);
  return data;
}

export async function blockCompany(id) {
  const { data } = await api.post(`/admin/jobs/${id}/block-company`);
  return data;
}

export async function toggleAutoFetch(enabled) {
  const { data } = await api.patch('/admin/jobs/criteria/auto-fetch', { enabled });
  return data.autoFetchEnabled;
}

export async function deleteAllJobs() {
  const { data } = await api.delete('/admin/jobs/all');
  return data;
}

export async function deleteExpiredJobs() {
  const { data } = await api.delete('/admin/jobs/expired');
  return data;
}

export async function addManualJob(payload) {
  const { data } = await api.post('/admin/jobs/manual', payload);
  return data.job;
}

export async function runJobFetchNow() {
  const { data } = await api.post('/admin/jobs/run');
  return data.summary;
}