import { useCallback } from "react";
import { Controller } from "react-hook-form";
import { marked } from "marked";
import dynamic from "next/dynamic";
import { FieldType } from "@utils/types";
import hljs from "highlight.js";
import * as DOMPurify from "dompurify";
import "highlight.js/styles/atom-one-dark.css";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import { MdInfoOutline } from "react-icons/md";
import ShouldRender from "./ShouldRender";

type Variants = "condensed" | "regular";

type Props = {
  name: string;
  control: any;
  variant?: Variants;
  defaultValue?: string;
  placeholder?: string;
  imageUploadTip?: boolean;
  withImageUploads?: boolean;
};

const enabledPlugins = [
  "header",
  "font-bold",
  "font-italic",
  "font-strikethrough",
  "image",
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
  imageUploadTip,
  withImageUploads = true,
}) => {
  const { data } = useSession();
  const userId = data?.user?.id as string;

  const { mutateAsync: createPresignedUrl } = trpc.useMutation(
    "attachments.create-presigned-post-body-url"
  );

  const onImageUpload = async (file: File) => {
    const randomKey = crypto.randomUUID();
    const image = file;

    const { url, fields } = await createPresignedUrl({ userId, randomKey });

    const formData = new FormData();

    Object.keys(fields).forEach((key) => {
      formData.append(key, fields[key]);
    });

    formData.append("Content-Type", image.type);
    formData.append("file", image);

    await fetch(url, {
      method: "POST",
      body: formData,
    });

    const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_POST_BODY_BUCKET_NAME}.s3.amazonaws.com/${userId}-${randomKey}`;

    return imageUrl;
  };

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
        <div className="relative w-full">
          <MdEditor
            plugins={enabledPlugins}
            style={
              variant === "regular" ? { height: "500px" } : { height: "200px" }
            }
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="dark:md-dark-mode dark:border-0"
            shortcuts
            htmlClass="html-section"
            onImageUpload={withImageUploads ? onImageUpload : undefined}
            renderHTML={(text) => mdParser.parse(text)}
            {...field}
            onChange={handleChange(field)}
          />

          <ShouldRender if={imageUploadTip}>
            <div className="flex w-full sm:items-center gap-1 select-none border-[1px] border-t-0 border-zinc-300 dark:border-neutral-800 dark:bg-neutral-900 dark:border-0 p-2">
              <MdInfoOutline
                size={18}
                className="text-neutral-700 dark:text-neutral-400 flex-shrink-0"
              />
              <span className="sm:text-sm text-xs text-neutral-700 dark:text-neutral-400">
                Drag n&apos; drop images or click the image icon on the menu to
                upload your own images to the text.
              </span>
            </div>
          </ShouldRender>
        </div>
      )}
    />
  );
};

export default MarkdownEditor;
