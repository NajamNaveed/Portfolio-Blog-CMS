import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';

export default function PostCard({ post }) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(post.coverImage) && !imgError;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
      <Link
        to={`/blog/${post.slug}`}
        className="block aspect-[16/9] w-full overflow-hidden bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-900"
      >
        {showImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4V6z" />
            </svg>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-gray-900">
          <Link to={`/blog/${post.slug}`} className="hover:underline focus-visible:ring-2 focus-visible:ring-gray-900">
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{post.excerpt}</p>

        <div className="flex items-center justify-between pt-2 text-sm">
          <time dateTime={post.publishedAt} className="text-gray-400">
            {formatDate(post.publishedAt)}
          </time>
          <Link
            to={`/blog/${post.slug}`}
            className="font-medium text-gray-900 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            Read Article →
          </Link>
        </div>
      </div>
    </article>
  );
}