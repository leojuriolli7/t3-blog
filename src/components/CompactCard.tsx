import { TaggedPosts } from "@utils/types";
import clsx from "clsx";
import React from "react";
import getUserDisplayName from "@utils/getUserDisplayName";
import LikeCount from "./LikeCount";
import Link from "next/link";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";
import HTMLBody from "./HTMLBody";

type Props = {
  slide?: boolean;
  post?: TaggedPosts;
  loading?: boolean;
};

const CompactCard: React.FC<Props> = ({ slide, post, loading }) => {
  return (
    <Link
      href={`/posts/${post?.id}`}
      key={post?.id}
      prefetch={false}
      className={clsx(
        loading && "pointer-events-none",
        slide && "keen-slider__slide",
        "p-3 cursor-pointer bg-white dark:bg-neutral-900 shadow-md hover:shadow-lg transition-borderAndShadow border rounded-xl border-zinc-300 dark:border-neutral-700 dark:hover:border-neutral-500/80 flex flex-col justify-between"
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
          <h2 className="text-lg prose dark:prose-invert font-semibold line-clamp-1">
            {post?.title}
          </h2>
        </ShouldRender>

        <ShouldRender if={loading}>
          <Skeleton />
        </ShouldRender>

        <HTMLBody
          loading={loading}
          lines={3}
          className={`text-md line-clamp-2 text-ellipsis max-h-14 content-mask`}
        >
          {post?.body}
        </HTMLBody>
      </div>

      <div className="flex w-full justify-between items-center mt-4">
        <div className="flex gap-3">
          <LikeCount vertical={false} label={post?.likes} />
          <LikeCount vertical={false} dislike label={post?.dislikes} />
        </div>

        <ShouldRender if={!loading}>
          <div className="flex gap-3 min-w-min">
            <p className="text-sm line-clamp-2 ml-3 leading-4">
              By {getUserDisplayName(post?.user)}
            </p>
          </div>
        </ShouldRender>
      </div>
    </Link>
  );
};

export default CompactCard;
