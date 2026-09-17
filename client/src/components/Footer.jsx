import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { resolveLucideIcon } from '../utils/iconMap';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
];

export default function Footer() {
  const { content } = useSiteContent();
  const { brand, socialLinks, contact, footer } = content;

  return (
    <footer className="relative border-t border-line bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <p className="font-display text-2xl text-paper">
              {brand?.name}
              <span className="text-accent">.</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone">
              {footer?.tagline || `${brand?.role} building reliable, modern web applications.`}
            </p>
            {contact?.availability && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-stone">
                <span className="size-1.5 animate-pulse-soft rounded-full bg-accent" />
                {contact.availability}
              </div>
            )}
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-stone-dim">Navigate</p>
            <ul className="mt-4 flex flex-col gap-3">
              {links.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-stone transition-colors hover:text-accent">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-stone-dim">Connect</p>
            <ul className="mt-4 flex flex-col gap-3">
              {contact?.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="text-sm text-stone transition-colors hover:text-accent">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact?.location && <li className="text-sm text-stone">{contact.location}</li>}
              {socialLinks?.map(({ label, url, icon }) => {
                const Icon = resolveLucideIcon(icon);
                return (
                  <li key={label}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-sm text-stone transition-colors hover:text-accent"
                    >
                      <Icon className="size-4" />
                      {label}
                      <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-3 px-5 py-6 text-xs text-stone-dim sm:flex-row sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} {brand?.name}. All rights reserved.</p>
          <p className="font-mono">Built with the MERN stack</p>
        </div>
      </div>
    </footer>
  );
}
