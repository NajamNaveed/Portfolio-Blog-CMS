import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blogs' },
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const linkClass = ({ isActive }) =>
    `link-underline relative py-1 text-sm font-medium tracking-wide transition-colors focus-visible:outline-none ${
      isActive ? 'text-paper' : 'text-stone hover:text-paper'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-line bg-ink/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8 lg:py-5">
        <ul className="hidden items-center gap-8 lg:flex xl:gap-9">
          {links.map(({ to, label }, i) => (
            <motion.li
              key={to}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <NavLink to={to} end={to === '/'} className={linkClass}>
                <span className="font-mono text-[11px] text-accent">0{i + 1}</span>{' '}
                {label}
              </NavLink>
            </motion.li>
          ))}
          {isAuthenticated && (
            <li>
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        <Link
          to="/"
          className="font-display text-lg font-medium tracking-tight text-paper lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          NN<span className="text-accent">.</span>
        </Link>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Link
            to="/contact"
            className="group hidden items-center gap-2 rounded-full border border-line bg-ink-soft px-5 py-2.5 text-sm font-medium text-paper transition-all duration-300 hover:border-accent hover:bg-accent hover:text-ink lg:inline-flex"
          >
            Contact Me
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-line p-2 text-paper transition-colors hover:border-accent lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-ink lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {links.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                        isActive ? 'bg-ink-soft text-accent' : 'text-stone hover:bg-ink-soft hover:text-paper'
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
                    className="block rounded-lg px-3 py-3 text-base font-medium text-stone hover:bg-ink-soft hover:text-paper"
                  >
                    Admin
                  </NavLink>
                </li>
              )}
              <li className="pt-2">
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-ink"
                >
                  Contact Me
                  <ArrowUpRight className="size-4" />
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
