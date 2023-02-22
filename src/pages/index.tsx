import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useCallback } from "react";
import ReactMarkdown from "@components/ReactMarkdown";
import { useUserContext } from "src/context/user.context";

const PostListingPage: React.FC = () => {
  const { data, isLoading } = trpc.useQuery(["posts.posts"]);
  const { mutate: logout } = trpc.useMutation(["users.logout"]);

  const onClickLogout = useCallback(() => logout(), [logout]);

  const user = useUserContext();

  if (!data && isLoading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center gap-10 py-12 w-2/4 max-w-2xl mx-auto">
      <div className="w-full">
        <nav className="flex justify-between w-full">
          {user ? (
            <>
              <Link href="/posts/new">Create post</Link>
              <p className="cursor-pointer" onClick={onClickLogout}>
                Logout
              </p>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
      {data?.map((post) => (
        <Link href={`/posts/${post.id}`} key={post.id} legacyBehavior>
          <a className="w-full">
            <article className="bg-slate-100 shadow-md w-full px-10 py-5 flex flex-col justify-center gap-5 cursor-pointer hover:scale-110 transition-all">
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
    </div>
  );
};

export default PostListingPage;
