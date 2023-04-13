import clsx from "clsx";
import React from "react";

type Props = {
  alwaysWhite?: boolean;
};

const Spinner: React.FC<Props> = ({ alwaysWhite }) => {
  return (
    <div
      className={clsx(
        "animate-spin inline-block w-5 h-5 border-[3px] border-current border-t-transparent rounded-full",
        alwaysWhite ? "text-white" : "text-gray-800 dark:text-white"
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
