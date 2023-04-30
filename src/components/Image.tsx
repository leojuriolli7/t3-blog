import React, { useCallback, useEffect, useMemo, useState } from "react";
import NextImage from "next/future/image";
import ShouldRender from "./ShouldRender";
import { ImageProps } from "next/future/image";
import clsx from "clsx";

type Props = Omit<ImageProps, "loading"> & {
  isLoading?: boolean;
};

type SkeletonProps = Pick<ImageProps, "width" | "height" | "className">;

const ImageSkeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className,
}) => {
  return (
    <div
      role="status"
      className={clsx(
        "animate-pulse bg-gray-300 dark:bg-neutral-700",
        `w-[${width}px] h-[${height}px]`,
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * This custom image component is just wrapping the
 * Next.js `<Image>` component.
 *
 * It handles loading automatically by rendering a skeleton and also handles errors.
 */
const CustomImage: React.FC<Props> = (props) => {
  const { src, isLoading, ...rest } = props;

  const [loaded, setLoaded] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loading = isLoading || !loaded;

  const onLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, [setHasError]);

  const currentSrc = useMemo(() => {
    if (hasError || !src) {
      return "/static/default.jpg";
    }

    return src;
  }, [src, hasError]);

  useEffect(() => {
    const img = new Image();
    img.src = currentSrc as string;

    img.onload = onLoaded;

    if (typeof currentSrc === "string") {
      setLoaded(true);
    }

    return () => {
      setLoaded(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <>
      <ShouldRender if={!loading}>
        <NextImage {...rest} src={currentSrc} onError={handleError} />
      </ShouldRender>
      <ShouldRender if={loading}>
        <ImageSkeleton
          width={rest.width}
          height={rest.height}
          className={rest.className}
        />
      </ShouldRender>
    </>
  );
};

export default CustomImage;
