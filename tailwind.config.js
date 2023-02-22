/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  purge: {
    enabled: true,
    content: ["./src/**/*.tsx"],
  },
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
  ],
};
