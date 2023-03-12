import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "@components/MainLayout";
import SearchAnimation from "@public/static/search.json";
import { HiSearch } from "react-icons/hi";
import useDebounce from "@hooks/useDebounce";
import { trpc } from "@utils/trpc";
import PostCard from "@components/PostCard";
import ShouldRender from "@components/ShouldRender";
import useOnScreen from "@hooks/useOnScreen";
import EmptyMessage from "@components/EmptyMessage";
import Lottie from "react-lottie";
import useFilterPosts from "@hooks/useFilterPosts";
import Tab from "@components/Tab";
import MetaTags from "@components/MetaTags";

const LOTTIE_OPTIONS = {
  loop: true,
  autoplay: true,
  animationData: SearchAnimation,
};

const SearchPage = () => {
  const [queryValue, setQueryValue] = useState("");
  const { currentFilter, filterLabels, filters, toggleFilter } =
    useFilterPosts();

  const query = useDebounce<string>(queryValue, 500);
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
        query,

        limit: 6,
        filter: currentFilter,
      },
    ],
    {
      ssr: false,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      enabled: !!query,
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
          <h1 className="text-3xl mb-3">Search posts</h1>
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
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiSearch
                className="text-gray-500 dark:text-gray-400"
                size={20}
              />
            </div>
            <input
              onChange={(e) => setQueryValue(e.target.value)}
              type="text"
              className="bg-gray-50 border border-gray-300 dark:border-neutral-600 text-gray-900 text-md rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3  dark:bg-neutral-800 dark:neutral-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
              placeholder="search posts"
              required
              title="Search posts"
            />
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
