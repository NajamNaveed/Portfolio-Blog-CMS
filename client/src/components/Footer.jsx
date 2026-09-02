import { Link } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
];

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/NajamNaveed',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
        <path d="M12 2C6.477 2 2 6.586 2 12.253c0 4.532 2.865 8.375 6.839 9.733.5.096.682-.22.682-.49 0-.24-.008-1.04-.013-1.886-2.782.62-3.369-1.214-3.369-1.214-.455-1.186-1.11-1.502-1.11-1.502-.908-.64.069-.627.069-.627 1.004.072 1.532 1.06 1.532 1.06.892 1.57 2.34 1.116 2.91.853.09-.665.35-1.116.636-1.373-2.22-.26-4.555-1.14-4.555-5.073 0-1.12.39-2.035 1.03-2.753-.104-.26-.446-1.305.098-2.72 0 0 .84-.277 2.75 1.052A9.3 9.3 0 0 1 12 6.932a9.3 9.3 0 0 1 2.504.35c1.909-1.329 2.747-1.052 2.747-1.052.546 1.415.203 2.46.1 2.72.64.718 1.028 1.633 1.028 2.753 0 3.943-2.339 4.81-4.566 5.066.359.32.678.95.678 1.915 0 1.383-.012 2.497-.012 2.837 0 .273.18.59.688.49C19.14 20.624 22 16.784 22 12.253 22 6.586 17.523 2 12 2Z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'http://www.linkedin.com/in/najam-naveed-96bb9437a',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
        <path d="M20.452 3H3.548A.548.548 0 0 0 3 3.548v16.904c0 .302.246.548.548.548h16.904a.548.548 0 0 0 .548-.548V3.548A.548.548 0 0 0 20.452 3ZM8.337 18.337H5.663V9.75h2.674v8.587ZM7 8.577A1.548 1.548 0 1 1 7 5.48a1.548 1.548 0 0 1 0 3.097Zm11.354 9.76H15.68v-4.178c0-.996-.018-2.278-1.388-2.278-1.39 0-1.603 1.085-1.603 2.206v4.25h-2.674V9.75h2.567v1.174h.036c.357-.676 1.23-1.389 2.532-1.389 2.709 0 3.204 1.782 3.204 4.1v4.702Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-gray-900">Najam Naveed</p>
          <p className="text-sm text-gray-500">Full Stack Developer</p>
        </div>
        <div className="flex flex-col gap-4 sm:items-end">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-4 text-sm">
              {links.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="rounded text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex gap-3" aria-label="Professional social links">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Najam Naveed's ${label} profile`}
                title={`Visit Najam Naveed's ${label} profile`}
                className="rounded text-gray-500 transition-colors duration-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Najam Naveed. Built with the MERN stack.
      </p>
    </footer>
  );
}
