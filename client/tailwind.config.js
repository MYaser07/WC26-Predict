/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#0a0f0a',
          900: '#0d130d',
          800: '#111811',
          700: '#162016',
          600: '#1c2b1c',
        },
      },
    },
  },
  plugins: [],
};
