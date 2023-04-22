import { useEffect, useMemo, useRef } from "react";
import { trpc } from "@utils/trpc";
import MainLayout from "@components/MainLayout";
import PostCard from "@components/PostCard";
import useOnScreen from "@hooks/useOnScreen";
import ShouldRender from "@components/ShouldRender";
import MetaTags from "@components/MetaTags";
import Skeleton from "@components/Skeleton";
import useFilterPosts from "@hooks/useFilterPosts";
import Tab from "@components/Tab";
import { generateSSGHelper } from "@server/ssgHepers";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

const SingleTagPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const { tagId } = props;

  const { currentFilter, filterLabels, filters, toggleFilter } =
    useFilterPosts();

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "posts.posts",
        {
          limit: 6,
          tagId,
          filter: currentFilter,
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

  const tag = dataToShow?.[0]?.tags?.find((tag) => tag.id === tagId);
  const loadingArray = Array.from<undefined>({ length: 4 });

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title={`${tag?.name || ""} posts`} />
      <MainLayout>
        <div className="w-full  mt-5 -mb-5">
          <h1 className="xl:text-3xl text-2xl text-left">
            <ShouldRender if={!isLoading}>{tag?.name} posts</ShouldRender>

            <ShouldRender if={isLoading}>
              <Skeleton heading lines={1} width="w-40" />
            </ShouldRender>
          </h1>

          <div className="flex sm:items-start mt-3 gap-3">
            {filters.map((filter) => (
              <Tab
                key={filter}
                active={currentFilter === filter}
                title={`Filter by ${filterLabels[filter]}`}
                label={filterLabels[filter]}
                onClick={toggleFilter(filter)}
              />
            ))}
          </div>
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
      </MainLayout>
    </>
  );
};

export default SingleTagPage;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ tagId: string }>
) {
  const ssg = await generateSSGHelper();
  const tagId = context.params?.tagId as string;

  await ssg.prefetchInfiniteQuery("posts.posts", {
    limit: 6,
    tagId,
    filter: "newest",
  });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      tagId,
    },
  };
}
