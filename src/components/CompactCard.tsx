import { TaggedPosts } from "@utils/types";
import React from "react";
import ReactMarkdown from "@components/ReactMarkdown";
import LikeCount from "./LikeCount";
import Link from "next/link";
import ShouldRender from "./ShouldRender";

type Props = {
  slide?: boolean;
  post?: TaggedPosts;
  loading: boolean;
};

const CompactCard: React.FC<Props> = ({ slide, post, loading }) => {
  return (
    <Link href={`/posts/${post?.id}`} key={post?.id}>
      <article
        className={`${slide ? "keen-slider__slide" : ""} ${
          loading ? "pointer-events-none" : ""
        } p-3 cursor-pointer bg-white dark:bg-neutral-900 shadow-md border-2 border-zinc-300 dark:border-neutral-700 flex flex-col justify-between hover:opacity-70`}
        style={{
          width: "275px",
          minWidth: "275px",
        }}
      >
        <div>
          <ReactMarkdown
            className="text-lg font-semibold line-clamp-1"
            loading={loading}
          >
            {post?.title}
          </ReactMarkdown>
          <ReactMarkdown
            loading={loading}
            lines={3}
            className={`text-md line-clamp-2 text-ellipsis sm:max-h-none max-h-12`}
          >
            {post?.body}
          </ReactMarkdown>
        </div>

        <div className="flex w-full justify-between items-center mt-4">
          <div className="flex gap-3">
            <LikeCount vertical={false} label={post?.likes} />
            <LikeCount vertical={false} dislike label={post?.dislikes} />
          </div>

          <ShouldRender if={!loading}>
            {" "}
            <div className="flex gap-3 min-w-min">
              <p>By {post?.user?.name || post?.user?.email}</p>
            </div>
          </ShouldRender>
        </div>
      </article>
    </Link>
  );
};

export default CompactCard;
