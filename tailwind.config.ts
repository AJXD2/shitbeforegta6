import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // Indigo for accents
        secondary: '#a5b4fc', // Soft indigo for complements
        accent: '#22d3ee', // Bright cyan for pops of color
        neutral: '#1e293b', // Dark slate for backgrounds
        base: '#0f172a', // Deep navy for base layouts
        surface: '#334155', // Mid-gray for cards and containers
        error: '#f87171', // Muted red for alerts
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.neutral'),
            a: {
              color: theme('colors.primary'),
              '&:hover': {
                color: theme('colors.accent'),
                textDecoration: 'underline',
              },
            },
            h1: { color: theme('colors.primary') },
            h2: { color: theme('colors.secondary') },
            blockquote: {
              color: theme('colors.surface'),
              borderLeftColor: theme('colors.accent'),
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.base'),
            a: {
              color: theme('colors.accent'),
              '&:hover': {
                color: theme('colors.primary'),
                textDecoration: 'underline',
              },
            },
            h1: { color: theme('colors.primary') },
            h2: { color: theme('colors.secondary') },
          },
        },
      }),
    },
  },

  plugins: [
    typography,
    forms,
    daisyui,
  ],

  daisyui: {
    themes: [
      {
        mydarktheme: {
          primary: '#6366f1',
          secondary: '#a5b4fc',
          accent: '#22d3ee',
          neutral: '#1e293b',
          'base-100': '#0f172a',
          surface: '#334155',
          error: '#f87171',
        },
      },
    ],
  },
} satisfies Config;
