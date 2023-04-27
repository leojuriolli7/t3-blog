import { useEffect, useMemo, useRef } from "react";
import { trpc } from "@utils/trpc";
import PostCard from "@components/PostCard";
import useOnScreen from "@hooks/useOnScreen";
import ShouldRender from "@components/ShouldRender";
import MetaTags from "@components/MetaTags";
import Skeleton from "@components/Skeleton";
import useFilterContent from "@hooks/useFilterContent";
import { generateSSGHelper } from "@server/ssgHepers";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import AnimatedTabs from "@components/AnimatedTabs";

const SingleTagPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const { tagId } = props;

  const { tabProps, selectedTab } = useFilterContent();

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "posts.posts",
        {
          limit: 6,
          tagId,
          filter: selectedTab.id,
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
      <div className="-mb-5  mt-5 w-full">
        <h1 className="text-left text-2xl xl:text-3xl">
          <ShouldRender if={!isLoading}>{tag?.name} posts</ShouldRender>
        </h1>

        <ShouldRender if={isLoading}>
          <Skeleton height="h-[32px] xl:h-[36px]" lines={1} width="w-40" />
        </ShouldRender>

        <div className="mt-3 flex gap-3 sm:items-start">
          <AnimatedTabs {...tabProps} />
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
