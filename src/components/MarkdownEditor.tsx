import { useCallback } from "react";
import { Controller } from "react-hook-form";
import MarkdownIt from "markdown-it";
import dynamic from "next/dynamic";
import hljs from "highlight.js";
import insert from "markdown-it-ins";
import taskLists from "markdown-it-task-lists";
import "highlight.js/styles/atom-one-light.css";

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
  const mdParser = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (__) {}
      }
      return ""; // use external default escaping
    },
  })
    .use(insert)
    .use(taskLists);

  const handleChange = useCallback(
    (field: any) =>
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
          renderHTML={(text) => mdParser.render(text)}
          {...field}
          onChange={handleChange(field)}
        />
      )}
    />
  );
};

export default MarkdownEditor;
