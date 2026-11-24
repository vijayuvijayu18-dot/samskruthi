import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

export const EducationalDiscoverySection: React.FC = () => {
  const tracks = [
    {
      title: 'Comparative Ancient Hydrology',
      description: 'Analyze how Nabataeans in Petra, Khmers in Angkor, and southern Indian empires engineered water cascades in arid and monsoon regimes.',
      focus: 'Civil Engineering & Ecology',
      count: '8 Case Studies',
      link: '/explore?q=water',
    },
    {
      title: 'Trans-Oceanic & Silk Road Trade',
      description: 'Trace the movement of spices, glass, papyri, and musical instruments along the maritime dhow routes and terrestrial caravanserais.',
      focus: 'Global Economic History',
      count: '12 Archaeological Sites',
      link: '/explore?q=trade',
    },
    {
      title: 'Astronomical Alignments & Sacred Space',
      description: 'Study how the Great Pyramid of Giza, Teotihuacan, and Incan Intihuatana calculated solar solstices and celestial navigation.',
      focus: 'Archaeoastronomy',
      count: '6 Monolithic Wonders',
      link: '/explore?q=astronomy',
    },
    {
      title: 'Oral Historiography & Indigenous Memory',
      description: 'Explore the methodology of preserving verbatim elder testimony, Bambara griot poetry, and First Nations oral sovereignty.',
      focus: 'Anthropology & Oral Lore',
      count: '14 Recorded Narrators',
      link: '/stories',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-heritage-surface/70 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            badge="Academic & School Commons"
            title="Educational Heritage Discovery"
            subtitle="Curated inquiry tracks and open research dossiers designed for educators, students, and cultural anthropologists worldwide."
          />

          <div className="flex items-center gap-2 self-start md:self-end">
            <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Free for Schools & Non-Profits</span>
            </span>
          </div>
        </div>

        {/* 4 Track Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tracks.map((track, i) => (
            <div
              key={i}
              className="bg-heritage-darker/90 border border-white/10 hover:border-heritage-gold/40 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-heritage-gold/15 border border-heritage-gold/30 flex items-center justify-center text-heritage-gold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-heritage-saffron tracking-wider block">
                  {track.focus}
                </span>
                <h4 className="font-serif font-bold text-base text-white group-hover:text-heritage-gold transition-colors">
                  {track.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {track.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{track.count}</span>
                <Link
                  to={track.link}
                  className="font-bold text-heritage-gold hover:underline flex items-center gap-1"
                  data-cursor="link"
                >
                  <span>Explore Track</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
