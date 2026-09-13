import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export default function PostCard({ post }) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(post.coverImage) && !imgError;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent/50">
      <Link
        to={`/blog/${post.slug}`}
        className="block aspect-[16/9] w-full overflow-hidden bg-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        {showImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-line">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4V6z" />
            </svg>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-stone">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="line-clamp-2 font-display text-xl leading-snug text-paper">
          <Link to={`/blog/${post.slug}`} className="hover:text-accent focus-visible:ring-2 focus-visible:ring-accent">
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-stone">{post.excerpt}</p>

        <div className="flex items-center justify-between pt-2 text-sm">
          <time dateTime={post.publishedAt} className="text-stone-dim">
            {formatDate(post.publishedAt)}
          </time>
          <Link
            to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent-dim focus-visible:ring-2 focus-visible:ring-accent"
          >
            Read <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
