/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#12523F', dark: '#0C3B2E', soft: '#E4EFEA' },
        accent: { DEFAULT: '#D98A3D', soft: '#FBEEDD' },
        danger: { DEFAULT: '#B8433A', soft: '#F8E7E5' },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.12)' },
          '66%': { transform: 'translate(-24px, 22px) scale(0.92)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        logoPop: {
          '0%': { opacity: '0', transform: 'scale(0.5) rotate(-8deg)' },
          '60%': { opacity: '1', transform: 'scale(1.08) rotate(3deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        blob: 'blob 9s infinite ease-in-out',
        floatY: 'floatY 4s ease-in-out infinite',
        fadeInUp: 'fadeInUp .6s ease-out forwards',
        fadeIn: 'fadeIn .6s ease-out forwards',
        logoPop: 'logoPop .7s cubic-bezier(.34,1.56,.64,1) forwards',
        shake: 'shake .4s ease-in-out',
      },
    },
  },
  plugins: [],
};