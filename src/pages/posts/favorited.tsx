import React, { useEffect, useMemo, useRef } from "react";
import MainLayout from "@components/MainLayout";
import MetaTags from "@components/MetaTags";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { trpc } from "@utils/trpc";
import useOnScreen from "@hooks/useOnScreen";
import PostCard from "@components/PostCard";
import ShouldRender from "@components/ShouldRender";
import EmptyMessage from "@components/EmptyMessage";

const UserFavoritesPage: React.FC = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const {
    data: posts,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.useInfiniteQuery(
    [
      "posts.get-favorite-posts",
      {
        limit: 6,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const dataToShow = useMemo(
    () => posts?.pages.flatMap((page) => page.posts),
    [posts]
  );

  const loadingArray = Array.from<undefined>({ length: 4 });
  const noDataToShow = !isLoading && !dataToShow?.length && !hasNextPage;

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);
  return (
    <>
      <MetaTags title="Favorite posts" />
      <MainLayout>
        <h1 className="sm:text-3xl text-2xl font-bold prose dark:prose-invert w-full text-left -mb-5">
          Your favorites
        </h1>
        {(isLoading ? loadingArray : dataToShow)?.map((post, i) => (
          <PostCard
            key={isLoading ? i : post?.id}
            post={post}
            loading={isLoading}
          />
        ))}

        <ShouldRender if={isFetchingNextPage}>
          <PostCard loading />
        </ShouldRender>

        <div ref={bottomRef} />

        <ShouldRender if={noDataToShow}>
          <EmptyMessage
            message="You have not favorited any posts yet."
            redirect="/"
            redirectMessage="Back to home"
          />
        </ShouldRender>
      </MainLayout>
    </>
  );
};

export default UserFavoritesPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {},
  };
}
