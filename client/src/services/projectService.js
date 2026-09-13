import api from './api';

export async function getPublicProjects(params = {}) {
  const { data } = await api.get('/projects', { params });
  return data;
}

export async function getPublicProjectBySlug(slug) {
  const { data } = await api.get(`/projects/${slug}`);
  return data;
}

export async function getAdminProjects(params = {}) {
  const { data } = await api.get('/admin/projects', { params });
  return data;
}

export async function getAllAdminProjects(pageSize = 50) {
  const first = await getAdminProjects({ page: 1, limit: pageSize });
  let all = first.projects;
  const totalPages = first.pagination?.pages || 1;

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => getAdminProjects({ page: i + 2, limit: pageSize }))
    );
    rest.forEach((res) => {
      all = all.concat(res.projects);
    });
  }

  return all;
}

export async function getAdminProject(id) {
  const { data } = await api.get(`/admin/projects/${id}`);
  return data;
}

export async function createProject(payload) {
  const { data } = await api.post('/admin/projects', payload);
  return data;
}

export async function updateProject(id, payload) {
  const { data } = await api.put(`/admin/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id) {
  const { data } = await api.delete(`/admin/projects/${id}`);
  return data;
}

export async function publishProject(id) {
  const { data } = await api.patch(`/admin/projects/${id}/publish`);
  return data;
}

export async function unpublishProject(id) {
  const { data } = await api.patch(`/admin/projects/${id}/unpublish`);
  return data;
}
