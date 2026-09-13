import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import { markdownComponents } from '../../utils/markdownComponents';
import { getPublicPostBySlug } from '../../services/postService';
import { useSiteContent } from '../../hooks/useSiteContent';

export default function BlogPost() {
  const { slug } = useParams();
  const { content } = useSiteContent();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | success | error | notfound

  async function fetchPost() {
    setStatus('loading');
    try {
      const data = await getPublicPostBySlug(slug);
      setPost(data.post);
      setStatus('success');
      document.title = `${data.post.title} — ${content.brand?.name || 'Portfolio'}`;
    } catch (err) {
      setStatus(err.response?.status === 404 ? 'notfound' : 'error');
    }
  }

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (status === 'loading') return <LoadingSpinner />;

  if (status === 'notfound') {
    return (
      <div className="animate-fade-in py-16 text-center">
        <h1 className="font-display text-2xl text-paper">Article Not Found</h1>
        <p className="mt-2 text-stone">This article doesn't exist or is no longer published.</p>
        <Link to="/blog" className="mt-6 inline-block text-sm font-medium text-accent hover:text-accent-dim">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return <ErrorMessage message="Couldn't load this article." onRetry={fetchPost} />;
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl"
    >
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone transition-colors hover:text-accent">
        <ArrowLeft className="size-3.5" /> Back to Blog
      </Link>

      <header className="mt-6">
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-stone">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="mt-4 font-display text-3xl leading-tight text-balance text-paper sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-stone">
          {post.author?.name && <span>{post.author.name}</span>}
          {post.author?.name && <span aria-hidden="true">·</span>}
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </div>
      </header>

      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="mt-8 aspect-[16/9] w-full rounded-xl border border-line object-cover"
        />
      )}

      <div className="mt-10">
        <ReactMarkdown components={markdownComponents}>{post.content}</ReactMarkdown>
      </div>
    </motion.article>
  );
}
