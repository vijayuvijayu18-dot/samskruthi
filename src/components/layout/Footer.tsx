import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, ShieldCheck, EyeOff, Eye } from 'lucide-react';
import { HERITAGE_CATEGORIES, CONTINENTS } from '../../data/categories';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('samskruthi_reduced_motion') === 'true';
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setSubscribed(true);
    setEmail('');
  };

  const toggleReducedMotion = () => {
    const nextState = !reducedMotion;
    setReducedMotion(nextState);
    localStorage.setItem('samskruthi_reduced_motion', String(nextState));
    if (nextState) {
      document.documentElement.classList.remove('custom-cursor-active');
    }
  };

  return (
    <footer className="bg-heritage-darker border-t border-heritage-gold/20 text-slate-300 relative overflow-hidden">
      {/* Decorative Antique Gold Hairline */}
      <div className="w-full h-px bg-heritage-gold/30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand & Global Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-heritage-gold/40 bg-heritage-surface flex items-center justify-center">
                <img src="/logo.svg" alt="Samskruthi Emblem" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <span className="font-serif font-bold text-2xl text-white tracking-wide">
                  Samskruthi
                </span>
                <span className="block text-xs text-slate-400 font-sans">
                  Universal Digital Heritage Archive
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              An open, international digital sanctuary dedicated to archiving, documenting, and safeguarding human monuments, artisan legacies, languages, oral memories, and living traditions across every continent.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-heritage-gold/90 bg-heritage-surface border border-heritage-gold/20 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Open Cultural Commons • CC BY-SA 4.0 • WCAG AA</span>
            </div>
          </div>

          {/* Continents & Regions */}
          <div>
            <h4 className="text-xs font-semibold text-heritage-gold uppercase tracking-widest mb-4">
              Explore by Continent
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {CONTINENTS.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/explore?continent=${c.slug}`}
                    className="hover:text-heritage-gold transition-colors block py-0.5"
                    data-cursor="link"
                  >
                    {c.name} Heritage
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Heritage Streams */}
          <div>
            <h4 className="text-xs font-semibold text-heritage-gold uppercase tracking-widest mb-4">
              Cultural Streams
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {HERITAGE_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-heritage-gold transition-colors block py-0.5"
                    data-cursor="link"
                  >
                    {cat.shortTitle}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/explore" className="text-heritage-gold hover:underline font-semibold block py-0.5">
                  View All 12 Streams &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Dispatch Bulletin */}
          <div>
            <h4 className="text-xs font-semibold text-heritage-gold uppercase tracking-widest mb-2">
              Global Heritage Dispatch
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Curated monthly discoveries on endangered cultural practices, archaeological breakthroughs, and oral recordings.
            </p>

            {subscribed ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Thank you for subscribing to the international bulletin.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@heritage.org"
                    aria-label="Email address for global heritage bulletin"
                    className="w-full bg-heritage-surface border border-white/15 focus:border-heritage-gold rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to bulletin"
                    className="absolute right-1 top-1 bottom-1 px-2.5 rounded bg-heritage-gold hover:bg-heritage-gold-light text-heritage-darker font-bold text-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {emailError && <p className="text-[11px] text-rose-400">{emailError}</p>}
                <p className="text-[10px] text-slate-300 leading-tight block">
                  By subscribing, you agree to receive research bulletins and accept our{' '}
                  <Link to="/privacy" className="text-heritage-gold underline hover:text-white">
                    Privacy Policy
                  </Link>. Unsubscribe anytime.
                </p>
              </form>
            )}

            {/* Accessibility Settings Toggle */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
              <button
                onClick={toggleReducedMotion}
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors"
                aria-pressed={reducedMotion}
              >
                {reducedMotion ? <Eye className="w-3.5 h-3.5 text-heritage-gold" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{reducedMotion ? 'Reduced Motion: ON' : 'Reduce Motion & Effects'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('samskruthi:open_cookie_preferences'))}
                className="text-xs text-slate-300 hover:text-heritage-gold transition-colors underline"
              >
                Cookie Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Business & Legal Entity Transparency Block */}
        <div className="py-6 border-b border-white/10 text-xs text-slate-300 space-y-1 text-center sm:text-left">
          <p className="font-semibold text-white">Samskruthi Cultural Heritage Foundation</p>
          <p>
            An open, non-profit digital cultural commons initiative • Registered location: Bengaluru, Karnataka, India
            <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
              [TODO: Legal Review — Insert official society / Section 8 registration number upon final statutory certificate issuance]
            </span>
          </p>
          <p>
            General &amp; Support Inquiries:{' '}
            <a href="mailto:support@samskruthi.org" className="text-heritage-gold hover:underline">
              support@samskruthi.org
            </a>{' '}
            • Grievance &amp; Privacy Officer:{' '}
            <a href="mailto:privacy@samskruthi.org" className="text-heritage-gold hover:underline">
              privacy@samskruthi.org
            </a>
          </p>
        </div>

        {/* Bottom Rights & Global Cultural Diversity Statement */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Samskruthi International Archive.</span>
            <span>•</span>
            <span className="text-slate-300">Dedicated to Humanity’s Shared Cultural Memory</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-slate-300">
            <Link to="/about" className="hover:text-heritage-gold transition-colors">
              Charter
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-heritage-gold transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-heritage-gold transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-heritage-gold transition-colors">
              Refund &amp; Free Access
            </Link>
            <span>•</span>
            <Link to="/cookie-policy" className="hover:text-heritage-gold transition-colors">
              Cookie Policy
            </Link>
            <span>•</span>
            <Link to="/data-deletion" className="hover:text-heritage-gold transition-colors">
              Data Deletion
            </Link>
            <span>•</span>
            <Link to="/attribution" className="hover:text-heritage-gold transition-colors">
              Attribution &amp; Licenses
            </Link>
            <span>•</span>
            <Link to="/contribute" className="hover:text-heritage-gold transition-colors">
              Submit Record
            </Link>
            <span>•</span>
            <a href="#main-content" className="hover:text-heritage-gold transition-colors">
              Back to Top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
