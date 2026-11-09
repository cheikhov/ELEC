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
        eng: {
          green: '#059669',     // Emerald-600: modern engineering accent
          'green-hover': '#047857', // Emerald-700
          'green-light': '#ecfdf5', // Emerald-50
          'green-dark': '#10b981',  // Emerald-500
          charcoal: '#090d16',  // Modern deep slate
          panel: '#0f172a',     // Slate-900
          border: '#1e293b',    // Slate-800
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
