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
    <div className="relative mt-4">
      <div
        onClick={onClickImage}
        className="group relative flex h-32 w-full justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file || "/static/default.jpg"}
          alt={displayLabel}
          className={clsx(
            "h-full cursor-pointer object-cover transition-all group-hover:brightness-50 dark:group-hover:opacity-50",
            isAvatar ? "w-32 rounded-full" : "w-full"
          )}
        />
        <IoExpandOutline
          size={26}
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 cursor-pointer text-white group-hover:block"
        />
      </div>
      <MdClose
        size={20}
        role="button"
        title="Remove file"
        aria-label="Remove file"
        onClick={removeFile}
        className="absolute right-2 top-2 cursor-pointer text-neutral-700 transition-transform hover:scale-125 dark:text-neutral-300"
      />
    </div>
  );
};

export default TagImagePreview;
