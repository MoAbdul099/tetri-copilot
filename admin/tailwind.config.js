import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tetri: {
          primary: '#1447e6',
          blue: '#1447e6',
          text: '#0f172b',
          neutral: '#64748b',
          muted: '#94a3b8',
          border: '#e2e8f0',
          bg: '#f8fafc',
          surface: '#ffffff',
          error: '#ef4444',
          success: '#22c55e',
          warning: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
};
