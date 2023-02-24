import { hi } from "date-fns/locale";
import hljs from "highlight.js";

const highlight = function (str: string, lang: string, attrs?: string) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(str, { language: lang }).value;
    } catch (__) {}
  }

  return "";
};

export default hi;
