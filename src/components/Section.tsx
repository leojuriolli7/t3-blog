import Link from "next/link";
import React from "react";
import clsx from "clsx";
import { ButtonLink } from "./Button";
import Carousel from "./Carousel";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";

type Props = {
  children?: React.ReactNode;
  title?: string;
  loading?: boolean;
  compact?: boolean;
  seeMoreHref?: string;
};

const Section: React.FC<Props> = ({
  children,
  title,
  loading,
  compact,
  seeMoreHref,
}) => {
  return (
    <section
      className={clsx(
        "w-full rounded-lg border-2 border-zinc-200 bg-white shadow-4xl dark:border-zinc-700/90 dark:bg-zinc-800",
        compact ? "p-3" : "px-5 py-5 sm:px-10"
      )}
    >
      <div className="flex w-full justify-between">
        <div>
          <ShouldRender if={!loading}>
            <h2
              className={clsx(
                "prose line-clamp-1 text-ellipsis break-all font-bold dark:prose-invert",
                compact ? "text-lg" : "text-xl sm:text-2xl"
              )}
            >
              {title}
            </h2>
          </ShouldRender>

          <ShouldRender if={loading}>
            <Skeleton heading lines={1} width="w-3/5" />
          </ShouldRender>
        </div>

        <ShouldRender if={seeMoreHref}>
          <Link
            href={seeMoreHref || ""}
            passHref
            legacyBehavior
            prefetch={false}
          >
            <ButtonLink
              disabled={loading}
              variant="gradient"
              size={compact ? "xs" : "sm"}
              className="rounded-full"
            >
              See more
            </ButtonLink>
          </Link>
        </ShouldRender>
      </div>

      <div className="mt-3">
        <Carousel arrows={!compact}>{children}</Carousel>
      </div>
    </section>
  );
};

export default Section;
