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
        dark: {
          950: '#060b17', // deepest background
          900: '#0b1329', // panel background
          850: '#101d3b', // card background
          800: '#152449', // card border / hover
          750: '#1c2e5c',
          700: '#233970',
        },
        risk: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
