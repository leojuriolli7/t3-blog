import clsx from "clsx";

export type SkeletonProps = {
  heading?: boolean;
  lines?: number;
  width?: string;
  height?: string;
  className?: string;
  parentClass?: string;
  margin?: string;
};

const Skeleton: React.FC<SkeletonProps> = ({
  heading = false,
  lines = 1,
  width,
  height,
  className,
  parentClass,
  margin,
}) => {
  return (
    <div
      role="status"
      className={clsx("animate-pulse", parentClass, width || "w-full")}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "w-full bg-gray-300 dark:bg-neutral-700",
            heading ? "h-6" : "h-2.5",
            i !== lines - 1 && (margin || "mb-4"),
            height,
            className
          )}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Skeleton;
