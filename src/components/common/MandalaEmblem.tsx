import React from 'react';

export const MandalaEmblem: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer petal ring */}
      <path
        d="M32 4 C35 12 40 16 48 16 C40 24 40 29 48 32 C40 35 40 40 48 48 C40 48 35 52 32 60 C29 52 24 48 16 48 C24 40 24 35 16 32 C24 29 24 24 16 16 C24 16 29 12 32 4 Z"
        stroke="#c5a059"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner geometric diamond star */}
      <path
        d="M32 12 L44 24 L52 32 L44 40 L32 52 L20 40 L12 32 L20 24 Z"
        stroke="#e2c887"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* Central sacred lotus / rosette */}
      <circle cx="32" cy="32" r="7" stroke="#c5a059" strokeWidth="1.4" />
      <circle cx="32" cy="32" r="3" fill="#c5a059" />
      {/* Filigree accents */}
      <path
        d="M32 18 V22 M32 42 V46 M18 32 H22 M42 32 H46"
        stroke="#c5a059"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="7" r="1.2" fill="#e2c887" />
      <circle cx="57" cy="32" r="1.2" fill="#e2c887" />
      <circle cx="32" cy="57" r="1.2" fill="#e2c887" />
      <circle cx="7" cy="32" r="1.2" fill="#e2c887" />
    </svg>
  );
};
