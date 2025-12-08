/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#D4AF37', light: '#E5C158', dark: '#B8960C' },
        gold: { 50: '#FDF8E7', 100: '#F9EDCC', 200: '#F3DB99', 300: '#E5C158', 400: '#D4AF37', 500: '#B8960C', 600: '#8B7209', 700: '#5E4D06' },
        dark: { 50: '#E8E8E8', 100: '#D1D1D1', 200: '#A3A3A3', 300: '#757575', 400: '#4A4A4A', 500: '#2D2D2D', 600: '#1F1F1F', 700: '#171717', 800: '#0F0F0F', 900: '#0A0A0A' }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'serif']
      }
    }
  },
  plugins: []
};
