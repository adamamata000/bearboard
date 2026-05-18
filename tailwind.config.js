/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#07070f',
          800: '#0e0e1c',
          700: '#16162b',
          600: '#1e1e38',
        },
        amber: {
          glow: '#f59e0b',
        },
        teal: {
          glow: '#14b8a6',
        },
      },
      boxShadow: {
        'amber-glow': '0 0 20px rgba(245,158,11,0.5), 0 0 60px rgba(245,158,11,0.2)',
        'amber-glow-lg': '0 0 40px rgba(245,158,11,0.7), 0 0 100px rgba(245,158,11,0.3)',
        'teal-glow': '0 0 20px rgba(20,184,166,0.5), 0 0 60px rgba(20,184,166,0.2)',
        'teal-glow-lg': '0 0 40px rgba(20,184,166,0.7), 0 0 100px rgba(20,184,166,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-amber': 'pulse-amber 2s ease-in-out infinite',
        'pulse-teal': 'pulse-teal 2s ease-in-out infinite',
        'press': 'press 0.15s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        'pulse-amber': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245,158,11,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(245,158,11,0.8), 0 0 80px rgba(245,158,11,0.3)' },
        },
        'pulse-teal': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(20,184,166,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(20,184,166,0.8), 0 0 80px rgba(20,184,166,0.3)' },
        },
        'press': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
