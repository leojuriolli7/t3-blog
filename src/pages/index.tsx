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
import { generateSSGHelper } from "@server/ssgHepers";

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
            <h2 className="prose w-full text-left text-2xl font-bold dark:prose-invert xl:text-3xl">
              Following
            </h2>
            <p className="mb-3 text-sm xl:text-base">
              Posts from all your following
            </p>
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
        <div className="-mb-5 flex w-full items-center justify-between">
          <h2 className="prose text-2xl font-bold dark:prose-invert xl:text-3xl">
            Featured tags
          </h2>
          <Link prefetch={false} href="/posts/tags" passHref legacyBehavior>
            <ButtonLink variant="gradient" size="sm" className="rounded-full">
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
        <hr className="-mb-5 -mt-5 h-0.5 w-full border-0 bg-gray-200 dark:bg-neutral-700" />

        <div className="-mb-5 flex w-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className=" prose -mb-3 text-2xl font-bold dark:prose-invert sm:mb-0 xl:text-3xl">
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

export async function getServerSideProps() {
  const ssg = await generateSSGHelper();

  const tagsQuery = ssg.prefetchQuery("posts.posts-by-tags", {
    tagLimit: 4,
  });

  const postsQuery = ssg.prefetchInfiniteQuery("posts.posts", {
    limit: 4,
    filter: "newest",
  });

  // fetching in parallel to reduce load times
  await Promise.all([tagsQuery, postsQuery]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
}
