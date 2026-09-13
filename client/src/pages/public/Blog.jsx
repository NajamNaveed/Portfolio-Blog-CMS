import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { getPublicPosts } from '../../services/postService';
import { useSiteContent } from '../../hooks/useSiteContent';

export default function Blog() {
  const { content } = useSiteContent();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');

  async function fetchPosts() {
    setStatus('loading');
    try {
      const data = await getPublicPosts({ limit: 50 });
      setPosts(data.posts);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    document.title = `Blog — ${content.brand?.name || 'Portfolio'}`;
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.brand?.name]);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Writing</p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-balance sm:text-6xl">
          Blog
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-paper-dim">
          Articles on full stack development, tools, and things learned while building projects.
        </p>
      </motion.div>

      <div className="mt-14">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'error' && <ErrorMessage message="Couldn't load articles." onRetry={fetchPosts} />}
        {status === 'success' && posts.length === 0 && (
          <EmptyState message="No published articles yet. Check back soon." />
        )}
        {status === 'success' && posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <motion.div
                key={post._id || post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
