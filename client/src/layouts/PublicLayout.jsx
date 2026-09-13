import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);

  return (
    <div className="grain relative flex min-h-screen flex-col bg-ink text-paper">
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:px-8 sm:py-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
