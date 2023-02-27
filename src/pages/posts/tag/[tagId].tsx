import { useEffect, useMemo, useRef } from "react";
import { trpc } from "@utils/trpc";
import MainLayout from "@components/MainLayout";
import PostCard from "@components/PostCard";
import useOnScreen from "src/hooks/useOnScreen";
import ShouldRender from "@components/ShouldRender";
import MetaTags from "@components/MetaTags";
import { useRouter } from "next/router";
import Skeleton from "@components/Skeleton";
import useFilterPosts from "src/hooks/useFilterPosts";
import Tab from "@components/Tab";

const PostsByTagPage: React.FC = () => {
  const { currentFilter, filterLabels, filters, toggleFilter } =
    useFilterPosts();

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);
  const router = useRouter();
  const tagId = router.query.tagId as string;

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
      <MetaTags title={`${tag?.name} Posts`} />
      <MainLayout>
        <div className="w-full  mt-5 -mb-5">
          <h1 className="text-3xl text-left">
            <ShouldRender if={!isLoading}>{tag?.name} Posts</ShouldRender>

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

export default PostsByTagPage;
