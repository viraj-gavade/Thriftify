import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';
import animate from 'tailwindcss-animate';

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e0db',
        input: '#e5e0db',
        ring: '#2d6a4f',
        background: '#faf8f5',
        foreground: '#1a1a1a',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        primary: {
          DEFAULT: '#2d6a4f',
          foreground: '#ffffff',
          50: '#f0faf4',
          100: '#d4f0e0',
          200: '#a8e0c2',
          300: '#7ccba3',
          400: '#4fae7f',
          500: '#2d9464',
          600: '#2d6a4f',
          700: '#245640',
          800: '#1b4030',
          900: '#122b20',
        },
        secondary: {
          DEFAULT: '#f5f0eb',
          foreground: '#44403c',
        },
        muted: {
          DEFAULT: '#f5f0eb',
          foreground: '#78716c',
        },
        accent: {
          DEFAULT: '#d4a574',
          foreground: '#1a1a1a',
          light: '#e8c9a5',
        },
        destructive: {
          DEFAULT: '#c53030',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#2d6a4f',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#d69e2e',
          foreground: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)',
        card: '0 2px 8px -2px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px -4px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.04)',
        elevated: '0 12px 32px -8px rgba(0,0,0,0.1), 0 4px 8px -4px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    forms,
    typography,
    aspectRatio,
    animate,
  ],
}
