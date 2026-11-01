/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf8f4',
          100: '#f9eee3',
          200: '#f3d9c3',
          300: '#eabc9b',
          400: '#df9870',
          500: '#d77c4d',
          600: '#c8633c',
          700: '#a64d30',
          800: '#853e2b',
          900: '#6d3626',
        },
      },
    },
  },
  plugins: [],
}

