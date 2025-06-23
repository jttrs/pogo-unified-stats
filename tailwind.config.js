/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pogo-blue': '#4285f4',
        'pogo-yellow': '#fbbc04',
        'pogo-red': '#ea4335',
        'pogo-green': '#34a853',
      }
    },
  },
  plugins: [],
} 