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
        arc: {
          primary: '#3E74BB',
          'primary-light': '#ACC6E9',
          'bg-dark': '#0D1B2F',
          'bg-dark-2': '#19354D',
          'card': '#1F2F44',
          'text': '#F5F5F8',
          'text-subtle': '#C7C5D1',
          'border': 'rgba(255,255,255,0.1)',
        }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'arc-gradient': 'linear-gradient(180deg, #0D1B2F 0%, #0D1B2F 60%, #19354D 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(31,47,68,0.9) 0%, rgba(13,27,47,0.9) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow': 'spin 1.5s linear infinite',
        'step-complete': 'stepComplete 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        stepComplete: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
