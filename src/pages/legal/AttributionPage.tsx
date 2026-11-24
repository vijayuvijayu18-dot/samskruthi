import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Image, Type, MapPin, ArrowLeft } from 'lucide-react';

export const AttributionPage: React.FC = () => {
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
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>OPEN CULTURAL ASSET &amp; CODE REGISTRY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f7f2ea] tracking-tight">
            Attribution &amp; Licensing Registry
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 font-sans">
            Inventory of open-source fonts, cartographic data, iconography, and cultural media licenses.
          </p>
        </div>

        {/* Typography */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Type className="w-5 h-5 text-[#c5a059]" />
            <span>1. Typography &amp; Typefaces</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            All typefaces used across Samskruthi are verified open-source fonts distributed under the <strong>SIL Open Font License (OFL 1.1)</strong> via Google Fonts:
          </p>
          <ul className="list-disc pl-5 text-xs text-stone-300 space-y-1">
            <li><strong>Cormorant Garamond:</strong> Designed by Christian Thalmann (SIL OFL 1.1)</li>
            <li><strong>Playfair Display:</strong> Designed by Claus Eggers Sørensen (SIL OFL 1.1)</li>
            <li><strong>Cinzel Decorative:</strong> Designed by Natanael Gama (SIL OFL 1.1)</li>
            <li><strong>Lora:</strong> Designed by Cyreal (SIL OFL 1.1)</li>
            <li><strong>Noto Serif Kannada:</strong> Designed by Google Fonts (SIL OFL 1.1)</li>
            <li><strong>Inter:</strong> Designed by Rasmus Andersson (SIL OFL 1.1)</li>
          </ul>
        </section>

        {/* Cartography */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#c5a059]" />
            <span>2. Map Tiles &amp; Geocoding Data</span>
          </h2>
          <ul className="list-disc pl-5 text-xs text-stone-300 space-y-1.5 leading-relaxed">
            <li>
              <strong>OpenStreetMap:</strong> Map vector geometries and coordinates &copy; OpenStreetMap contributors, licensed under the Open Database License (ODbL).
            </li>
            <li>
              <strong>CARTO Basemaps:</strong> Voyager raster tile rendering &copy; CARTO.
            </li>
            <li>
              <strong>Leaflet:</strong> Open-source JavaScript mapping engine licensed under the BSD-2-Clause License.
            </li>
            <li>
              <strong>Nominatim:</strong> Reverse geocoding service provided under OpenStreetMap terms.
            </li>
          </ul>
        </section>

        {/* Cultural Photography */}
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-[#d4af37] flex items-center gap-2">
            <Image className="w-5 h-5 text-[#c5a059]" />
            <span>3. Cultural Photography &amp; Archival Records</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
            <p>
              Photographs of ancient monuments and traditional mastercrafts are gathered under:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Creative Commons CC BY-SA 4.0 / CC BY 2.0:</strong> Via Wikimedia Commons.</li>
              <li><strong>Public Domain:</strong> Historical architectural records whose copyright terms have expired.</li>
              <li><strong>Unsplash Open License:</strong> Free cultural exploration media.</li>
              <li>
                <strong>Section 52 of the Indian Copyright Act, 1957:</strong> Fair dealing exception for research, private study, criticism, and non-commercial educational review of public artistic monuments.
              </li>
            </ul>
            <p className="text-stone-400 text-xs pt-1">
              If you are a photographer or rights holder and identify an image requiring revised attribution or removal, please email <a href="mailto:copyright@samskruthi.org" className="text-[#c5a059] underline">copyright@samskruthi.org</a> for immediate review.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
