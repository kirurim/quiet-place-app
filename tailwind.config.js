/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#f4f4f5',
        muted: '#6b6b72',
        accent: '#e8ff3a',
        canvas: '#0a0a0b',
      },
    },
  },
  plugins: [],
}
