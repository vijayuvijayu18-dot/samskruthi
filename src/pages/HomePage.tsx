import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { ManifestoSection } from '../components/sections/ManifestoSection';
import { ContinentsSection } from '../components/sections/ContinentsSection';
import { CategoriesSection } from '../components/sections/CategoriesSection';
import { SpotlightSection } from '../components/sections/SpotlightSection';
import { LivingTraditionsSection } from '../components/sections/LivingTraditionsSection';
import { StoriesPreviewSection } from '../components/sections/StoriesPreviewSection';
import { PhotoGallerySection } from '../components/sections/PhotoGallerySection';
import { MapPreviewSection } from '../components/sections/MapPreviewSection';
import { EndangeredHeritageSection } from '../components/sections/EndangeredHeritageSection';
import { EducationalDiscoverySection } from '../components/sections/EducationalDiscoverySection';
import { ContributeCTASection } from '../components/sections/ContributeCTASection';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      {/* 1. Cinematic Global Hero Section */}
      <HeroSection />

      {/* 2. Universal Heritage Charter Manifesto & Global Counters */}
      <ManifestoSection />

      {/* 3. Six Continents Explorer (Africa, Asia, Europe, Americas, Oceania) */}
      <ContinentsSection />

      {/* 4. 12 Global Heritage Streams Interactive Explorer */}
      <CategoriesSection />

      {/* 5. Masterpieces of Humanity Rotating Spotlight */}
      <SpotlightSection />

      {/* 6. Living Traditions & Intangible Cultural Heritage */}
      <LivingTraditionsSection />

      {/* 7. Voices of the Ancestors — Global Oral Histories & Audio Ballads */}
      <StoriesPreviewSection />

      {/* 8. Global Archival Photography Mosaic with Lightbox */}
      <PhotoGallerySection />

      {/* 9. Interactive Global Cartography Preview */}
      <MapPreviewSection />

      {/* 10. Urgent Safeguarding & Endangered Heritage */}
      <EndangeredHeritageSection />

      {/* 11. Educational Inquiries & Curated Learning Tracks */}
      <EducationalDiscoverySection />

      {/* 12. Worldwide Community Contribution Onboarding */}
      <ContributeCTASection />
    </div>
  );
};

