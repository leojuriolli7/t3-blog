import { useEffect, useMemo, useRef } from "react";
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
import { ButtonLink } from "@components/Button";
import Link from "next/link";

const PostListingPage: React.FC = () => {
  const { data: tagsWithPosts, isLoading: loadingTags } = trpc.useQuery(
    [
      "posts.posts-by-tags",
      {
        tagLimit: 4,
      },
    ],
    {
      refetchOnWindowFocus: false,
    }
  );

  const taggedPosts = tagsWithPosts?.tags;

  const { data: followingPosts } = trpc.useQuery(
    ["posts.following-posts", { limit: 4 }],
    {
      refetchOnWindowFocus: false,
      ssr: false,
    }
  );

  const followingPostsToShow = followingPosts?.posts;

  const { currentFilter, filterLabels, filters, toggleFilter } =
    useFilterPosts();

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "posts.posts",
        {
          limit: 4,
          filter: currentFilter,
        },
      ],
      {
        refetchOnWindowFocus: false,
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
            <p className="mb-3">Posts from all your following</p>
            <Section seeMoreHref="posts/following">
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
        <div className="w-full flex justify-between items-center -mb-5">
          <h2 className="text-3xl prose dark:prose-invert font-bold">
            Featured tags
          </h2>
          <Link prefetch={false} href="/posts/tags" passHref legacyBehavior>
            <ButtonLink variant="gradient" size="sm">
              All tags
            </ButtonLink>
          </Link>
        </div>

        {(loadingTags ? loadingArray : taggedPosts)?.map((tag, key) => (
          <Section
            loading={loadingTags}
            title={tag?.name}
            key={loadingTags ? key : tag?.id}
            seeMoreHref={`/posts/tags/${tag?.id}`}
          >
            {(loadingTags ? loadingArray : tag?.posts)?.map((post, key) => (
              <CompactCard
                loading={loadingTags}
                key={loadingTags ? key : `${tag?.id}-${post?.id}`}
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
