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
      "-xs": { max: "425px" },
    },
    extend: {
      transitionProperty: {
        borderAndShadow: "border, box-shadow",
      },
      fontFamily: {
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        slideFromLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "100%" },
        },
        popIn: {
          "0%": { transform: "scale(0.1)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        slideOver: "slideFromLeft 500ms ease",
        popIn: "popIn 300ms forwards",
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
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};
