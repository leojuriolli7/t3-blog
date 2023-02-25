import React, { useEffect, useMemo, useRef } from "react";
import { trpc } from "@utils/trpc";
import MainLayout from "@components/MainLayout";
import useOnScreen from "src/hooks/useOnScreen";
import PostCard from "@components/PostCard";
import Image from "next/image";
import ShouldRender from "@components/ShouldRender";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import MetaTags from "@components/MetaTags";
import useGetDate from "src/hooks/useGetDate";

const UserPage: React.FC = () => {
  const router = useRouter();
  const userId = router.query.userId as string;
  const { data: session } = useSession();

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data: user } = trpc.useQuery([
    "users.single-post",
    {
      userId,
    },
  ]);

  const { date, toggleDateType } = useGetDate(user?.createdAt);

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "posts.user.posts",
        {
          userId,
          limit: 4,
        },
      ],
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const dataToShow = useMemo(
    () => data?.pages.flatMap((page) => page.posts),
    [data]
  );

  const loadingArray = Array.from<undefined>({ length: 4 });

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title={user?.name as string} image={user?.image as string} />
      <MainLayout>
        <section className="mx-auto flex flex-col items-center gap-5 mt-10">
          <Image
            src={user?.image || "/static/default-profile.jpg"}
            width={240}
            height={240}
            className="rounded-full"
            alt={user?.name as string}
          />
          <div className="text-center w-64">
            <ShouldRender if={!!user?.name}>
              <p className="text-xl">
                {user?.name}{" "}
                <ShouldRender if={session?.user?.id === userId}>
                  <span className="text-emerald-700 dark:text-emerald-500">
                    {" "}
                    (You)
                  </span>
                </ShouldRender>
              </p>
            </ShouldRender>
            <ShouldRender if={!!user?.createdAt}>
              <p className="mt-2 text-neutral-800 dark:text-neutral-400 dark:opacity-80">
                Member since{" "}
                <span
                  onClick={toggleDateType}
                  className="cursor-pointer select-none"
                  role="button"
                  aria-label="Change date visualization type"
                  title="Change date visualization type"
                >
                  {date}
                </span>
              </p>
            </ShouldRender>
          </div>
        </section>

        <section className="w-full">
          <h2 className="text-3xl mb-5">User posts</h2>
          <div className="w-full flex flex-col gap-10">
            {(isLoading ? loadingArray : dataToShow)?.map((post, i) => (
              <PostCard
                post={post}
                key={isLoading ? i : post?.id}
                loading={isLoading}
              />
            ))}

            <ShouldRender if={isFetchingNextPage}>
              <PostCard loading />
            </ShouldRender>
          </div>
        </section>

        <div ref={bottomRef} />
      </MainLayout>
    </>
  );
};

export default UserPage;
