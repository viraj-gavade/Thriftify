// tailwind.config.js
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f9f7',
          100: '#e6f3ec',
          200: '#c2e1d3',
          300: '#9ecfba',
          400: '#5eae8f',
          500: '#3c9d79',
          600: '#36876c',
          700: '#2c6f5a',
          800: '#235847',
          900: '#1c473a',
          950: '#0f2b23',
        },
        secondary: {
          50: '#fdf8f6',
          100: '#f9e8e0',
          200: '#f4d5c8',
          300: '#edb7a0',
          400: '#e5906c',
          500: '#dd6b45',
          600: '#d45222',
          700: '#b2431c',
          800: '#8e3417',
          900: '#732a13',
          950: '#411409',
        },
        accent: '#FF7E54',
        success: '#48BB78',
        warning: '#F6AD55',
        error: '#F56565',
        // Thrift store category colors
        category: {
          clothing: '#9F7AEA',
          furniture: '#F6AD55',
          electronics: '#4299E1',
          books: '#68D391',
          vintage: '#ED8936',
          handmade: '#F687B3',
        },
        ui: {
          background: '#FAFAF9',
          card: '#ffffff',
          footer: '#2D3748',
          navbar: '#ffffff',
          tag: '#E2E8F0',
          discount: '#FEB2B2',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['Source Code Pro', 'monospace'],
        display: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      screens: {
        'xs': '475px',
        // sm, md, lg, xl, 2xl are built-in
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'hard': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 5px 0 rgba(0,0,0,0.05)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1)',
        'product': '0 4px 8px rgba(0,0,0,0.08)',
      },
      height: {
        'product-img': '20rem',
        'banner': '32rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      // Custom utilities for product displays
      maxWidth: {
        'product': '16rem',
        'product-lg': '20rem',
      },
      minHeight: {
        'product-card': '22rem',
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1100',
        'modal': '1300',
        'tooltip': '1400',
      },
    },
  },
  plugins: [
    forms,
    typography,
    aspectRatio,
  ],
}
