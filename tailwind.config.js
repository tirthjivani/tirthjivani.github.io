/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        dark: '#010101',
        light: '#EDEBE9',
        gray: '#908D8A',
        accent: '#b05b60',
      },
    },
  },
  plugins: [],
};
