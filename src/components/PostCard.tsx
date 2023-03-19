import ReactMarkdown from "@components/ReactMarkdown";
import getUserDisplayName from "@utils/getUserDisplayName";
import { PostFromList } from "@utils/types";
import Link from "next/link";
import LikeCount from "./LikeCount";
import LinkPreview from "./LinkPreview";
import ShouldRender from "./ShouldRender";
import TagList from "./TagList";

type Props = {
  loading: boolean;
  post?: PostFromList;
};

const PostCard: React.FC<Props> = ({ post, loading }) => {
  return (
    <Link href={`/posts/${post?.id}`} key={post?.id}>
      <article
        className={`relative bg-slate-100 dark:bg-zinc-800 shadow-md w-full px-10 py-5 flex flex-col justify-center gap-5 cursor-pointer sm:hover:scale-110 transition-all ${
          loading ? "pointer-events-none" : ""
        }`}
      >
        <ShouldRender if={post?.link}>
          <LinkPreview
            data={post?.link}
            loading={loading}
            disableImagePreview
          />
        </ShouldRender>
        <div className="absolute flex flex-col gap-3 sm:-left-3 -left-1 top-3">
          <LikeCount label={post?.likes} />

          <LikeCount label={post?.dislikes} dislike />
        </div>

        <ReactMarkdown
          loading={loading}
          heading
          className="prose text-2xl font-bold"
        >
          {post?.title}
        </ReactMarkdown>

        <ReactMarkdown
          loading={loading}
          lines={3}
          className={`prose-sm line-clamp-4 overflow-hidden text-ellipsis prose-headings:text-base max-h-56`}
        >
          {post?.body}
        </ReactMarkdown>

        <div className="w-full flex justify-between items-center mt-2">
          <TagList compact loading={loading} tags={post?.tags} />
          <ShouldRender if={!loading}>
            <p className="min-w-min ml-2 sm:text-sm text-xs mt-2">
              by {getUserDisplayName(post?.user)}
            </p>
          </ShouldRender>
        </div>
      </article>
    </Link>
  );
};

export default PostCard;
