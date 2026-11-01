/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Readex Pro"', 'Cairo', 'sans-serif'],
        readex: ['"Readex Pro"', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
      },
      colors: {
        gothic: {
          950: '#0d0b0f',
          900: '#120f17',
          850: '#16131d',
          800: '#1c1724',
          700: '#261f31',
          600: '#382e46',
        },
        gold: {
          50: '#fbf7ee',
          100: '#f5edd6',
          200: '#ebdaa9',
          300: '#dfc276',
          400: '#d4af37',
          500: '#c5a059',
          600: '#a88140',
          700: '#876231',
          800: '#694a28',
          900: '#523821',
        },
        brand: {
          50: '#fcf7ee',
          100: '#f7edd6',
          200: '#eedaad',
          300: '#e3c27e',
          400: '#d9a952',
          500: '#c5a059',
          600: '#a88140',
          700: '#876231',
          800: '#6b4c27',
          900: '#543b20',
        },
      },
    },
  },
  plugins: [],
}
