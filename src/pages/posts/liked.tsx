import React, { useEffect, useMemo, useRef, useState } from "react";
import MetaTags from "@components/MetaTags";
import type { GetServerSidePropsContext } from "next";
import type { User } from "next-auth";
import { trpc } from "@utils/trpc";
import useOnScreen from "@hooks/useOnScreen";
import PostCard from "@components/PostCard";
import ShouldRender from "@components/ShouldRender";
import EmptyMessage from "@components/EmptyMessage";
import SearchInput from "@components/SearchInput";
import { getServerAuthSession } from "@server/utils/auth";
import { PageWrapper } from "@components/PageWrapper";

type Props = {
  user: User;
};

const UserLikedPage = ({ user }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);
  const [queryValue, setQueryValue] = useState("");

  const {
    data: posts,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.posts.getLikedPosts.useInfiniteQuery(
    {
      limit: 6,
      query: queryValue,
      userId: user.id,
    },
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
      <MetaTags title="Liked posts" />
      <div className="-mb-5 w-full">
        <h1 className="prose mb-2 w-full text-left text-2xl font-bold dark:prose-invert sm:text-3xl">
          Your likes
        </h1>
        <SearchInput
          placeholder="Search your liked posts"
          setQuery={setQueryValue}
        />
      </div>
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
          message={
            !!queryValue
              ? "Hmm. No posts found."
              : "You have not liked any posts yet."
          }
          redirect="/"
          redirectMessage="Back to home"
          hideRedirect={!!queryValue}
        />
      </ShouldRender>
    </>
  );
};
UserLikedPage.PageWrapper = PageWrapper;
export default UserLikedPage;

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const session = await getServerAuthSession({ req, res });

  if (!session?.user) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {
      user: session.user,
    },
  };
}
