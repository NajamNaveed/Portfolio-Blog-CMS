import { useEffect } from 'react';

const PROJECTS = [
  {
    title: 'Mart Management System',
    description: 'Full-stack retail management system with inventory, POS, sales, purchases, and analytics.',
    technologies: ['React', 'PHP', 'MySQL'],
    github: 'https://github.com/NajamNaveed/Mart-Management-System',
  },
  {
    title: 'TraceVision',
    description: 'Network path analyzer with live world map visualization, topology graph, and hop statistics.',
    technologies: ['React', 'Node.js', 'Leaflet'],
    github: 'https://github.com/NajamNaveed/TraceVision',
  },
  {
    title: 'Real-Time Chat App',
    description: 'Real-time messaging application enabling instant communication between multiple connected users.',
    technologies: ['Node.js', 'Socket.IO', 'JavaScript'],
    github: 'https://github.com/NajamNaveed/RealTime-Chat-App',
  },
];

const DELAY_CLASSES = ['', 'fade-delay-1', 'fade-delay-2'];

export default function Projects() {
  useEffect(() => {
    document.title = 'Projects — Najam Naveed';
  }, []);

  return (
    <div>
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Projects</h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          A selection of projects showcasing web development, systems design, and real-time communication.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project, i) => (
          <div
            key={project.title}
            className={`animate-fade-up flex flex-col justify-between rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm ${DELAY_CLASSES[i]}`}
          >
            <div>
              <h3 className="font-semibold text-gray-900">{project.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{project.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label={`View ${project.title} on GitHub`}
            >
              <span>View on GitHub</span>
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}