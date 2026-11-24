import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Settings, CheckCircle2, Shield, ArrowLeft } from 'lucide-react';

export const CookiePolicyPage: React.FC = () => {
  const handleOpenCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('samskruthi:open_cookie_preferences'));
  };

  return (
    <div className="min-h-screen bg-[#0e0a07] text-[#ede6d8] py-16 px-4 sm:px-6 lg:px-8 text-left selection:bg-[#d4af37] selection:text-[#16100c]">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-sans text-[#c5a059] hover:text-[#e6ca85] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Samskruthi</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-[#c5a059]/30 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#241a12] border border-[#c5a059]/40 text-[#d4af37] text-xs font-mono mb-3">
            <Cookie className="w-3.5 h-3.5 text-amber-400" />
            <span>COOKIE TRANSPARENCY DECLARATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f7f2ea] tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 font-sans">
            Effective Date: November 24, 2026 • Last Reviewed: November 2026
          </p>
        </div>

        {/* Interactive Preferences Action */}
        <div className="p-5 rounded-2xl bg-[#1a120c] border border-[#c5a059]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#f7f2ea]">Manage Your Cookie Preferences</h3>
            <p className="text-xs text-stone-300 mt-0.5">
              Review and adjust your granular cookie and local storage permissions at any time.
            </p>
          </div>
          <button
            onClick={handleOpenCookieSettings}
            className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] text-xs font-sans font-bold flex items-center gap-2 transition-all shadow-sm flex-shrink-0"
          >
            <Settings className="w-4 h-4" />
            <span>Open Cookie Settings</span>
          </button>
        </div>

        {/* Section 1: What Are Cookies */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#c5a059]" />
            <span>1. What Are Cookies and Local Storage?</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Cookies and browser Local Storage are small text files or key-value data structures stored directly on your computer or mobile device when you browse websites. They enable platforms to remember your authentication session, accessibility preferences (such as reduced motion), and map filter choices.
          </p>
        </section>

        {/* Section 2: Categories of Storage We Use */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>2. Categories of Storage Used on Samskruthi</span>
          </h2>

          <div className="space-y-3">
            {/* Essential */}
            <div className="p-4 rounded-xl bg-[#1a120c] border border-white/10 space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#f7f2ea]">A. Strictly Necessary &amp; Security (Always Active)</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Required</span>
              </div>
              <p className="text-stone-300">
                Essential for platform security and basic operations. These store your authenticated JSON Web Token (<code className="text-[#c5a059]">samskruthi_token</code>) and active session state so you do not need to re-authenticate on every page reload.
              </p>
            </div>

            {/* Preferences */}
            <div className="p-4 rounded-xl bg-[#1a120c] border border-white/10 space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#f7f2ea]">B. Accessibility &amp; Experience Preferences (Configurable)</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">Optional</span>
              </div>
              <p className="text-stone-300">
                Remembers user interface customizations such as your choice of dark parchment aesthetic, reduced motion settings (<code className="text-[#c5a059]">samskruthi_reduced_motion</code>), and preferred continent filters.
              </p>
            </div>

            {/* Analytics */}
            <div className="p-4 rounded-xl bg-[#1a120c] border border-white/10 space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#f7f2ea]">C. Analytics &amp; Performance Diagnostics (Configurable)</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">Optional</span>
              </div>
              <p className="text-stone-300">
                Helps us measure which historical monuments and educational resources are most visited to improve server load times and map responsiveness. We do not use third-party behavioral advertising tracking cookies.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Browser Controls */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37]">
            3. How to Disable Cookies via Your Browser
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            In addition to our on-site settings, you can configure your browser (Chrome, Firefox, Safari, Edge) to block or erase cookies and local storage. Note that disabling strictly necessary cookies will prevent you from logging into your custodian account.
          </p>
        </section>

        {/* Questions */}
        <section className="space-y-3 border-t border-[#c5a059]/30 pt-6">
          <h2 className="text-xl font-serif font-bold text-[#d4af37]">Contact Our Privacy Officer</h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            If you have questions regarding cookie usage: email <a href="mailto:privacy@samskruthi.org" className="text-[#c5a059] underline">privacy@samskruthi.org</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
