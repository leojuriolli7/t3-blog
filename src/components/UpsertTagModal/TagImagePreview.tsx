import React from "react";
import { IoExpandOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import clsx from "clsx";

type Props = {
  type: "avatar" | "banner";
  onClickImage: () => void;
  removeFile: () => void;
  file: string;
};

const TagImagePreview: React.FC<Props> = ({
  file,
  type,
  onClickImage,
  removeFile,
}) => {
  const isAvatar = type === "avatar";
  const displayLabel = isAvatar ? "Selected avatar" : "Selected banner";

  return (
    <div className="mt-4 flex h-32 w-full justify-center">
      <div className={clsx("group relative h-full", !isAvatar && "w-full")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          onClick={onClickImage}
          src={file || "/static/default.jpg"}
          alt={displayLabel}
          className={clsx(
            "h-full cursor-pointer object-cover transition-all group-hover:brightness-50 dark:group-hover:opacity-50",
            isAvatar ? "w-32 rounded-full" : "w-full rounded-md"
          )}
        />
        <IoExpandOutline
          onClick={onClickImage}
          aria-label="Expand image"
          role="button"
          size={26}
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 cursor-pointer text-white group-hover:block"
        />
        <button
          type="button"
          className="absolute right-2 top-2 cursor-pointer rounded-full bg-emerald-500 p-1 text-neutral-700 transition-colors hover:bg-emerald-400 dark:bg-teal-900 dark:text-neutral-300 dark:hover:bg-emerald-700"
          aria-label="Delete current image"
        >
          <MdClose
            size={15}
            role="button"
            title="Remove file"
            aria-label="Remove file"
            onClick={removeFile}
            className="text-white"
          />
        </button>
      </div>
    </div>
  );
};

export default TagImagePreview;
