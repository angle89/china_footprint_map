/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paper': '#F4F1EA',
        'blueprint-blue': '#2A5B8C',
        'blueprint-light': '#4A7BA7',
        'border-soft': '#D0D0D0',
      },
      fontFamily: {
        'sans': ['Inter', 'Noto Sans SC', 'SF Pro Display', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
