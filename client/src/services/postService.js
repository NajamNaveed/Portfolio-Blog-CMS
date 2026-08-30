import api from './api';

export async function getPublicPosts(params = {}) {
  const { data } = await api.get('/posts', { params });
  return data;
}

export async function getPublicPostBySlug(slug) {
  const { data } = await api.get(`/posts/${slug}`);
  return data;
}

export async function getAdminPosts(params = {}) {
  const { data } = await api.get('/admin/posts', { params });
  return data;
}

// Fetches every admin post by paging through the list endpoint with a
// safe, bounded page size, rather than assuming a single large `limit`
// value is accepted by the backend. Used wherever a page needs the full
// set (dashboard counts, the posts table) instead of one page of results.
export async function getAllAdminPosts(pageSize = 50) {
  const first = await getAdminPosts({ page: 1, limit: pageSize });
  let all = first.posts;
  const totalPages = first.pagination?.pages || 1;

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => getAdminPosts({ page: i + 2, limit: pageSize }))
    );
    rest.forEach((res) => {
      all = all.concat(res.posts);
    });
  }

  return all;
}

export async function getAdminPost(id) {
  const { data } = await api.get(`/admin/posts/${id}`);
  return data;
}

export async function createPost(payload) {
  const { data } = await api.post('/admin/posts', payload);
  return data;
}

export async function updatePost(id, payload) {
  const { data } = await api.put(`/admin/posts/${id}`, payload);
  return data;
}

export async function deletePost(id) {
  const { data } = await api.delete(`/admin/posts/${id}`);
  return data;
}

export async function publishPost(id) {
  const { data } = await api.patch(`/admin/posts/${id}/publish`);
  return data;
}

export async function unpublishPost(id) {
  const { data } = await api.patch(`/admin/posts/${id}/unpublish`);
  return data;
}