import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@utils/trpc";
import PostCard from "@components/PostCard";
import Image from "@components/Image";
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
import SearchInput from "@components/SearchInput";
import EmptyMessage from "@components/EmptyMessage";

const SingleTagPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const { tagId } = props;
  const [queryValue, setQueryValue] = useState("");

  const { tabProps, selectedTab } = useFilterContent();

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data: tag, isLoading: loadingTag } = trpc.useQuery([
    "posts.single-tag",
    {
      tagId,
    },
  ]);

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "posts.posts",
        {
          limit: 6,
          tagId,
          filter: selectedTab.id,
          query: queryValue,
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

  const noDataToShow = !!queryValue && !dataToShow?.length && !isLoading;

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title={`${tag?.name || ""} posts`} />

      <div className="-mb-5 mt-5 w-full">
        <div className="h-[200px] w-full">
          <Image
            src={tag?.backgroundImage}
            isLoading={loadingTag}
            className="rounded-t-md object-cover"
            alt={`${tag?.name || "Tag"} banner`}
            full
          />
        </div>

        <div className="relative flex w-full gap-4 rounded-b-md border-2 border-zinc-200 bg-white p-2 py-4 dark:border-zinc-700/90 dark:bg-zinc-800/70">
          <Image
            src={tag?.avatar}
            alt={`${tag?.name || "Tag"} avatar`}
            width={80}
            height={80}
            isLoading={loadingTag}
            className="h-20 w-20 flex-shrink-0 rounded-full object-cover"
          />

          <div className="w-full">
            <ShouldRender if={!loadingTag}>
              <h1 className="text-2xl capitalize text-zinc-700 dark:text-zinc-300 xl:text-3xl">
                {tag?.name}
              </h1>

              <p className="prose mt-1 leading-6 dark:prose-invert">
                {tag?.description}
              </p>
            </ShouldRender>
            <ShouldRender if={loadingTag}>
              <Skeleton height="h-[32px] xl:h-[36px]" lines={1} width="w-40" />

              <Skeleton
                lines={3}
                width="w-full"
                parentClass="mt-2"
                margin="mb-2"
              />
            </ShouldRender>
          </div>
        </div>

        <ShouldRender if={loadingTag}>
          <Skeleton height="h-[32px] xl:h-[36px]" lines={1} width="w-40" />
        </ShouldRender>

        <SearchInput
          replace={false}
          className="mt-4 rounded-full"
          placeholder={`Search ${tag?.name} posts`}
          setQuery={setQueryValue}
        />

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

      <ShouldRender if={noDataToShow}>
        <EmptyMessage message="Hmm. No posts found." hideRedirect />
      </ShouldRender>

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

  const postsQuery = ssg.prefetchInfiniteQuery("posts.posts", {
    limit: 6,
    tagId,
    filter: "newest",
  });

  const tagQuery = ssg.prefetchQuery("posts.single-tag", {
    tagId,
  });

  // fetching in parallel to reduce load times
  await Promise.all([postsQuery, tagQuery]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      tagId,
    },
  };
}
