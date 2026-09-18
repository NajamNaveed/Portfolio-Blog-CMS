import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, ChevronDown } from 'lucide-react';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { getPublicPosts } from '../../services/postService';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { resolveTechIcon } from '../../utils/iconMap';
import { trackEvent } from '../../utils/trackEvent';

function RotatingRoles({ roles }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!roles || roles.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % roles.length), 2600);
    return () => clearInterval(id);
  }, [roles]);

  if (!roles?.length) return null;

  return (
    // Every role occupies the same CSS grid cell, so the grid track
    // auto-sizes to whichever role text is widest/tallest — the
    // container can never end up too small for the current word,
    // which is what was clipping longer roles before.
    <span className="isolate inline-grid align-bottom" style={{ gridTemplateAreas: '"stack"' }}>
      {roles.map((role, i) => (
        <motion.span
          key={role}
          style={{ gridArea: 'stack' }}
          animate={{ opacity: i === index ? 1 : 0, y: i === index ? 0 : 14 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="whitespace-nowrap text-accent"
          aria-hidden={i === index ? undefined : true}
        >
          {role}
        </motion.span>
      ))}
    </span>
  );
}

export default function Home() {
  const { content } = useSiteContent();
  const { hero, focusAreas, skills } = content;
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeFocus, setActiveFocus] = useState(null);

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

  useDocumentMeta({
    title: `${content.brand?.name || 'Portfolio'} — ${content.brand?.role || 'Developer'}`,
    description: hero?.description,
  });

  useEffect(() => {
    fetchFeatured();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.brand?.name]);

  const flatSkills = (skills || []).flatMap((g) => g.items);

  return (
    <div className="flex flex-col gap-16 sm:gap-28 lg:gap-36">
      {/* Hero */}
      <section className="relative flex flex-col items-center gap-6 py-2 text-center sm:py-6 lg:py-8">
        {/* Subtle dot-grid backdrop, faded toward the edges via a radial mask */}
        <div
          className="pointer-events-none absolute inset-0 -z-20 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(var(--color-stone) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse 65% 70% at 50% 40%, black 35%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 65% 70% at 50% 40%, black 35%, transparent 75%)',
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px] sm:size-[420px] lg:size-[560px]" />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-stone"
        >
          <span className="size-1.5 animate-pulse-soft rounded-full bg-accent" />
          {hero?.eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="max-w-4xl font-display text-5xl font-medium leading-[1.05] tracking-tight text-balance sm:text-7xl"
        >
          {hero?.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="font-display text-2xl italic text-stone sm:text-3xl"
        >
          <RotatingRoles roles={hero?.roles} />
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="max-w-2xl text-lg leading-relaxed text-paper-dim"
        >
          {hero?.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="flex flex-wrap justify-center gap-4 pt-2"
        >
          <Link
            to={hero?.primaryCta?.href || '/projects'}
            onClick={() => trackEvent('hero_cta', 'primary')}
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            {hero?.primaryCta?.label || 'View Projects'}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            to={hero?.secondaryCta?.href || '/contact'}
            onClick={() => trackEvent('hero_cta', 'secondary')}
            className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            {hero?.secondaryCta?.label || 'Get In Touch'}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-1 flex items-center gap-2 text-stone-dim"
        >
          <span className="h-px w-10 bg-line" />
          <ChevronDown className="size-4 animate-bounce" />
          <span className="h-px w-10 bg-line" />
        </motion.div>
      </section>

      {/* What I Build */}
      {focusAreas?.length > 0 && (
        <section>
          <SectionHeading eyebrow="Capabilities" title="What I Build" />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {focusAreas.map((area, i) => (
              <motion.button
                type="button"
                key={area.title}
                onClick={() => setActiveFocus(area)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-line bg-ink-soft p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-[7.5rem] font-semibold leading-none text-accent opacity-0 transition-all duration-500 ease-out group-hover:opacity-20 group-hover:[text-shadow:0_0_50px_rgba(182,255,60,0.65)]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="relative font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="relative font-display text-xl text-paper">{area.title}</h3>
                <p className="relative line-clamp-2 text-sm leading-relaxed text-stone">{area.description}</p>
                <span className="relative mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Learn more <ArrowRight className="size-3.5" />
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <Modal open={Boolean(activeFocus)} onClose={() => setActiveFocus(null)} labelledBy="focus-modal-title">
        {activeFocus && (
          <div>
            <h3 id="focus-modal-title" className="font-display text-2xl text-paper">
              {activeFocus.title}
            </h3>
            <p className="mt-3 leading-relaxed text-stone">{activeFocus.description}</p>
            <Link
              to="/contact"
              onClick={() => setActiveFocus(null)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Discuss a project <ArrowUpRight className="size-4" />
            </Link>
          </div>
        )}
      </Modal>

      {/* Technologies marquee */}
      {flatSkills.length > 0 && (
        <section>
          <SectionHeading eyebrow="Toolkit" title="Technologies I Use" />
          <div
            className="relative mt-10 flex flex-col gap-4 overflow-hidden py-2"
            style={{
              WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
              maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
            }}
          >
            <MarqueeRow items={flatSkills} direction="left" duration={32} />
            {flatSkills.length > 4 && (
              <MarqueeRow items={[...flatSkills].reverse()} direction="right" duration={26} />
            )}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section>
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Writing" title="Latest Articles" />
          <Link to="/blog" className="link-underline hidden text-sm font-medium text-stone hover:text-accent sm:inline">
            View all →
          </Link>
        </div>
        <div className="mt-10">
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

      {/* CTA */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-ink-soft px-6 py-14 text-center sm:px-8 sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[110px]" />
        <h2 className="relative font-display text-3xl text-balance sm:text-5xl">
          Have a project in mind?
          <br />
          <span className="text-accent">Let&apos;s build it together.</span>
        </h2>
        <Link
          to="/contact"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
        >
          Start a conversation <ArrowUpRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}

function MarqueeRow({ items, direction, duration }) {
  return (
    <div
      className="flex w-max gap-4 hover:[animation-play-state:paused]"
      style={{
        animation: `${direction === 'left' ? 'marquee' : 'marquee-reverse'} ${duration}s linear infinite`,
      }}
    >
      {[...items, ...items].map((skill, i) => {
        const Icon = resolveTechIcon(skill.icon);
        return (
          <div
            key={`${skill.name}-${i}`}
            className="flex shrink-0 items-center gap-2.5 rounded-full border border-line bg-ink-soft px-4 py-2.5 text-sm text-paper-dim transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:text-paper hover:shadow-[0_0_20px_rgba(182,255,60,0.25)]"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-accent/10">
              <Icon className="size-3.5 text-accent" />
            </span>
            {skill.name}
          </div>
        );
      })}
    </div>
  );
}

function SectionHeading({ eyebrow, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl tracking-tight text-paper sm:text-4xl">{title}</h2>
    </motion.div>
  );
}
