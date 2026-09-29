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
        raksha: {
          dark: '#0a0f1d',
          card: '#111827',
          cardBorder: '#1f293d',
          accent: '#0284c7',
          alert: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          mesh: '#8b5cf6',
          sat: '#06b6d4',
          sneakernet: '#f97316'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(2, 132, 199, 0.4), 0 0 10px rgba(2, 132, 199, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(2, 132, 199, 0.8), 0 0 30px rgba(2, 132, 199, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
