import clsx from "clsx";
import React from "react";

type Props = React.HTMLAttributes<HTMLSpanElement>;

export const Badge: React.FC<Props> = (props) => {
  return (
    <span
      {...props}
      className={clsx(
        "ml-1 select-none bg-emerald-500 p-[2px] px-1 text-xs font-bold text-white shadow-sm dark:bg-emerald-600",
        props?.className
      )}
    >
      {props?.children}
    </span>
  );
};
