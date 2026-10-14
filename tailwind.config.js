/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Paleta oscura grafito (referencia: asistencia_dashboard.html)
      colors: {
        surface: {
          DEFAULT: '#121316',
          sidebar: '#17181c',
          card: '#1e2025',
          elevated: '#24272e',
          pill: '#282b33',
          input: '#1a1b20',
          track: '#252830',
          avatar: '#2a2d36',
        },
        line: {
          DEFAULT: 'rgba(255, 255, 255, 0.07)',
          strong: 'rgba(255, 255, 255, 0.12)',
          focus: 'rgba(255, 255, 255, 0.2)',
        },
        fg: {
          DEFAULT: '#f3f4f6',
          muted: '#9499a6',
          dim: '#5f6472',
        },
        accent: {
          DEFAULT: '#9f75ff',
          hover: '#8b5cf6',
        },
        beige: '#ded1c3',
        // Naranja de la app móvil (solo landing pública)
        ember: {
          DEFAULT: '#f2681c',
          light: '#ff8a3d',
          dark: '#c94f0c',
        },
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(6%, -4%) scale(1.08)' },
          '66%': { transform: 'translate(-5%, 5%) scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        drift: 'drift 22s ease-in-out infinite',
        'drift-slow': 'drift 34s ease-in-out infinite reverse',
        float: 'float 9s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
