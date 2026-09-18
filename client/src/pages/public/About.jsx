import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FileDown } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { trackEvent } from '../../utils/trackEvent';

const TechGlobe = lazy(() => import('../../components/TechGlobe'));

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function About() {
  const { content } = useSiteContent();
  const { brand, about, focusAreas, skills } = content;
  const flatSkills = (skills || []).flatMap((g) => g.items);

  useDocumentMeta({
    title: `About — ${brand?.name || 'Portfolio'}`,
    description: about?.intro,
  });

  return (
    <div className="flex flex-col gap-24 sm:gap-32">
      <section className="grid gap-10 sm:grid-cols-[1.2fr_0.8fr] sm:items-end">
        <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.55 }}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">About Me</p>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-balance sm:text-6xl">
            The developer behind the code.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper-dim">{about?.intro}</p>
          {about?.resumeUrl && (
            <a
              href={about.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('resume_download')}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-paper transition-all hover:border-accent hover:text-accent"
            >
              <FileDown className="size-4" /> Download Résumé
            </a>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <StatCard value={about?.yearsExperience} suffix="+" label="Years Experience" />
          <StatCard value={about?.projectsCompleted} suffix="+" label="Projects Shipped" />
        </motion.div>
      </section>

      {focusAreas?.length > 0 && (
        <section>
          <SectionHeading eyebrow="Focus" title="My Development Focus" />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {focusAreas.map((area, i) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-line bg-ink-soft p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-[7.5rem] font-semibold leading-none text-accent opacity-0 transition-all duration-500 ease-out group-hover:opacity-20 group-hover:[text-shadow:0_0_50px_rgba(182,255,60,0.65)]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="relative font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="relative mt-3 font-display text-xl text-paper">{area.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-stone">{area.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading eyebrow="Philosophy" title={about?.approachTitle || 'Approach'} />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper-dim">{about?.approachText}</p>
      </section>

      {flatSkills.length > 0 && (
        <section>
          <SectionHeading eyebrow="Stack" title="Technologies" />
          <p className="mt-4 max-w-xl text-sm text-stone">
            Drag to rotate the globe, or hover an icon for its name.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="flex h-[460px] items-center justify-center rounded-3xl border border-line bg-ink-soft"><LoadingSpinner /></div>}>
              <TechGlobe items={flatSkills} />
            </Suspense>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden rounded-3xl border border-line bg-ink-soft px-8 py-16 text-center sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[110px]" />
        <h2 className="relative font-display text-3xl text-balance sm:text-5xl">Want to work together?</h2>
        <Link
          to="/contact"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
        >
          Get in touch <ArrowUpRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}

function StatCard({ value, suffix, label }) {
  return (
    <div className="rounded-2xl border border-line bg-ink-soft p-6">
      <p className="font-display text-4xl text-accent">
        {value || 0}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-stone">{label}</p>
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
