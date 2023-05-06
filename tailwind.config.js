/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme')
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      'sans': ['Ubuntu', ...fontFamily.sans]
    },
    extend: {},
  },
  plugins: [],
};
