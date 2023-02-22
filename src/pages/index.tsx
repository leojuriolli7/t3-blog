import { trpc } from "@utils/trpc";
import Link from "next/link";
import ReactMarkdown from "@components/ReactMarkdown";
import MainLayout from "@components/MainLayout";

const PostListingPage: React.FC = () => {
  const { data, isLoading } = trpc.useQuery(["posts.posts"]);

  if (!data && isLoading) return <p>Loading...</p>;

  return (
    <MainLayout>
      {data?.map((post) => (
        <Link href={`/posts/${post.id}`} key={post.id} legacyBehavior>
          <a className="w-full">
            <article className="bg-slate-100 dark:bg-zinc-800 shadow-md w-full px-10 py-5 flex flex-col justify-center gap-5 cursor-pointer hover:scale-110 transition-all">
              <ReactMarkdown className="prose text-2xl font-bold">
                {post.title}
              </ReactMarkdown>
              <ReactMarkdown className="prose-sm line-clamp-4 prose-headings:text-base">
                {post.body}
              </ReactMarkdown>

              <p className="underline text-emerald-500">Read post</p>
            </article>
          </a>
        </Link>
      ))}
    </MainLayout>
  );
};

export default PostListingPage;
