import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col px-4 py-6">
          <Link to="/admin" className="mb-8 px-1 text-lg font-semibold tracking-tight">
            Admin<span className="text-gray-400">.cms</span>
          </Link>
          <AdminSidebar />
          <div className="mt-auto">
            {user?.name && <p className="px-3 text-sm text-gray-500">{user.name}</p>}
            <button
              type="button"
              onClick={logout}
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-900"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 lg:hidden">
          <Link to="/admin" className="text-lg font-semibold tracking-tight" onClick={() => setMenuOpen(false)}>
            Admin<span className="text-gray-400">.cms</span>
          </Link>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-md p-2 text-gray-700 focus-visible:ring-2 focus-visible:ring-gray-900"
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
        </header>

        <div
          id="admin-mobile-menu"
          className={`overflow-hidden border-b border-gray-200 bg-white transition-[max-height] duration-200 lg:hidden ${
            menuOpen ? 'max-h-60' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            <AdminSidebar onNavigate={() => setMenuOpen(false)} />
            {user?.name && <p className="px-3 pt-2 text-sm text-gray-500">{user.name}</p>}
            <button
              type="button"
              onClick={logout}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Log out
            </button>
          </div>
        </div>

        <main className="mx-auto max-w-5xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}