import { trpc } from "@utils/trpc";
import Link from "next/link";
import { useUserContext } from "src/context/user.context";

const PostListingPage: React.FC = () => {
  const { data, isLoading } = trpc.useQuery(["posts.posts"]);

  const user = useUserContext();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        {user ? (
          <Link href="/posts/new">Create post</Link>
        ) : (
          <nav>
            <Link href="/login">Login</Link>{" "}
            <Link href="/register">Register</Link>
          </nav>
        )}
      </div>
      {data?.map((post) => (
        <article key={post.id}>
          <p>{post.title}</p>
          <Link href={`/posts/${post.id}`}>Read post</Link>
        </article>
      ))}
    </div>
  );
};

export default PostListingPage;
