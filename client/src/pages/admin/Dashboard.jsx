import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { getAllAdminPosts } from '../../services/postService';
import { getAllAdminProjects } from '../../services/projectService';
import { getAdminMessages } from '../../services/messageService';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [status, setStatus] = useState('loading');

  async function fetchAll() {
    setStatus('loading');
    try {
      const [allPosts, allProjects, messagesRes] = await Promise.all([
        getAllAdminPosts(),
        getAllAdminProjects(),
        getAdminMessages({ status: 'new', limit: 1 }),
      ]);
      setPosts(allPosts);
      setProjects(allProjects);
      setNewMessageCount(messagesRes.pagination?.total || 0);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const publishedPosts = posts.filter((p) => p.status === 'published').length;
  const publishedProjects = projects.filter((p) => p.status === 'published').length;
  const recent = posts.slice(0, 5);

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'error') {
    return <ErrorMessage message="Couldn't load dashboard data." onRetry={fetchAll} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published Posts" value={`${publishedPosts} / ${posts.length}`} />
        <StatCard label="Published Projects" value={`${publishedProjects} / ${projects.length}`} />
        <StatCard label="New Messages" value={newMessageCount} highlight={newMessageCount > 0} />
        <Link to="/admin/site-content" className="rounded-lg border border-dashed border-gray-300 p-5 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900">
          Edit Site Content →
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/admin/posts/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          Create New Post
        </Link>
        <Link
          to="/admin/projects/new"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          Add New Project
        </Link>
        <Link
          to="/admin/messages"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          View Messages
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

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-lg border p-5 ${highlight ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200'}`}>
      <p className={`text-sm ${highlight ? 'text-gray-300' : 'text-gray-500'}`}>{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
