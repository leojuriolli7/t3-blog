import clsx from "clsx";
import React from "react";

type Props = React.HTMLAttributes<HTMLSpanElement>;

export const Badge: React.FC<Props> = (props) => {
  return (
    <span
      className={clsx(
        "bg-emerald-500 dark:bg-emerald-600 ml-1 text-xs text-white font-bold p-[2px] px-1 shadow-sm select-none",
        props?.className
      )}
    >
      {props?.children}
    </span>
  );
};
