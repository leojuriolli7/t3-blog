import ReactMarkdown from "@components/ReactMarkdown";
import getUserDisplayName from "@utils/getUserDisplayName";
import { Post } from "@utils/types";
import Link from "next/link";
import LikeCount from "./LikeCount";
import ShouldRender from "./ShouldRender";
import TagList from "./TagList";

type Props = {
  loading: boolean;
  post?: Post;
};

const PostCard: React.FC<Props> = ({ loading, post }) => {
  return (
    <Link href={`/posts/${post?.id}`} key={post?.id}>
      <article className="relative bg-slate-100 dark:bg-zinc-800 shadow-md w-full px-10 py-5 flex flex-col justify-center gap-5 cursor-pointer sm:hover:scale-110 transition-all">
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
          className={`prose-sm line-clamp-4 text-ellipsis prose-headings:text-base sm:max-h-none max-h-56`}
        >
          {post?.body}
        </ReactMarkdown>

        <div className="w-full flex justify-between items-center mt-2">
          <TagList compact loading={loading} tags={post?.tags} />
          <ShouldRender if={!loading}>
            <p className="min-w-min">by {getUserDisplayName(post?.user)}</p>
          </ShouldRender>
        </div>
      </article>
    </Link>
  );
};

export default PostCard;
