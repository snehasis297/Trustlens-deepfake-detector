/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        snapdragon: {
          red: '#E10600',
          dark: '#111318',
          card: '#1A1D24',
          accent: '#FF4D4D',
          border: '#2A2E39'
        }
      }
    },
  },
  plugins: [],
}
