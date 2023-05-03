import React from "react";
import clsx from "clsx";
import { TagType } from "@utils/types";
import { TagCard } from "./TagCard";

interface TagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onChange"> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  omitBgClass?: boolean;
  tag?: TagType;
  tagCardContainerRef?: React.RefObject<HTMLDivElement>;
}

const Tag: React.FC<TagProps> = (props) => {
  const {
    checked,
    onChange,
    children,
    onClick,
    className,
    omitBgClass,
    tag,
    tagCardContainerRef,
    ...rest
  } = props;

  const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    onChange?.(!checked);
    onClick?.(e);
  };

  const notCheckableTag = checked === undefined;

  const checkableTagClasses = `${
    checked
      ? "bg-emerald-500 text-white"
      : "bg-white dark:bg-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
  }`;

  const regularTagClasses = "bg-emerald-500 dark:bg-teal-900 text-white";

  return (
    <TagCard tag={tag} containerRef={tagCardContainerRef}>
      <span
        {...rest}
        className={clsx(
          "flex cursor-pointer select-none items-center whitespace-nowrap rounded-md border-[1px] border-neutral-300 p-2 text-sm transition dark:border-neutral-800 dark:text-neutral-200",
          notCheckableTag && !omitBgClass
            ? regularTagClasses
            : checkableTagClasses,
          className
        )}
        onClick={handleClick}
      >
        {tag?.name}
      </span>
    </TagCard>
  );
};

export default Tag;
