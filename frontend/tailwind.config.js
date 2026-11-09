/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f5ecd6',
          300: '#eedfba',
          400: '#e5cd97',
          500: '#dbb974',
          600: '#c59d53',
          700: '#a47e3f',
          800: '#856436',
          900: '#6d522f',
        },
        evergreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        aether: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        }
      },
      fontFamily: {
        pixel: ['"Courier New"', 'monospace'],
        medieval: ['Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
