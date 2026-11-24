import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Search, PlusCircle, ChevronDown, Globe, LogIn, LogOut, User as UserIcon
} from 'lucide-react';
import { HERITAGE_CATEGORIES } from '../../data/categories';
import { useAuth } from '../../context/AuthContext';
import { UserProfileModal } from '../profile/UserProfileModal';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    setLangMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'World Map', href: '/map' },
    { label: 'Living Traditions', href: '/explore?type=intangible' },
    { label: 'Oral Archives', href: '/stories' },
    { label: 'Visual Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
  ];

  const supportedLanguages = [
    { code: 'EN', label: 'English (Default)' },
    { code: 'ES', label: 'Español' },
    { code: 'FR', label: 'Français' },
    { code: 'AR', label: 'العربية' },
    { code: 'KN', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'JA', label: '日本語' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-heritage-darker/95 backdrop-blur-md border-b border-heritage-gold/20 py-3 shadow-lg shadow-black/50'
            : 'bg-gradient-to-b from-heritage-darker/95 via-heritage-darker/70 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Identity */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="Samskruthi Home"
            data-cursor="link"
          >
            <div className="relative w-10 h-10 rounded-full border border-heritage-gold/40 bg-heritage-surface flex items-center justify-center overflow-hidden shadow-md group-hover:border-heritage-gold transition-colors">
              <img src="/logo.svg" alt="Samskruthi" className="w-8 h-8 object-contain" />
              <div className="absolute inset-0 bg-heritage-gold/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl sm:text-2xl tracking-wide text-white group-hover:text-heritage-gold transition-colors">
                  Samskruthi
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-white/5 text-heritage-gold border border-heritage-gold/30">
                  Global Archive
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans tracking-wider -mt-0.5">
                World Cultural Heritage Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href.split('?')[0] && (link.href.includes('?') ? location.search === `?${link.href.split('?')[1]}` : location.search === '');
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  data-cursor="link"
                  className={`px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-heritage-gold font-semibold bg-heritage-gold/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Categories Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                onBlur={() => setTimeout(() => setCategoriesDropdownOpen(false), 250)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-slate-300 hover:text-white hover:bg-white/5 ${
                  location.pathname.startsWith('/category') ? 'text-heritage-gold font-semibold bg-heritage-gold/10' : ''
                }`}
                aria-expanded={categoriesDropdownOpen}
                aria-haspopup="true"
                data-cursor="link"
              >
                <span>Streams</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesDropdownOpen ? 'rotate-180 text-heritage-gold' : ''}`} />
              </button>

              {categoriesDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-80 bg-heritage-surface border border-heritage-gold/30 rounded-2xl shadow-2xl p-2 py-3 grid gap-1 backdrop-blur-xl animate-fadeIn z-50"
                  role="menu"
                >
                  <div className="px-3 pb-2 mb-1 border-b border-white/10 text-[10px] uppercase tracking-widest font-bold text-heritage-gold">
                    12 Global Heritage Streams
                  </div>
                  <div className="max-h-[380px] overflow-y-auto pr-1">
                    {HERITAGE_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-xs text-slate-200 hover:text-heritage-gold transition-colors"
                        role="menuitem"
                        data-cursor="link"
                      >
                        <span className="font-medium">{cat.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{cat.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-all shadow-sm focus:ring-2 focus:ring-heritage-gold"
              aria-label="Open global search (Ctrl+K)"
              data-cursor="link"
            >
              <Search className="w-3.5 h-3.5 text-heritage-gold" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline text-[10px] bg-black/40 text-slate-400 px-1 rounded font-mono">⌘K</kbd>
            </button>

            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                onBlur={() => setTimeout(() => setLangMenuOpen(false), 200)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs transition-colors"
                aria-label="Select language"
                data-cursor="link"
              >
                <Globe className="w-3.5 h-3.5 text-heritage-gold" />
                <span className="font-semibold">{currentLang}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-heritage-surface border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                    Interface Language
                  </div>
                  {supportedLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setCurrentLang(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        currentLang === l.code
                          ? 'bg-heritage-gold text-heritage-darker font-bold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{l.label}</span>
                      {currentLang === l.code && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-heritage-gold/30 text-xs transition-colors"
                  aria-label="User profile menu"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-heritage-antique-gold/20 border border-heritage-antique-gold/40 flex items-center justify-center text-heritage-antique-gold font-bold text-[11px]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline font-medium text-slate-200 max-w-[90px] truncate">{user.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#16100c] border border-heritage-antique-gold/30 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-md">
                    <div className="px-2 py-1.5 border-b border-heritage-antique-gold/15 mb-1">
                      <p className="text-xs font-serif font-semibold text-heritage-warm-ivory truncate">{user.name}</p>
                      <p className="text-[10px] text-stone-400 font-sans truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-heritage-antique-gold/15 text-heritage-antique-gold font-sans">
                        {user.role || 'Member'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setProfileModalOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-sans text-heritage-warm-ivory hover:bg-[#251a13] hover:text-heritage-antique-gold transition-colors flex items-center gap-1.5 mb-1"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-heritage-antique-gold" />
                      <span>Profile & Security</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-sans text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c140e] hover:bg-[#251a13] border border-heritage-antique-gold/30 text-heritage-warm-ivory text-xs font-sans font-medium transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-heritage-antique-gold" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Contribute CTA Button */}
            <Link
              to="/contribute"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-heritage-antique-gold hover:bg-[#b58f48] text-[#16100c] font-sans font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap"
              data-cursor="link"
            >
              <PlusCircle className="w-4 h-4 fill-current opacity-85" />
              <span>Share Heritage</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors focus:ring-2 focus:ring-heritage-gold"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-heritage-darker/98 backdrop-blur-2xl lg:hidden pt-24 px-6 pb-10 flex flex-col justify-between overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-heritage-gold">
                Global Navigation
              </span>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-serif py-2 border-b border-white/5 ${
                    location.pathname === link.href ? 'text-heritage-gold font-bold' : 'text-slate-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-heritage-gold">
                Heritage Streams
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HERITAGE_CATEGORIES.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-lg bg-heritage-surface/70 border border-white/5 text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span>{cat.title}</span>
                    <span className="text-heritage-gold text-[10px] font-mono">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-heritage-surface/80 border border-heritage-antique-gold/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-heritage-antique-gold/20 flex items-center justify-center text-heritage-antique-gold font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-heritage-warm-ivory">{user.name}</p>
                    <p className="text-[10px] text-stone-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded bg-red-950/50 text-red-300 text-xs font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#201812] border border-heritage-antique-gold/40 text-heritage-warm-ivory font-medium text-center text-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-heritage-antique-gold" />
                <span>Sign In to Sanctuary</span>
              </Link>
            )}

            <Link
              to="/contribute"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-heritage-saffron to-heritage-gold text-heritage-darker font-bold text-center text-sm shadow-xl"
            >
              + Share a Cultural Heritage Story
            </Link>
            <p className="text-center text-xs text-slate-400">
              Samskruthi • An Open International Cultural Archive
            </p>
          </div>
        </div>
      )}

      {/* User Profile & Account Management Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};
