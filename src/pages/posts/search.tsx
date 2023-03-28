import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "@components/MainLayout";
import SearchAnimation from "@public/static/search.json";
import { trpc } from "@utils/trpc";
import PostCard from "@components/PostCard";
import ShouldRender from "@components/ShouldRender";
import useOnScreen from "@hooks/useOnScreen";
import EmptyMessage from "@components/EmptyMessage";
import Lottie from "react-lottie";
import useFilterPosts from "@hooks/useFilterPosts";
import Tab from "@components/Tab";
import MetaTags from "@components/MetaTags";
import SearchInput from "@components/SearchInput";

const LOTTIE_OPTIONS = {
  loop: true,
  autoplay: true,
  animationData: SearchAnimation,
};

const SearchPage = () => {
  const { currentFilter, filterLabels, filters, toggleFilter } =
    useFilterPosts();

  const [queryValue, setQueryValue] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);
  const {
    data: searchedPosts,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
  } = trpc.useInfiniteQuery(
    [
      "posts.search-posts",
      {
        query: queryValue,
        limit: 6,
        filter: currentFilter,
      },
    ],
    {
      ssr: false,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      enabled: !!queryValue,
    }
  );

  const loadingArray = Array.from<undefined>({ length: 4 });

  const searchedPostsToDisplay = useMemo(
    () => searchedPosts?.pages.flatMap((page) => page?.posts),
    [searchedPosts]
  );

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title="Search posts" />
      <MainLayout>
        <div className="w-full">
          <h1 className="text-3xl mb-3 font-bold prose dark:prose-invert">
            Search posts
          </h1>
          <div className="flex gap-3 mb-3">
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
          <div className="w-full">
            <SearchInput setQuery={setQueryValue} placeholder="Search posts" />
          </div>
        </div>

        <ShouldRender if={!searchedPosts && !isLoading}>
          <div className="flex flex-col items-center">
            <Lottie options={LOTTIE_OPTIONS} width={232} height={207} />
            <p className="text-center">
              Search through all the posts in T3 Blog.
            </p>
          </div>
        </ShouldRender>

        <ShouldRender
          if={
            !!searchedPosts?.pages &&
            !searchedPostsToDisplay?.length &&
            !isLoading
          }
        >
          <EmptyMessage
            message="Hm.. No posts found. Try again with a different query."
            hideRedirect
          />
        </ShouldRender>

        {(isLoading ? loadingArray : searchedPostsToDisplay)?.map((post, i) => (
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

export default SearchPage;
