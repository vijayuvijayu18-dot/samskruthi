import React from 'react';
import { PLATFORM_STATS } from '../../data/statsData';
import { Shield, Globe } from 'lucide-react';

export const ManifestoSection: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-heritage-surface/60 border-y border-heritage-gold/20 relative overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-heritage-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        {/* Core Manifesto Statement */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-gold/10 border border-heritage-gold/30 text-heritage-gold text-xs font-semibold uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5" />
            <span>The Universal Heritage Charter</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight tracking-tight max-w-4xl mx-auto">
            “Heritage is not stone frozen in the past—it is the living memory of our earth, the song of our elders, and the shared heritage connecting all humanity.”
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
            Across six continents, we document monuments before erosion, transcribe oral histories before elder voices quieten, and map indigenous knowledge so generations unborn remember who they are.
          </p>
        </div>

        {/* Dynamic Metric Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {PLATFORM_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-heritage-dark/80 border border-heritage-gold/20 hover:border-heritage-gold/60 transition-all text-center group hover:-translate-y-1 shadow-lg"
            >
              <div className="font-serif font-extrabold text-3xl sm:text-4xl text-gradient-gold mb-1">
                {stat.value}
                <span className="text-heritage-saffron">{stat.suffix}</span>
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-heritage-gold transition-colors">
                {stat.label}
              </h4>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Preservation Ethical Standards Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-heritage-dark/60 border border-white/10 text-xs text-slate-300 gap-3">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Open Access Cultural Commons: All research, imagery, and recordings credit native custodians and public institutions under CC BY-SA 4.0.</span>
          </div>
          <span className="text-heritage-gold font-mono whitespace-nowrap text-[11px]">
            WCAG AA Accessibility Compliant
          </span>
        </div>
      </div>
    </section>
  );
};
