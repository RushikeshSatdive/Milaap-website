/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand constants (identical in light & dark)
        brand: {
          sage: '#7B8F42',
          sageDark: '#5F7031',
          sageLight: '#9BAF5F',
          lightSage: '#E9EFCF',
          cream: '#F7F8F3',
          charcoal: '#20241F',
        },
        // Semantic tokens driven by CSS variables (theme-aware).
        // RGB triplets keep Tailwind opacity modifiers working (bg-accent/10, ring-accent/25 …).
        canvas: 'rgb(var(--bg-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        surface2: 'rgb(var(--surface-2-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        line: 'rgb(var(--line-rgb) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--sage-rgb) / <alpha-value>)',
          hover: 'rgb(var(--sage-hover-rgb) / <alpha-value>)',
          soft: 'rgb(var(--sage-soft-rgb) / <alpha-value>)',
          ink: 'rgb(var(--sage-ink-rgb) / <alpha-value>)',
        },
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(32,36,31,0.04), 0 8px 24px -12px rgba(32,36,31,0.14)',
        lift: '0 2px 6px rgba(32,36,31,0.06), 0 18px 40px -18px rgba(32,36,31,0.22)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .18s ease-out both',
        'pop-in': 'pop-in .22s cubic-bezier(.22,1,.36,1) both',
        'slide-up': 'slide-up .25s cubic-bezier(.22,1,.36,1) both',
        'toast-in': 'toast-in .2s ease-out both',
      },
    },
  },
  plugins: [],
}
