import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
];

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `relative rounded py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
      isActive
        ? "font-medium text-gray-900 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-gray-900 after:content-['']"
        : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <header
  className={`sticky top-0 z-40 border-b bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)] transition-all duration-300 ${
    scrolled
      ? 'border-gray-200 bg-white/90 backdrop-blur-sm'
      : 'border-transparent'
  }`}
>
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="rounded text-base font-semibold tracking-tight text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 sm:text-lg"
          onClick={() => setMenuOpen(false)}
        >
          Najam <span className="font-normal text-gray-400">Naveed</span>
        </Link>

        <ul className="hidden items-center gap-8 sm:flex">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} className={linkClass}>
                {label}
              </NavLink>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-900 sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`overflow-hidden transition-[max-height,opacity] duration-300 sm:hidden ${
          menuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-1 border-t border-gray-200 px-4 py-3">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-md px-2 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-gray-900 ${
                    isActive ? 'font-medium text-gray-900' : 'text-gray-500 hover:text-gray-900'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          {isAuthenticated && (
            <li>
              <NavLink
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-2 py-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
              >
                Admin
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}