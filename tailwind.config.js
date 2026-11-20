/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ht: {
          bg: 'var(--ht-bg)', soft: 'var(--ht-bg-soft)', surface: 'var(--ht-surface)',
          mint: 'var(--ht-surface-mint)', ink: 'var(--ht-ink)', muted: 'var(--ht-ink-muted)',
          border: 'var(--ht-border)', primary: 'var(--ht-primary)',
          strong: 'var(--ht-primary-strong)', deep: 'var(--ht-primary-deep)',
        },
      },
    },
  },
  plugins: [],
};
