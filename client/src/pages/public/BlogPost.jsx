import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import { markdownComponents } from '../../utils/markdownComponents';
import { getPublicPostBySlug } from '../../services/postService';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | success | error | notfound

  async function fetchPost() {
    setStatus('loading');
    try {
      const data = await getPublicPostBySlug(slug);
      setPost(data.post);
      setStatus('success');
      document.title = `${data.post.title} — Najam Naveed`;
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
        <h1 className="text-2xl font-semibold text-gray-900">Article Not Found</h1>
        <p className="mt-2 text-gray-600">This article doesn't exist or is no longer published.</p>
        <Link
          to="/blog"
          className="mt-6 inline-block text-sm font-medium text-gray-900 transition-colors hover:text-gray-600"
        >
          ← Back to Blog
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return <ErrorMessage message="Couldn't load this article." onRetry={fetchPost} />;
  }

  return (
    <article className="animate-fade-up mx-auto max-w-2xl">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <span aria-hidden="true">←</span> Back to Blog
      </Link>

      <header className="mt-6">
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
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
          className="mt-8 aspect-[16/9] w-full rounded-xl object-cover shadow-sm"
        />
      )}

      <div className="mt-10">
        <ReactMarkdown components={markdownComponents}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}