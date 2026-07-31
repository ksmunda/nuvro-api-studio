import { fontFamily } from 'tailwindcss/defaultTheme';

/**
 * Shared Tailwind CSS configuration for NUVRO API Studio.
 * @type {import('tailwindcss').Config}
 */
const config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
      colors: {
        brand: {
          50: 'hsl(174, 100%, 97%)',
          100: 'hsl(174, 84%, 90%)',
          200: 'hsl(174, 75%, 79%)',
          300: 'hsl(174, 70%, 64%)',
          400: 'hsl(174, 68%, 48%)',
          500: 'hsl(174, 75%, 38%)',
          600: 'hsl(174, 80%, 30%)',
          700: 'hsl(174, 82%, 23%)',
          800: 'hsl(174, 78%, 17%)',
          900: 'hsl(174, 72%, 12%)',
          950: 'hsl(174, 70%, 7%)',
        },
        accent: {
          50: 'hsl(263, 100%, 97%)',
          100: 'hsl(263, 90%, 92%)',
          200: 'hsl(263, 84%, 85%)',
          300: 'hsl(263, 79%, 74%)',
          400: 'hsl(263, 76%, 62%)',
          500: 'hsl(263, 70%, 52%)',
          600: 'hsl(263, 68%, 44%)',
          700: 'hsl(263, 65%, 36%)',
          800: 'hsl(263, 60%, 28%)',
          900: 'hsl(263, 55%, 20%)',
          950: 'hsl(263, 52%, 12%)',
        },
        surface: {
          50: 'hsl(220, 16%, 96%)',
          100: 'hsl(220, 14%, 90%)',
          200: 'hsl(220, 13%, 78%)',
          300: 'hsl(220, 11%, 60%)',
          400: 'hsl(220, 10%, 44%)',
          500: 'hsl(220, 9%, 30%)',
          600: 'hsl(220, 10%, 22%)',
          700: 'hsl(220, 11%, 16%)',
          800: 'hsl(220, 13%, 11%)',
          900: 'hsl(220, 15%, 8%)',
          950: 'hsl(220, 18%, 5%)',
        },
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        'glow-brand': '0 0 20px hsl(174 75% 38% / 0.4)',
        'glow-accent': '0 0 20px hsl(263 70% 52% / 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideInRight: {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
