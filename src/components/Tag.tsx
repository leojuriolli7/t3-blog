import React from "react";

type Props = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  className?: string;
  title?: string;
  role?: React.AriaRole;
};

const Tag: React.FC<Props> = ({
  checked,
  onChange,
  children,
  onClick,
  className,
  role,
  title,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    onChange?.(!checked);
    onClick?.(e);
  };

  return (
    <span
      title={title || undefined}
      role={role || undefined}
      className={`cursor-pointer transition flex items-center p-2 text-sm select-none border-[1px] border-neutral-300 dark:border-neutral-600 rounded-none dark:text-neutral-200 whitespace-nowrap ${
        checked
          ? "bg-emerald-500 text-white"
          : "bg-transparent dark:text-white hover:opacity-80"
      } ${className || ""}`}
      onClick={handleClick}
    >
      {children}
    </span>
  );
};

export default Tag;
