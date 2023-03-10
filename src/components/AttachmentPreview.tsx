import Image from "next/image";
import React, { useCallback } from "react";
import { saveAs } from "file-saver";
import { IoExpandOutline } from "react-icons/io5";
import { MdClose, MdDownload } from "react-icons/md";
import { RiFileTextFill } from "react-icons/ri";
import ShouldRender from "./ShouldRender";

type ImageType = {
  name: string;
  url?: string;
};

type Props = {
  type: "media" | "document";
  onClickImage?: () => void;
  file: ImageType;
  removeFile?: () => void;
  downloadable?: boolean;
};

const AttachmentPreview: React.FC<Props> = ({
  file,
  type,
  onClickImage,
  downloadable = false,
  removeFile,
}) => {
  const handleClickDownload = useCallback(() => {
    if (file?.url) {
      saveAs(file.url, file.name);
    }
  }, [file]);

  return (
    <div className="relative flex gap-3 p-4 bg-white border first:mt-4 border-zinc-300 dark:border-neutral-800 dark:bg-neutral-900">
      <div onClick={onClickImage} className="w-16 h-16 relative group">
        <ShouldRender if={type === "document"}>
          <div className="bg-emerald-500 dark:bg-emerald-700 w-16 h-16 flex items-center justify-center">
            <RiFileTextFill className="text-white" size={27} />
          </div>
        </ShouldRender>
        <ShouldRender if={type === "media"}>
          <Image
            src={file?.url || "/static/default.jpg"}
            width={64}
            height={64}
            alt={file.name || "Uploaded image"}
            objectFit="cover"
            className="cursor-pointer transform group-hover:opacity-50 transition-all"
          />
        </ShouldRender>

        <ShouldRender if={!!onClickImage}>
          <IoExpandOutline
            size={26}
            className="text-white cursor-pointer hidden group-hover:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </ShouldRender>
      </div>
      <div>
        <p className="text-sm text-neutral-700 dark:text-neutral-400 mt-2 line-clamp-2 text-ellipsis">
          {file.name}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          {type === "media" ? "Image" : "File"}
        </p>
      </div>
      <ShouldRender if={!!removeFile}>
        <MdClose
          size={20}
          role="button"
          title="Remove file"
          aria-label="Remove file"
          onClick={removeFile}
          className="absolute top-2 right-2 cursor-pointer text-neutral-700 dark:text-neutral-300 transition-transform hover:transform hover:scale-125"
        />
      </ShouldRender>

      <ShouldRender if={downloadable}>
        <MdDownload
          size={30}
          role="button"
          title="Download file"
          aria-label="Download file"
          className="absolute top-1/2 transform -translate-y-1/2
          right-2 cursor-pointer text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
          onClick={handleClickDownload}
        />
      </ShouldRender>
    </div>
  );
};

export default AttachmentPreview;
