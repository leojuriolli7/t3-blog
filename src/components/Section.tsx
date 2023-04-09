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
        "bg-slate-100 dark:bg-zinc-800 shadow-md w-full",
        compact ? "p-3" : "sm:px-10 px-5 py-5"
      )}
    >
      <div className="w-full flex justify-between">
        <div>
          <ShouldRender if={!loading}>
            <h2
              className={clsx(
                "prose break-all dark:prose-invert font-bold text-ellipsis line-clamp-1",
                compact ? "text-lg" : "sm:text-2xl text-xl"
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
