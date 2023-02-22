import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "@components/ReactMarkdown";
import { useUserContext } from "src/context/user.context";
import { useTheme } from "next-themes";
import ShouldRender from "@components/ShouldRender";

const PostListingPage: React.FC = () => {
  const { data, isLoading } = trpc.useQuery(["posts.posts"]);
  const { mutate: logout } = trpc.useMutation(["users.logout"]);

  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme, setTheme } = useTheme();
  const user = useUserContext();

  const currentTheme = theme === "system" ? systemTheme : theme;

  const onClickLogout = useCallback(() => logout(), [logout]);
  const toggleTheme = useCallback(
    () => setTheme(currentTheme === "dark" ? "light" : "dark"),
    [setTheme, currentTheme]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data && isLoading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center gap-10 py-12 w-2/4 max-w-2xl mx-auto">
      <div className="w-full flex justify-between">
        <nav className="flex gap-10">
          <ShouldRender if={user}>
            <Link href="/posts/new">Create post</Link>
            <button className="cursor-pointer" onClick={onClickLogout}>
              Logout
            </button>
          </ShouldRender>
          <ShouldRender if={!user}>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </ShouldRender>
        </nav>
        <ShouldRender if={mounted}>
          <button onClick={toggleTheme}>theme</button>
        </ShouldRender>
      </div>
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
    </div>
  );
};

export default PostListingPage;
