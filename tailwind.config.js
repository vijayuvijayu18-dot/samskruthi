/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        heritage: {
          dark: '#080c16',
          darker: '#04070d',
          surface: '#101626',
          card: '#141d30',
          border: 'rgba(212, 175, 55, 0.15)',
          saffron: '#f97316',
          'saffron-deep': '#ea580c',
          gold: '#d4af37',
          'gold-light': '#f3d979',
          terracotta: '#c85a32',
          'terracotta-dark': '#9a3412',
          emerald: '#059669',
          'emerald-light': '#34d399',
          peacock: '#0891b2',
          'peacock-teal': '#0d9488',
          indigo: '#312e81',
          'indigo-deep': '#1e1b4b',
          purple: '#7e22ce',
          aubergine: '#4a044e',
          cream: '#fdfbf7',
          'cream-warm': '#f7f2e7',
          'cream-card': '#f1ead9',
          // Concept 2 Heritage Palette Tokens
          'antique-gold': '#c5a059',
          'antique-gold-light': '#dfc38a',
          'antique-gold-dark': '#9a7736',
          'deep-brown': '#16100c',
          'deep-brown-surface': '#1c140f',
          'deep-brown-card': '#231913',
          'warm-ivory': '#fbf8f2',
          'warm-ivory-muted': '#d8ccbd',
          'earth-terracotta': '#a85834',
          'earth-ochre': '#996515',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel Decorative"', '"Playfair Display"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        lora: ['"Lora"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        kannada: ['"Noto Serif Kannada"', '"Noto Sans Kannada"', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

