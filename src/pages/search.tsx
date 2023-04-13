import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "@components/MainLayout";
import { trpc } from "@utils/trpc";
import PostCard from "@components/PostCard";
import ShouldRender from "@components/ShouldRender";
import SearchAnimation from "@public/static/search.json";
import Lottie from "react-lottie";
import useOnScreen from "@hooks/useOnScreen";
import EmptyMessage from "@components/EmptyMessage";
import Tab from "@components/Tab";
import MetaTags from "@components/MetaTags";
import SearchInput from "@components/SearchInput";
import { SearchFilterTypes } from "@schema/search.schema";
import { SEARCH_FILTERS } from "@utils/constants";
import Comment from "@components/Comment";
import Section from "@components/Section";
import CompactCard from "@components/CompactCard";
import UserPreview from "@components/UserPreview";
import { useRouter } from "next/router";

const LOTTIE_OPTIONS = {
  loop: true,
  autoplay: true,
  animationData: SearchAnimation,
};

const SearchPage = () => {
  const [query, setQuery] = useState("");

  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);
  const currentFilter = (router.query.type as SearchFilterTypes) || "posts";

  const pageTitle = query
    ? `Searching for "${query}" in ${currentFilter}`
    : "Search";

  const toggleFilter = useCallback(
    (value: SearchFilterTypes) => () => {
      const queryObject = {
        query: {
          ...router.query,
          ...(value && { type: value }),
        },
      };

      router.replace(queryObject, queryObject, { shallow: true });
    },
    [router]
  );

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } =
    trpc.useInfiniteQuery(
      [
        "search.by-type",
        {
          query: query,
          limit: 6,
          type: currentFilter,
          truncateComments: false,
        },
      ],
      {
        ssr: false,
        refetchOnWindowFocus: false,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        enabled: !!query,
      }
    );

  const dataToDisplay = useMemo(() => {
    // TO-DO: Refactor (typescript issues here)
    const comments = data?.pages
      .flatMap((page) => page?.comments)
      .filter((item) => item !== undefined);

    const posts = data?.pages
      .flatMap((page) => page?.posts)
      .filter((item) => item !== undefined);

    const tags = data?.pages
      .flatMap((page) => page?.tags)
      .filter((item) => item !== undefined);

    const users = data?.pages
      .flatMap((page) => page?.users)
      .filter((item) => item !== undefined);

    return {
      comments,
      posts,
      tags,
      users,
    };
  }, [data]);

  const noDataToShow =
    !!query && !dataToDisplay?.[currentFilter]?.length && !isLoading;

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title={pageTitle} />
      <MainLayout>
        <div className="w-full">
          <h1 className="xl:text-3xl text-2xl mb-3 font-bold prose dark:prose-invert">
            {pageTitle}
          </h1>
          <div className="w-full">
            <div className="w-full flex gap-2 items-center mb-4">
              {SEARCH_FILTERS.map((filter) => (
                <Tab
                  key={filter}
                  onClick={toggleFilter(filter)}
                  active={currentFilter === filter}
                  label={filter}
                  className="capitalize"
                />
              ))}
            </div>

            <SearchInput
              setQuery={setQuery}
              placeholder="What do you want to find?"
            />
          </div>
        </div>

        <ShouldRender if={!query && !router.query}>
          <div className="flex flex-col items-center">
            <Lottie options={LOTTIE_OPTIONS} width={232} height={207} />
            <p className="text-center">
              Search through users, posts, tags & comments in T3 Blog.
            </p>
          </div>
        </ShouldRender>

        <ShouldRender if={!!dataToDisplay?.posts?.length}>
          {dataToDisplay?.posts?.map((post) => (
            <PostCard key={post?.id} post={post} />
          ))}
        </ShouldRender>

        <ShouldRender if={!!dataToDisplay?.comments?.length}>
          {dataToDisplay?.comments?.map((comment) => (
            <Comment
              hideReplies
              variant="outlined"
              linkToPost
              key={comment?.id}
              comment={comment}
            />
          ))}
        </ShouldRender>

        <ShouldRender if={!!dataToDisplay?.tags?.length}>
          {dataToDisplay?.tags?.map((tag) => (
            <Section
              title={tag?.name}
              key={tag?.id}
              seeMoreHref={`/posts/tags/${tag?.id}`}
            >
              {tag?.posts?.map((post) => (
                <CompactCard key={`${tag?.id}-${post?.id}`} post={post} slide />
              ))}
            </Section>
          ))}
        </ShouldRender>

        <ShouldRender if={!!dataToDisplay?.users?.length}>
          {dataToDisplay?.users?.map((user) => (
            <UserPreview key={user?.id} user={user} />
          ))}
        </ShouldRender>

        <ShouldRender if={isLoading || isFetchingNextPage}>
          {currentFilter === "users" && <UserPreview loading />}

          {currentFilter === "tags" && (
            <Section loading>
              <CompactCard loading slide />
            </Section>
          )}

          {currentFilter === "posts" && <PostCard loading />}
          {currentFilter === "comments" && (
            <Comment variant="outlined" loading />
          )}
        </ShouldRender>

        <ShouldRender if={noDataToShow}>
          <EmptyMessage
            message={`Oops, no ${currentFilter} found. Maybe try again with a different query.`}
            hideRedirect
          />
        </ShouldRender>

        <div ref={bottomRef} />
      </MainLayout>
    </>
  );
};

export default SearchPage;
