import api from './api';

export async function createJobShareLink(payload) {
  const { data } = await api.post('/admin/job-shares', payload);
  return data.link;
}

export async function getJobShareLinks() {
  const { data } = await api.get('/admin/job-shares');
  return data.links;
}

export async function deleteJobShareLink(id) {
  const { data } = await api.delete(`/admin/job-shares/${id}`);
  return data;
}

// Public, token-gated — no admin auth header needed/sent.
export async function viewSharedJobs(token, passcode) {
  const { data } = await api.post(`/shared/jobs/${token}`, passcode ? { passcode } : {});
  return data;
}
