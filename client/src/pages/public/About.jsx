import { useEffect } from 'react';
import { SKILL_GROUPS } from '../../utils/skills';

const FOCUS_AREAS = [
  { title: 'Full Stack Web Applications', description: 'Designing and building applications end-to-end — data model, API, and interface.' },
  { title: 'Modern Responsive Interfaces', description: 'Interfaces built with React and Tailwind CSS that hold up across devices.' },
  { title: 'Backend APIs & Databases', description: 'REST APIs with Node.js and Express, backed by MongoDB and MySQL.' },
];

const DELAY_CLASSES = ['', 'fade-delay-1', 'fade-delay-2'];

export default function About() {
  useEffect(() => {
    document.title = 'About — Najam Naveed';
  }, []);

  return (
    <div className="flex flex-col gap-16">
      <section className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">About Me</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
          I'm Najam Naveed, a Full Stack Developer focused on building modern, responsive web
          applications using JavaScript, React, Node.js, Express, PHP, and MongoDB.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">My Development Focus</h2>
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
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Approach</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-gray-600">
          I build applications end-to-end — designing the data model, building a clear REST API,
          and pairing it with a responsive, accessible interface. I favor clean separation between
          frontend and backend, predictable state management, and code that's easy for another
          developer to pick up.
        </p>
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
    </div>
  );
}