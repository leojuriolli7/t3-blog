import ReactMarkdown from "@components/ReactMarkdown";
import { Post, User } from "@prisma/client";
import Link from "next/link";
import ShouldRender from "./ShouldRender";

type Props = {
  loading: boolean;
  post?: Post & { user: User };
};

const PostCard: React.FC<Props> = ({ loading, post }) => {
  return (
    <Link href={`/posts/${post?.id}`} key={post?.id} legacyBehavior>
      <a className="w-full">
        <article className="bg-slate-100 dark:bg-zinc-800 shadow-md w-full px-10 py-5 flex flex-col justify-center gap-5 cursor-pointer sm:hover:scale-110 transition-all">
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

          <div className="w-full flex justify-between items-center">
            <p className="underline text-emerald-500">Read post </p>
            <ShouldRender if={!loading}>
              <p>by {post?.user?.name}</p>
            </ShouldRender>
          </div>
        </article>
      </a>
    </Link>
  );
};

export default PostCard;
