/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', 'Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        tetri: {
          blue: '#1447e6',
          'blue-hover': '#155dfc',
          text: '#0f172b',
          muted: '#4a5565',
          bg: '#f8fafc',
          border: '#e2e8f0',
          surface: '#ffffff',
          'dark-bg': '#020817',
          'dark-surface': '#0f172a',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          neutral: '#64748b',
        },
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
    },
  },
  plugins: [],
};
