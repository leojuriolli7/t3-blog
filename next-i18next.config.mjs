import path from "path";

/** @type {import("next-i18next").UserConfig} */
const config = {
  debug: process.env.NODE_ENV === "development",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  i18n: {
    locales: ["en", "pt"],
    defaultLocale: "en",
  },
  localePath: path.resolve("./public/locales"),
};
export default config;
