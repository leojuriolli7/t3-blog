module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
      ? { cssnano: {} }
      : {}),
  },
};
