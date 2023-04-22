/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.tsx"],
  theme: {
    screens: {
      xs: "425px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1220px",
      "2xl": "1536px",
      "-xl": { max: "1220px" },
      "-2sm": { max: "500px" },
    },
    extend: {
      transitionProperty: {
        borderAndShadow: "border, box-shadow",
      },
      fontFamily: {
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        "3xl": "0 4px 6px rgba(0,0,0,.04)",
        "4xl": "0 6px 14px rgba(0,0,0,.08)",
      },
      backgroundSize: {
        "size-200": "200% 200%",
      },
      backgroundPosition: {
        "pos-0": "0% 0%",
        "pos-100": "100% 100%",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
