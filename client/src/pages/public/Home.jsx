import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { getPublicPosts } from '../../services/postService';
import { SKILL_GROUPS } from '../../utils/skills';

const FOCUS_AREAS = [
  { title: 'Full Stack Web Applications', description: 'Building complete applications end-to-end, from database design through to a polished, responsive interface.' },
  { title: 'Modern Responsive Interfaces', description: 'Building interfaces with React and Tailwind CSS that adapt cleanly across screen sizes.' },
  { title: 'Backend APIs & Databases', description: 'Designing REST APIs with Node.js and Express, backed by MongoDB and MySQL.' },
];

const DELAY_CLASSES = ['', 'fade-delay-1', 'fade-delay-2'];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');

  async function fetchFeatured() {
    setStatus('loading');
    try {
      const data = await getPublicPosts({ page: 1, limit: 3 });
      setPosts(data.posts);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    document.title = 'Najam Naveed — Full Stack Developer';
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col gap-20">
      <section className="flex flex-col items-start gap-6 py-10 sm:py-16">
        <p className="animate-fade-up text-sm font-medium uppercase tracking-widest text-gray-500">
          Full Stack Developer
        </p>
        <h1 className="animate-fade-up fade-delay-1 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Najam Naveed
        </h1>
        <p className="animate-fade-up fade-delay-2 max-w-2xl text-lg leading-relaxed text-gray-600">
          Full Stack Developer focused on building modern, responsive web applications using
          JavaScript, React, Node.js, Express, PHP, and MongoDB.
        </p>
        <div className="animate-fade-up fade-delay-3 flex flex-wrap gap-4 pt-2">
          <Link
            to="/projects"
            className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            View Projects
          </Link>
          <Link
            to="/blog"
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Read Blog
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">What I Build</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {FOCUS_AREAS.map((area, i) => (
            <div
              key={area.title}
              className={`animate-fade-up rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm ${DELAY_CLASSES[i]}`}
            >
              <h3 className="font-semibold text-gray-900">{area.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{area.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Technologies</h2>
        <div className="mt-6 flex flex-col gap-6">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.label}</p>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Latest Articles</h2>
          <Link to="/blog" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
            View all →
          </Link>
        </div>
        <div className="mt-6">
          {status === 'loading' && <LoadingSpinner />}
          {status === 'error' && <ErrorMessage message="Couldn't load articles." onRetry={fetchFeatured} />}
          {status === 'success' && posts.length === 0 && (
            <EmptyState message="No published articles yet. Check back soon." />
          )}
          {status === 'success' && posts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post._id || post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}