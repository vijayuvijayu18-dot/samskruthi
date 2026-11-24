import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeritageSlideshow } from '../components/auth/HeritageSlideshow';
import { HeritageLoginForm } from '../components/auth/HeritageLoginForm';
import { apiService } from '../services/api';
import { HERITAGE_SLIDES, type HeritageSlide } from '../data/slideshowData';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<HeritageSlide[]>(HERITAGE_SLIDES);

  useEffect(() => {
    apiService.getSlides().then((data) => {
      if (data && data.length > 0) {
        setSlides(data);
      }
    });
  }, []);

  const handleSuccess = () => {
    navigate('/');
  };

  const handleExploreGuest = () => {
    navigate('/');
  };

  return (
    <HeritageSlideshow slides={slides} autoPlayInterval={6000}>
      <HeritageLoginForm
        onSuccess={handleSuccess}
        onExploreGuest={handleExploreGuest}
      />
    </HeritageSlideshow>
  );
};
