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
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Bright Celestial Violet
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        cream: {
          50: '#FDFBF7',
          100: '#F8F6F0',
          200: '#F1ECE1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-celestial': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'soft-lg': '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
