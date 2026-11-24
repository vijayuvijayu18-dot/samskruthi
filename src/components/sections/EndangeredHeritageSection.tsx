import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, PlusCircle, Globe } from 'lucide-react';
import { HeritageService } from '../../services/heritageService';
import { SectionHeading } from '../ui/SectionHeading';
import { SafeImage } from '../ui/SafeImage';

export const EndangeredHeritageSection: React.FC = () => {
  const endangeredItems = HeritageService.getEndangered();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-heritage-darker via-heritage-surface/80 to-heritage-darker border-t border-rose-500/20 relative overflow-hidden">
      {/* Ambient alert glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-rose-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            badge="Urgent Safeguarding Priority"
            title="Endangered & Underdocumented Traditions"
            subtitle="Cultures under threat from armed conflict, environmental shifts, rapid urbanization, and generational attrition."
          />

          <Link
            to="/contribute?priority=endangered"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider hover:bg-rose-500/30 transition-all self-start md:self-end"
            data-cursor="link"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Endangered Lore</span>
          </Link>
        </div>

        {/* Featured Endangered Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {endangeredItems.map((item) => (
            <div
              key={item.id}
              className="bg-heritage-surface border border-rose-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-rose-400 transition-all shadow-xl group"
            >
              <div className="space-y-4">
                <div className="relative h-44 rounded-xl overflow-hidden border border-white/10">
                  <SafeImage
                    src={item.primaryImage.src}
                    alt={item.title}
                    fallbackTitle={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 bg-rose-950/90 border border-rose-500/40 text-rose-300 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Safeguarding Priority</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">
                    {item.continent} • {item.country}
                  </span>
                  <h4 className="font-serif font-bold text-lg text-white group-hover:text-heritage-gold transition-colors mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-3 mt-2 leading-relaxed font-sans">
                    {item.shortDescription}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-rose-400 font-mono">
                  Documentation Needed
                </span>
                <Link
                  to={`/heritage/${item.slug}`}
                  className="text-xs font-bold text-heritage-gold hover:underline flex items-center gap-1"
                  data-cursor="link"
                >
                  <span>Read Emergency File</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {/* Underdocumented Callout Banner */}
          <div className="bg-heritage-darker border border-heritage-gold/30 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-heritage-gold/20 border border-heritage-gold/40 flex items-center justify-center text-heritage-gold">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-lg text-white">
                Do You Know an Unrecorded Cultural Practice?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Over 3,000 languages and countless oral lullabies, agrarian techniques, and sacred shrines have zero digital documentation. Help us record your community elders before their voices are lost.
              </p>
            </div>

            <Link
              to="/contribute"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-heritage-saffron to-heritage-gold text-heritage-darker font-bold text-xs uppercase tracking-wider text-center shadow-md hover:from-heritage-saffron-deep hover:to-heritage-gold-light transition-all"
              data-cursor="link"
            >
              Start Community Record Form
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
