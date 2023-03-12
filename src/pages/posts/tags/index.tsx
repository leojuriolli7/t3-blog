import { useCallback, useEffect, useMemo, useRef } from "react";
import { trpc } from "@utils/trpc";
import MainLayout from "@components/MainLayout";
import useOnScreen from "@hooks/useOnScreen";
import ShouldRender from "@components/ShouldRender";
import MetaTags from "@components/MetaTags";
import Section from "@components/Section";
import CompactCard from "@components/CompactCard";
import { useRouter } from "next/router";

const TagsListPage: React.FC = () => {
  const router = useRouter();

  const onSeeMoreTag = useCallback(
    (tagId?: string) => () => router.push(`/posts/tags/${tagId}`),
    [router]
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const {
    data: tagsWithPosts,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.useInfiniteQuery(
    [
      "posts.posts-by-tags",
      {
        tagLimit: 6,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    }
  );

  const dataToShow = useMemo(
    () => tagsWithPosts?.pages.flatMap((page) => page.tags),
    [tagsWithPosts]
  );

  const loadingArray = (length: number) => Array.from<undefined>({ length });

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
        <div className="w-full">
          <h2 className="w-full text-left text-3xl prose dark:prose-invert font-bold">
            All tags
          </h2>
          <p className="-mb-3">See all tags created on T3 blog.</p>
        </div>
        {(isLoading ? loadingArray(4) : dataToShow)?.map((tag, key) => (
          <Section
            loading={isLoading}
            title={tag?.name}
            key={isLoading ? key : tag?.id}
            onClickSeeMore={onSeeMoreTag(tag?.id)}
          >
            {(isLoading ? loadingArray(1) : tag?.posts)?.map((post, key) => (
              <CompactCard
                loading={isLoading}
                key={isLoading ? key : tag?.id}
                post={post}
                slide
              />
            ))}
          </Section>
        ))}

        <ShouldRender if={isFetchingNextPage}>
          <Section loading={isLoading}>
            {loadingArray(1).map((card, i) => (
              <CompactCard key={i} loading slide />
            ))}
          </Section>
        </ShouldRender>

        <div ref={bottomRef} />
      </MainLayout>
    </>
  );
};

export default TagsListPage;
