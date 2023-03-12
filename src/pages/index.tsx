import { useCallback, useEffect, useMemo, useRef } from "react";
import { trpc } from "@utils/trpc";
import MainLayout from "@components/MainLayout";
import PostCard from "@components/PostCard";
import useOnScreen from "@hooks/useOnScreen";
import ShouldRender from "@components/ShouldRender";
import MetaTags from "@components/MetaTags";
import useFilterPosts from "@hooks/useFilterPosts";
import Tab from "@components/Tab";
import Section from "@components/Section";
import CompactCard from "@components/CompactCard";
import { useRouter } from "next/router";

const PostListingPage: React.FC = () => {
  const router = useRouter();

  const { data: tagsWithPosts, isLoading: loadingTags } = trpc.useQuery([
    "posts.posts-by-tags",
    {
      tagLimit: 4,
    },
  ]);

  const { data: followingPosts } = trpc.useQuery([
    "posts.following-posts",
    { limit: 4 },
  ]);

  const followingPostsToShow = followingPosts?.posts;

  const onSeeMoreTag = useCallback(
    (tagId?: string) => () => router.push(`/posts/tag/${tagId}`),
    [router]
  );

  const onSeeMoreFollowing = useCallback(
    () => router.push(`/posts/following`),
    [router]
  );

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

  const loadingArray = Array.from<undefined>({ length: 4 });

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title="Home" />
      <MainLayout>
        <ShouldRender if={followingPostsToShow?.length}>
          <div className="w-full">
            <h2 className="w-full text-left text-3xl prose dark:prose-invert font-bold">
              Following
            </h2>
            <p className="mb-3 mt-1">Posts from all your following</p>
            <Section onClickSeeMore={onSeeMoreFollowing}>
              {followingPostsToShow?.map((post) => (
                <CompactCard
                  key={post.id}
                  loading={loadingTags}
                  post={post}
                  slide
                />
              ))}
            </Section>
          </div>
        </ShouldRender>
        <h2 className="w-full text-left -mb-5 text-3xl prose dark:prose-invert font-bold">
          Featured tags
        </h2>
        {(loadingTags ? loadingArray : tagsWithPosts)?.map((tag, key) => (
          <Section
            loading={loadingTags}
            title={tag?.name}
            key={loadingTags ? key : tag?.id}
            onClickSeeMore={onSeeMoreTag(tag?.id)}
          >
            {(loadingTags ? loadingArray : tag?.posts)?.map((post, key) => (
              <CompactCard
                loading={loadingTags}
                key={loadingTags ? key : tag?.id}
                post={post}
                slide
              />
            ))}
          </Section>
        ))}
        <hr className="w-full h-0.5 -mb-5 -mt-5 bg-gray-200 border-0 dark:bg-neutral-700" />

        <div className="w-full flex sm:justify-between sm:items-center sm:flex-row flex-col gap-5 -mb-5">
          <h2 className=" text-3xl prose dark:prose-invert font-bold sm:mb-0 -mb-3">
            All posts
          </h2>
          <div className="flex gap-3">
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

export default PostListingPage;
