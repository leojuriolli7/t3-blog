import { useCallback } from "react";
import { Controller } from "react-hook-form";
import { marked } from "marked";
import dynamic from "next/dynamic";
import type { FieldType } from "@utils/types";
import hljs from "highlight.js";
import * as DOMPurify from "dompurify";
import { v4 as uuid } from "uuid";
import "highlight.js/styles/atom-one-dark.css";
import { trpc } from "@utils/trpc";
import { env } from "@env";
import { uploadFileToS3 } from "@utils/aws/uploadFileToS3";
import { generateS3Url } from "@utils/aws/generateS3Url";
import { useSession } from "next-auth/react";
import { MdInfoOutline } from "react-icons/md";
import { toast } from "react-toastify";
import convertToMegabytes from "@utils/convertToMB";
import ShouldRender from "./ShouldRender";

type Variants = "condensed" | "regular";

type Props = {
  name: string;
  control: any;
  variant?: Variants;
  defaultValue?: string;
  placeholder?: string;
  imageUploadTip?: boolean;
  uploadingState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
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
  // "full-screen",
];

// TO-DO: Refactor to use a new text editor.
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
  uploadingState,
}) => {
  const [, setUploading] = uploadingState || [];
  const withImageUploads = !!uploadingState;

  const maxFileSize = Number(env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE);

  const { data } = useSession();
  const userId = data?.user.id as string;

  const maxSizeInMB = convertToMegabytes(maxFileSize);

  const { mutateAsync: createPresignedUrl } =
    trpc.attachments.createPresignedPostBodyUrl.useMutation({
      onError() {
        setUploading?.(false);
      },
    });

  const onImageUpload = async (file: File) => {
    setUploading?.(true);

    const image = file;

    const isImage = image.type.includes("image");

    if (!isImage) {
      setUploading?.(false);

      return toast.error(
        "Only images are available for uploading. Please select an image."
      );
    }

    if (image.size > maxFileSize) {
      setUploading?.(false);

      return toast.error(`Limit of ${maxSizeInMB}MB per file`);
    }

    const { url, fields, key } = await createPresignedUrl();
    await uploadFileToS3(url, fields, image);

    const imageUrl = generateS3Url(
      env.NEXT_PUBLIC_AWS_S3_POST_BODY_BUCKET_NAME,
      key
    );

    setUploading?.(false);

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
            className="dark:md-dark-mode"
            shortcuts
            htmlClass="html-section"
            onImageUpload={withImageUploads ? onImageUpload : undefined}
            renderHTML={(text) => mdParser.parse(text)}
            // default to show only the markdown editor.
            view={{
              menu: true,
              md: true,
              html: false,
            }}
            {...field}
            onChange={handleChange(field)}
          />

          <ShouldRender if={imageUploadTip}>
            <div className="flex w-full select-none gap-1 border-[1px] border-t-0 border-zinc-300 bg-white px-1 py-2 dark:border-neutral-800 dark:bg-zinc-900 sm:items-center">
              <MdInfoOutline
                size={18}
                className="flex-shrink-0 text-neutral-700 dark:text-neutral-400"
              />
              <span className="text-xs text-neutral-700 dark:text-neutral-400 sm:text-sm">
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
