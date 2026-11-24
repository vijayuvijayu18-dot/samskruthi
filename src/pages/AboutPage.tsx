import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Heart, Sparkles, Globe, CheckCircle2, PlusCircle 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-heritage-surface border border-heritage-gold/30 text-xs text-heritage-gold font-semibold uppercase tracking-widest shadow-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Universal Cultural Heritage Preservation Charter</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-black text-white tracking-tight">
          Safeguarding the Cultural Memory of Humankind
        </h1>
        <p className="text-base sm:text-lg text-heritage-gold/90 font-serif italic">
          "Every culture holds a story worth preserving."
        </p>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
          Samskruthi is an open, global digital sanctuary dedicated to archiving ancient archaeological wonders, living indigenous practices, generational oral histories, folk crafts, and cultural landscapes from every continent.
        </p>
      </div>

      {/* The Core Challenge */}
      <div className="bg-heritage-surface/80 border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Why Global Heritage Preservation is Urgent
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed font-sans">
          <p>
            Across Africa, Asia, Europe, the Americas, and Oceania, thousands of ancient stone monuments, indigenous habitats, and rock-hewn sanctuaries face weathering, climate displacement, and urbanization. Concurrently, centuries of intangible oral lore—Andean agrarian seed-keeper knowledge, West African Griot epics, Pacific island wayfinding oral genealogies, and artisanal metal techniques—face extinction as generational continuity fractures.
          </p>
          <p>
            Traditional academic and museum archives often isolate knowledge behind geographical distances and research paywalls. Samskruthi bridges this divide by creating a living, accessible, and visually captivating digital repository where citizens from all nations can discover and safeguard their collective heritage.
          </p>
        </div>
      </div>

      {/* Four Pillars Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-white text-center">
          The Four Pillars of Samskruthi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-heritage-surface border border-white/10 rounded-2xl p-6 space-y-3 hover:border-heritage-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-heritage-terracotta/20 border border-heritage-terracotta/40 flex items-center justify-center text-heritage-terracotta">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">
              1. Historical & Archaeological Integrity
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every archaeological site, ancient manuscript, and monument is contextualized with verifiable surveys, epigraphical data, and conservation status indicators.
            </p>
          </div>

          <div className="bg-heritage-surface border border-white/10 rounded-2xl p-6 space-y-3 hover:border-heritage-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-heritage-gold/20 border border-heritage-gold/40 flex items-center justify-center text-heritage-gold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">
              2. Indigenous & Community Custodianship
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Heritage belongs to the custodians who safeguard it. We prioritize verbatim recollections of master artisans, indigenous tribal elders, and local communities with reverent attribution.
            </p>
          </div>

          <div className="bg-heritage-surface border border-white/10 rounded-2xl p-6 space-y-3 hover:border-heritage-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">
              3. Pan-Continental Representation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              True cultural preservation spans the globe. Samskruthi provides equitable representation across Africa, Asia, Europe, the Americas, and Oceania without prioritizing any single civilization.
            </p>
          </div>

          <div className="bg-heritage-surface border border-white/10 rounded-2xl p-6 space-y-3 hover:border-heritage-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-heritage-peacock/20 border border-heritage-peacock/40 flex items-center justify-center text-heritage-peacock">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">
              4. Open Cultural Commons
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Metadata and community research documentation are preserved under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0), ensuring universal accessibility for educators, students, and posterity.
            </p>
          </div>
        </div>
      </div>

      {/* Technical & Accessibility Standards */}
      <div className="bg-black/30 border border-white/10 rounded-3xl p-8 space-y-4">
        <h3 className="font-serif font-bold text-lg text-white">
          Architectural & Ethical Standards
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>WCAG AA compliant contrast ratios across dark & cream themes</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Support for <code>prefers-reduced-motion</code> accessibility controls</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Full keyboard navigation with accessible skip links and semantic landmarks</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Offline-resilient client-side draft preservation via LocalStorage</span>
          </li>
        </ul>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4 space-y-4">
        <h3 className="text-2xl font-serif font-bold text-white">
          Become a Global Heritage Custodian
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Share your community photographs, village oral ballads, or architectural documentation with the international registry.
        </p>
        <Link
          to="/contribute"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-heritage-saffron to-heritage-gold hover:from-heritage-saffron-deep hover:to-heritage-gold-light text-heritage-darker font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
          data-cursor="link"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Contribute Global Heritage</span>
        </Link>
      </div>
    </div>
  );
};
