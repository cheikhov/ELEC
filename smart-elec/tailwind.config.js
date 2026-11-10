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
        // shadcn/ui inspired zinc dark palette
        background: '#09090b',
        surface: '#18181b',
        'surface-hover': '#27272a',
        'surface-border': '#27272a',
        muted: '#71717a',
        'muted-foreground': '#a1a1aa',
        primary: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669',   // emerald-600
          dark: '#047857',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#10b981',
          subtle: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.2)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 2px 8px -2px rgba(0, 0, 0, 0.4), 0 1px 3px 0 rgba(0, 0, 0, 0.2)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
      },
    },
  },
  plugins: [],
}
