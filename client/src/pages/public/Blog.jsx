import { useEffect, useState } from 'react';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { getPublicPosts } from '../../services/postService';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');

  async function fetchPosts() {
    setStatus('loading');
    try {
      const data = await getPublicPosts();
      setPosts(data.posts);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    document.title = 'Blog — Najam Naveed';
    fetchPosts();
  }, []);

  return (
    <div>
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Blog</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Articles on full stack development, tools, and things learned while building projects.
        </p>
      </div>

      <div className="mt-10">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'error' && <ErrorMessage message="Couldn't load articles." onRetry={fetchPosts} />}
        {status === 'success' && posts.length === 0 && (
          <EmptyState message="No published articles yet. Check back soon." />
        )}
        {status === 'success' && posts.length > 0 && (
          <div className="animate-fade-up grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id || post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}