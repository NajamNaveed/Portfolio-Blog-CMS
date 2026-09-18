import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowUpRight, ArrowRight } from 'lucide-react';
import { FaGithub as Github } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { getPublicProjects, getPublicProjectBySlug } from '../../services/projectService';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { trackEvent } from '../../utils/trackEvent';

export default function Projects() {
  const { content } = useSiteContent();
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeProject, setActiveProject] = useState(null);
  const [detailStatus, setDetailStatus] = useState('idle');

  async function fetchProjects() {
    setStatus('loading');
    try {
      const data = await getPublicProjects({ limit: 50 });
      setProjects(data.projects);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useDocumentMeta({
    title: `Projects — ${content.brand?.name || 'Portfolio'}`,
    description: 'A selection of projects showcasing web development, systems design, and real-time communication.',
  });

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.brand?.name]);

  async function openProject(project) {
    setActiveProject(project);
    setDetailStatus('loading');
    trackEvent('project_view', project.title);
    try {
      const data = await getPublicProjectBySlug(project.slug);
      setActiveProject(data.project);
      setDetailStatus('success');
    } catch {
      setDetailStatus('error');
    }
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Selected Work</p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-balance sm:text-6xl">
          Projects
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-paper-dim">
          A selection of projects showcasing web development, systems design, and real-time communication.
        </p>
      </motion.div>

      <div className="mt-14">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'error' && <ErrorMessage message="Couldn't load projects." onRetry={fetchProjects} />}
        {status === 'success' && projects.length === 0 && <EmptyState message="No published projects yet." />}
        {status === 'success' && projects.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <motion.button
                type="button"
                key={project._id || project.slug}
                onClick={() => openProject(project)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group flex flex-col items-start rounded-2xl border border-line bg-ink-soft text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
              >
                <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-t-2xl bg-ink">
                  {project.coverImage ? (
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="font-display text-3xl text-line">{project.title.slice(0, 1)}</span>
                  )}
                  {project.featured && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex w-full flex-1 flex-col gap-3 p-6">
                  <h3 className="font-display text-xl text-paper">{project.title}</h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-stone">{project.description}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {project.technologies?.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-stone"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-medium text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    View details <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <Modal open={Boolean(activeProject)} onClose={() => setActiveProject(null)} labelledBy="project-modal-title">
        {activeProject && (
          <div>
            {activeProject.coverImage && (
              <img
                src={activeProject.coverImage}
                alt={activeProject.title}
                className="mb-5 aspect-[16/9] w-full rounded-xl object-cover"
              />
            )}
            <h3 id="project-modal-title" className="font-display text-2xl text-paper">
              {activeProject.title}
            </h3>
            <p className="mt-3 leading-relaxed text-stone">
              {detailStatus === 'loading' ? 'Loading details…' : activeProject.longDescription || activeProject.description}
            </p>

            {activeProject.technologies?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {activeProject.technologies.map((tech) => (
                  <span key={tech} className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-stone">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {activeProject.githubUrl && (
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:border-accent hover:text-accent"
                >
                  <Github className="size-4" /> View Code
                </a>
              )}
              {activeProject.liveUrl && (
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-ink"
                >
                  <ExternalLink className="size-4" /> Live Demo
                </a>
              )}
              <Link
                to="/contact"
                onClick={() => setActiveProject(null)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-stone hover:text-accent"
              >
                Discuss something similar <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
