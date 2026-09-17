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
    },
  },
  plugins: [],
};
