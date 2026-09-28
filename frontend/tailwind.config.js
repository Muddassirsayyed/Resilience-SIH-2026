/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          dark: '#ffffff',
          bg: '#f8fafc',
          panel: '#ffffff',
          border: '#e2e8f0',
          surface: '#f1f5f9',
          hover: '#f8fafc',
          text: '#0f172a',
          muted: '#64748b',
          accent: '#2563eb',
        },
        status: {
          available: '#22c55e',
          maintenance: '#f59e0b',
          critical: '#ef4444',
          movement: '#3b82f6',
          restricted: '#f97316',
          delayed: '#eab308',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'train-move': 'trainMove 8s linear infinite',
      },
      keyframes: {
        trainMove: {
          '0%': { offset: '0%' },
          '100%': { offset: '100%' },
        }
      }
    },
  },
  plugins: [],
}
