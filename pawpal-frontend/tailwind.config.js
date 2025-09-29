/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purpleHover: "#6638E6",
        pinkHover: "#E6738F",
        highlightDarker: "#E69AAE",
        pureWhite: "#FFFFFF",
      },
    },
  },
  plugins: [],
}

