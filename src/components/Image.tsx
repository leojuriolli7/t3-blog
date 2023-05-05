import React, { useCallback, useEffect, useMemo, useState } from "react";
import NextImage, { StaticImageData } from "next/future/image";
import ShouldRender from "./ShouldRender";
import { ImageProps } from "next/future/image";
import clsx from "clsx";
interface StaticRequire {
  default: StaticImageData;
}

type Props = Omit<ImageProps, "loading" | "src"> & {
  isLoading?: boolean;
  src?: string | StaticRequire;
  full?: boolean;
};

type SkeletonProps = Pick<Props, "width" | "height" | "className" | "full">;

const ImageSkeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className,
  full,
}) => {
  const dimensionsStyle = {
    width: width,
    height: height,
  };

  return (
    <div
      role="status"
      className={clsx(
        "animate-pulse bg-gray-300 dark:bg-neutral-700",
        full && "h-full w-full",
        className
      )}
      {...(width && height && { style: dimensionsStyle })}
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
  const { src, isLoading, full, ...rest } = props;

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

    return () => {
      setLoaded(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Only way for next/image to set width & height 100%
  const fillContainerProps = {
    sizes: "100vw",
    width: 0,
    height: 0,
    unoptimized: true,
    style: { width: "100%", height: "100%" },
  };

  return (
    <>
      <ShouldRender if={!loading}>
        <NextImage
          {...rest}
          src={currentSrc}
          onError={handleError}
          {...(full && fillContainerProps)}
        />
      </ShouldRender>
      <ShouldRender if={loading}>
        <ImageSkeleton
          width={rest.width}
          height={rest.height}
          className={rest.className}
          full={full}
        />
      </ShouldRender>
    </>
  );
};

export default CustomImage;
