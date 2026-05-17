/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', 'Arial', 'Helvetica', 'sans-serif'],
      },
      // ── Tetri brand tokens (used throughout existing codebase) ──────────────
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
        // ── shadcn/ui CSS-variable tokens (mapped to Tetri brand) ─────────────
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        // Tetri brand radii
        card: '16px',
        btn: '12px',
        // shadcn/ui radius tokens
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  safelist: [
    // Force-include all tetri brand token utilities — guards against JIT scan misses
    // in npm workspaces setups where UI component files may not be walked correctly.
    { pattern: /^(bg|text|border|ring|divide)-tetri-.+/ },
    {
      pattern: /^(bg|text|border|ring)-tetri-.+/,
      variants: ['hover', 'focus', 'focus-visible', 'disabled', 'placeholder', 'group-hover'],
    },
    // read-only and placeholder utilities used in Input / Select
    'read-only:bg-tetri-bg',
    'placeholder:text-tetri-neutral',
    'focus:ring-tetri-blue',
    'focus-visible:ring-tetri-blue',
    'focus:bg-tetri-bg',
    'focus:text-tetri-text',
    // Opacity-modified border used in Alert
    'border-tetri-blue/20',
    // Radix UI data-state attribute classes (Switch, Tabs)
    'data-[state=checked]:bg-tetri-blue',
    'data-[state=unchecked]:bg-slate-300',
    'data-[state=active]:bg-white',
    'data-[state=active]:text-tetri-blue',
    'data-[state=active]:shadow-sm',
    'data-[state=active]:border',
    'data-[state=active]:border-tetri-border',
    'data-[placeholder]:text-tetri-neutral',
  ],
  plugins: [require('tailwindcss-animate')],
};
