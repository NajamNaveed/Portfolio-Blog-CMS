import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { getAllAdminPosts } from '../../services/postService';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');

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

  const total = posts.length;
  const published = posts.filter((p) => p.status === 'published').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;
  const recent = posts.slice(0, 5);

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'error') {
    return <ErrorMessage message="Couldn't load dashboard data." onRetry={fetchPosts} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Posts</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Published</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{published}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{drafts}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/admin/posts/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          Create New Post
        </Link>
        <Link
          to="/admin/posts"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          Manage Posts
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
        <div className="mt-4">
          {recent.length === 0 ? (
            <EmptyState message="No posts yet. Create your first post to get started." />
          ) : (
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {recent.map((post) => (
                <div key={post._id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{post.title}</p>
                    <p className="text-xs text-gray-500">Updated {formatDate(post.updatedAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <StatusBadge status={post.status} />
                    <Link
                      to={`/admin/posts/${post._id}/edit`}
                      className="text-sm font-medium text-gray-900 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}