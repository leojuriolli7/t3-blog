import { trpc } from "@utils/trpc";
import MainLayout from "@components/MainLayout";
import PostCard from "@components/PostCard";

const PostListingPage: React.FC = () => {
  const { data, isLoading } = trpc.useQuery(["posts.posts"]);

  const loadingArray = Array.from<undefined>({ length: 4 });

  return (
    <MainLayout>
      {(isLoading ? loadingArray : data)?.map((post) => (
        <PostCard key={post?.id} post={post} loading={isLoading} />
      ))}
    </MainLayout>
  );
};

export default PostListingPage;
