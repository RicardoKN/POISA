const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', ...fontFamily.sans],
      },
      colors: {
        canvas: '#F7F8FA',
        surface: '#FFFFFF',
        sunken: '#F0F2F5',
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        ink: {
          primary: '#1E293B',
          secondary: '#64748B',
          muted: '#94A3B8',
          inverse: '#FFFFFF',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      boxShadow: {
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
}
