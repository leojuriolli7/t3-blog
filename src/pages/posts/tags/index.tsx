import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@utils/trpc";
import useOnScreen from "@hooks/useOnScreen";
import ShouldRender from "@components/ShouldRender";
import MetaTags from "@components/MetaTags";
import Section from "@components/Section";
import CompactCard from "@components/CompactCard";
import SearchInput from "@components/SearchInput";
import EmptyMessage from "@components/EmptyMessage";
import { generateSSGHelper } from "@server/ssgHepers";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18nConfig from "@i18n-config";

const AllTagsPage: React.FC = () => {
  const { t } = useTranslation(["side-pages", "common"]);
  const [queryValue, setQueryValue] = useState("");

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
        query: queryValue,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  const dataToShow = useMemo(
    () => tagsWithPosts?.pages.flatMap((page) => page.tags),
    [tagsWithPosts]
  );
  const noDataToShow = !isLoading && !dataToShow?.length && !hasNextPage;

  const loadingArray = (length: number) => Array.from<undefined>({ length });

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title={t("all-tags") ?? "All tags"} />
      <div className="w-full">
        <h1 className="prose w-full text-left text-2xl font-bold dark:prose-invert xl:text-3xl">
          {t("all-tags")}
        </h1>
        <p className="-mb-3">{t("see-all-tags")}</p>
      </div>
      <SearchInput setQuery={setQueryValue} placeholder={t("search-tags")} />
      {(isLoading ? loadingArray(4) : dataToShow)?.map((tag, key) => (
        <Section
          loading={isLoading}
          title={tag?.name}
          key={isLoading ? key : tag?.id}
          seeMoreHref={`/posts/tags/${tag?.id}`}
        >
          {(isLoading ? loadingArray(1) : tag?.posts)?.map((post, key) => (
            <CompactCard
              loading={isLoading}
              key={isLoading ? key : `${tag?.id}-${post?.id}`}
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

      <ShouldRender if={!!queryValue && noDataToShow}>
        <EmptyMessage message={t("no-tags-found")} hideRedirect />
      </ShouldRender>

      <div ref={bottomRef} />
    </>
  );
};

export default AllTagsPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  const ssg = await generateSSGHelper();

  const translationsData = serverSideTranslations(
    locale,
    ["side-pages", "common"],
    nextI18nConfig,
    ["en", "pt"]
  );

  const postsData = ssg.prefetchInfiniteQuery("posts.posts-by-tags", {
    tagLimit: 6,
    query: "",
  });

  const [translations] = await Promise.all([translationsData, postsData]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      ...translations,
    },
  };
}
