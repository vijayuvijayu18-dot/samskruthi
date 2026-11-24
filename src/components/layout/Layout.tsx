import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SearchModal } from '../ui/SearchModal';
import { Preloader } from '../ui/Preloader';

export const Layout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-heritage-dark text-slate-100 relative">
      {/* Skip to Content Link for WCAG Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[999999] px-4 py-2 bg-heritage-gold text-heritage-darker font-bold rounded shadow-lg outline-none"
      >
        Skip to main content
      </a>

      {/* Intro Preloader Animation (Shown once per session) */}
      <Preloader />

      {/* Global Navbar */}
      <Navbar onOpenSearch={() => setSearchOpen(true)} />

      {/* Global Quick Search Overlay */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Main Page Outlet */}
      <main id="main-content" className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

