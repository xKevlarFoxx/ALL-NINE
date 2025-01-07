/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E3F2FD',
          main: '#2196F3',
          dark: '#1976D2',
        },
        // Add more colors based on your design system
      },
    },
  },
  plugins: [],
}