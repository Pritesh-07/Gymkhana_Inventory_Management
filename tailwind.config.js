/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B71C1C',
        'primary-dark': '#8B0000',
        'primary-light': '#D32F2F',
        'sports-red': '#B71C1C',
        'sports-red-dark': '#8B0000',
        'sports-red-light': '#D32F2F',
      },
    },
  },
  plugins: [],
}
