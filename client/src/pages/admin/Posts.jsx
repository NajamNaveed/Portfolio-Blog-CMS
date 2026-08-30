import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getAllAdminPosts, deletePost, publishPost, unpublishPost } from '../../services/postService';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [actionError, setActionError] = useState('');
  const [actioningId, setActioningId] = useState(null);

  async function fetchPosts() {
    setStatus('loading');
    try {
      // Pages through the admin list with a bounded page size rather than
      // requesting an arbitrarily large limit — see postService.js.
      const allPosts = await getAllAdminPosts();
      setPosts(allPosts);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handleDelete(post) {
    const confirmed = window.confirm(`Are you sure you want to delete "${post.title}"?`);
    if (!confirmed) return;

    setActionError('');
    setActioningId(post._id);
    try {
      await deletePost(post._id);
      await fetchPosts();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to delete this post.'));
    } finally {
      setActioningId(null);
    }
  }

  async function handleTogglePublish(post) {
    setActionError('');
    setActioningId(post._id);
    try {
      if (post.status === 'published') {
        await unpublishPost(post._id);
      } else {
        await publishPost(post._id);
      }
      await fetchPosts();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to update this post.'));
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Posts</h1>
        <Link
          to="/admin/posts/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          New Post
        </Link>
      </div>

      {actionError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="mt-6">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'error' && <ErrorMessage message="Couldn't load posts." onRetry={fetchPosts} />}
        {status === 'success' && posts.length === 0 && (
          <EmptyState message="No posts yet. Create your first post to get started." />
        )}

        {status === 'success' && posts.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                    <th className="px-4 py-3 font-medium">Published</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post._id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={post.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(post.updatedAt)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {post.publishedAt ? formatDate(post.publishedAt) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-3">
                          <Link
                            to={`/admin/posts/${post._id}/edit`}
                            className="rounded font-medium text-gray-900 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={actioningId === post._id}
                            onClick={() => handleTogglePublish(post)}
                            className="rounded font-medium text-gray-900 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-50"
                          >
                            {post.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            type="button"
                            disabled={actioningId === post._id}
                            onClick={() => handleDelete(post)}
                            className="rounded font-medium text-red-700 hover:underline focus-visible:ring-2 focus-visible:ring-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-4 md:hidden">
              {posts.map((post) => (
                <div key={post._id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <StatusBadge status={post.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <dt className="font-medium text-gray-400">Updated</dt>
                      <dd>{formatDate(post.updatedAt)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-400">Published</dt>
                      <dd>{post.publishedAt ? formatDate(post.publishedAt) : '—'}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <Link
                      to={`/admin/posts/${post._id}/edit`}
                      className="rounded font-medium text-gray-900 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={actioningId === post._id}
                      onClick={() => handleTogglePublish(post)}
                      className="rounded font-medium text-gray-900 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-50"
                    >
                      {post.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      disabled={actioningId === post._id}
                      onClick={() => handleDelete(post)}
                      className="rounded font-medium text-red-700 hover:underline focus-visible:ring-2 focus-visible:ring-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}