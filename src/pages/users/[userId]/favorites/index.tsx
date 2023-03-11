import React, { useEffect, useMemo, useRef } from "react";
import MainLayout from "@components/MainLayout";
import MetaTags from "@components/MetaTags";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import getUserDisplayName from "@utils/getUserDisplayName";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { trpc } from "@utils/trpc";
import useOnScreen from "@hooks/useOnScreen";
import PostCard from "@components/PostCard";
import ShouldRender from "@components/ShouldRender";
import EmptyMessage from "@components/EmptyMessage";

const UserFavoritesPage: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;

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
      <MetaTags
        title={getUserDisplayName(user)}
        image={user?.image || "/static/default-profile.jpg"}
      />
      <MainLayout>
        <h2 className="sm:text-3xl text-2xl w-full text-left -mb-5">
          Your favorites
        </h2>
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
            redirect={`/users/${session?.user?.id}`}
            redirectMessage="Back to your profile"
          />
        </ShouldRender>
      </MainLayout>
    </>
  );
};

export default UserFavoritesPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  const { query } = context;

  if (!session) {
    return { redirect: { destination: "/" } };
  }

  if (session.user.id !== query.userId) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: {},
  };
}
