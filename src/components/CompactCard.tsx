import React from "react";
import type { TaggedPosts } from "@utils/types";
import clsx from "clsx";
import getUserDisplayName from "@utils/getUserDisplayName";
import { useContextualRouting } from "next-use-contextual-routing";
import LikeCount from "./LikeCount";
import Link from "next/link";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";
import HTMLBody from "./HTMLBody";

type Props = {
  slide?: boolean;
  post?: TaggedPosts;
  loading?: boolean;
  bgClass?: string;
};

const CompactCard: React.FC<Props> = ({ slide, post, loading, bgClass }) => {
  const { makeContextualHref } = useContextualRouting();
  const username = getUserDisplayName(post?.user);

  return (
    <Link
      as={`/posts/${post?.id}`}
      href={makeContextualHref({ postId: post?.id || "" })}
      key={post?.id}
      prefetch={false}
      shallow
      scroll={false}
      className={clsx(
        loading && "pointer-events-none",
        slide && "keen-slider__slide",
        bgClass || "bg-white dark:bg-zinc-900",
        "flex cursor-pointer flex-col justify-between rounded-xl border border-zinc-300 p-3 shadow-md transition-borderAndShadow hover:shadow-lg dark:border-zinc-900/50 dark:hover:border-zinc-700/80"
      )}
      style={
        slide
          ? {
              width: "275px",
              minWidth: "275px",
            }
          : { width: "100%" }
      }
    >
      <div>
        <ShouldRender if={!loading}>
          <h2 className="prose line-clamp-1 text-lg font-bold dark:prose-invert">
            {post?.title}
          </h2>
        </ShouldRender>

        <ShouldRender if={loading}>
          <Skeleton />
        </ShouldRender>

        <HTMLBody
          loading={loading}
          lines={3}
          className={`text-md content-mask line-clamp-2 max-h-14 text-ellipsis`}
        >
          {post?.body}
        </HTMLBody>
      </div>

      <div className="mt-4 flex w-full items-center justify-between">
        <div className="flex gap-3">
          <LikeCount vertical={false} label={post?.likes} />
          <LikeCount vertical={false} dislike label={post?.dislikes} />
        </div>

        <ShouldRender if={!loading}>
          <div className="flex min-w-min gap-3">
            <p className="word-break-word ml-3 line-clamp-2 text-sm leading-4">
              By {username}
            </p>
          </div>
        </ShouldRender>
      </div>
    </Link>
  );
};

export default CompactCard;
