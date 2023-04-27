import getUserDisplayName from "@utils/getUserDisplayName";
import type { PostFromList } from "@utils/types";
import { useContextualRouting } from "next-use-contextual-routing";
import Link from "next/link";
import LikeCount from "./LikeCount";
import LinkPreview from "./LinkPreview";
import HTMLBody from "./HTMLBody";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";
import TagList from "./TagList";

type Props = {
  loading?: boolean;
  post?: PostFromList;
};

const PostCard: React.FC<Props> = ({ post, loading = false }) => {
  const { makeContextualHref } = useContextualRouting();
  const username = getUserDisplayName(post?.user);

  return (
    <article
      className={`relative flex w-full cursor-pointer flex-col justify-center gap-5 rounded-lg border-2 border-zinc-200 bg-white px-10 py-5 shadow-3xl transition-borderAndShadow hover:shadow-4xl dark:border-zinc-700/90 dark:bg-zinc-800/70 dark:hover:border-zinc-500 ${
        loading ? "pointer-events-none" : ""
      }`}
    >
      <ShouldRender if={post?.link}>
        <LinkPreview data={post?.link} loading={loading} disableImagePreview />
      </ShouldRender>
      <div className="absolute -left-1 top-3 flex flex-col gap-3 sm:-left-3">
        <LikeCount label={post?.likes} />

        <LikeCount label={post?.dislikes} dislike />
      </div>

      <Link
        as={`/posts/${post?.id}`}
        href={makeContextualHref({ postId: post?.id || "" })}
        scroll={false}
        className="flex flex-col justify-center gap-5"
        prefetch={false}
        shallow
      >
        <ShouldRender if={!loading}>
          <h2 className="prose break-words text-2xl font-bold dark:prose-invert">
            {post?.title}
          </h2>
        </ShouldRender>

        <ShouldRender if={loading}>
          <Skeleton heading />
        </ShouldRender>

        <HTMLBody
          loading={loading}
          lines={3}
          className={`content-mask prose line-clamp-4 max-h-56 overflow-hidden text-ellipsis prose-headings:text-base prose-code:text-xs`}
        >
          {post?.body}
        </HTMLBody>
      </Link>

      <div className="mt-2 flex w-full items-center justify-between">
        <TagList compact loading={loading} tags={post?.tags} />
        <ShouldRender if={!loading}>
          <p className="ml-2 mt-2 min-w-min text-xs sm:text-sm">
            by{" "}
            <Link
              href={`/users/${post?.userId}`}
              className="font-bold text-emerald-600 underline dark:text-emerald-500"
              prefetch={false}
            >
              {username}
            </Link>
          </p>
        </ShouldRender>
      </div>
    </article>
  );
};

export default PostCard;
