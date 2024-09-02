/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        thin: ['Thin', 'sans-serif'],
        light: ['Light', 'sans-serif'],
        semibold: ['Semibold', 'sans-serif'],
        druk: ['Druk', 'sans-serif'],
      },
      colors: {
        dark: '#010101',
        light: '#EDEBE9',
        gray: '#908D8A',
        accent: '#b66166',
      },
      backgroundImage: {
        'footer-pattern': "url('./assets/img/background.jpeg')",
        'about-pattern': "url('./assets/img/background2.jpeg')",
      },
    },
  },
  plugins: [],
};
