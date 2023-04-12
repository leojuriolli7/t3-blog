import React from "react";

type Props = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  className?: string;
  title?: string;
  role?: React.AriaRole;
  omitBgClass?: boolean;
};

const Tag: React.FC<Props> = ({
  checked,
  onChange,
  children,
  onClick,
  className,
  role,
  title,
  omitBgClass,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    onChange?.(!checked);
    onClick?.(e);
  };

  const notCheckableTag = checked === undefined;

  const checkableTagClasses = `${
    checked
      ? "bg-emerald-500 text-white"
      : "bg-white dark:bg-neutral-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-neutral-800"
  }`;

  const regularTagClasses = "bg-emerald-500 dark:bg-teal-900 text-white";

  return (
    <span
      title={title || undefined}
      role={role || undefined}
      className={`cursor-pointer rounded-md transition flex items-center p-2 text-sm select-none border-[1px] border-neutral-300 dark:border-neutral-800 dark:text-neutral-200 whitespace-nowrap ${
        notCheckableTag && !omitBgClass
          ? regularTagClasses
          : checkableTagClasses
      } ${className || ""} `}
      onClick={handleClick}
    >
      {children}
    </span>
  );
};

export default Tag;
