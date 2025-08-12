/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E50846",
        muted: "#eaeaea",
        "muted-foreground": "#161A40",
      },
    },
  },
  plugins: [],
}
