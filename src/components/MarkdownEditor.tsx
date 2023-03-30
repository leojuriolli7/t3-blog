import { useCallback } from "react";
import { Controller } from "react-hook-form";
import { marked } from "marked";
import dynamic from "next/dynamic";
import { FieldType } from "@utils/types";
import hljs from "highlight.js";
import * as DOMPurify from "dompurify";
import "highlight.js/styles/atom-one-dark.css";

type Variants = "condensed" | "regular";

type Props = {
  name: string;
  control: any;
  variant?: Variants;
  defaultValue?: string;
  placeholder?: string;
};

const enabledPlugins = [
  "header",
  "font-bold",
  "font-italic",
  "font-strikethrough",
  "list-unordered",
  "list-ordered",
  "block-quote",
  "block-wrap",
  "block-code-inline",
  "block-code-block",
  "table",
  "link",
  "clear",
  "logger",
  "mode-toggle",
  "full-screen",
  "image",
];

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
});

const MarkdownEditor: React.FC<Props> = ({
  name,
  control,
  variant = "regular",
  placeholder,
  defaultValue,
}) => {
  const mdParser = marked.setOptions({
    smartypants: true,
    langPrefix: "hljs language-", // highlight.js css expects a top-level 'hljs' class.
    renderer: new marked.Renderer(),
    // purify html
    sanitizer(html) {
      return DOMPurify.sanitize(html);
    },
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });

  const handleChange = useCallback(
    (field: FieldType) =>
      ({ text }: { text: string; html: string }) => {
        if (typeof text === "string") {
          return field.onChange(text);
        }
      },
    []
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <MdEditor
          plugins={enabledPlugins}
          style={
            variant === "regular" ? { height: "500px" } : { height: "200px" }
          }
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="dark:md-dark-mode dark:border-0"
          htmlClass="html-section"
          renderHTML={(text) => mdParser.parse(text)}
          {...field}
          onChange={handleChange(field)}
        />
      )}
    />
  );
};

export default MarkdownEditor;
