import { useEffect, useMemo, useRef } from "react";
import EmptyMessage from "@components/EmptyMessage";
import MetaTags from "@components/MetaTags";
import PostCard from "@components/PostCard";
import ShouldRender from "@components/ShouldRender";
import Tab from "@components/Tab";
import useFilterPosts from "@hooks/useFilterPosts";
import useOnScreen from "@hooks/useOnScreen";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { trpc } from "@utils/trpc";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18nConfig from "@i18n-config";

const Following = () => {
  const { t } = useTranslation(["side-pages", "common"]);

  const { currentFilter, filterLabels, filters, toggleFilter } =
    useFilterPosts();

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "posts.following-posts",
        {
          limit: 6,
          filter: currentFilter,
        },
      ],
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    );

  const dataToShow = useMemo(
    () => data?.pages.flatMap((page) => page?.posts),
    [data]
  );

  const loadingArray = Array.from<undefined>({ length: 4 });
  const noDataToShow = !isLoading && !dataToShow?.length && !hasNextPage;

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title={t("following") ?? "Following"} />
      <div className="w-full">
        <h2 className="prose -mb-3 text-xl font-bold dark:prose-invert sm:mb-0 xl:text-3xl">
          {t("posts-from-following")}
        </h2>
        <div className="mt-3 flex gap-3">
          {filters.map((filter) => (
            <Tab
              key={filter}
              active={currentFilter === filter}
              title={
                t("filters.filter-by", {
                  filterLabel: filterLabels[filter],
                  ns: "common",
                }) as string
              }
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

      <ShouldRender if={noDataToShow}>
        <EmptyMessage message={t("no-following-found")} hideRedirect small />
      </ShouldRender>

      <div ref={bottomRef} />
    </>
  );
};

export default Following;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const sessionData = getServerSession(context.req, context.res, authOptions);

  const translationsData = serverSideTranslations(
    context.locale ?? "en",
    ["side-pages", "common"],
    nextI18nConfig,
    ["en", "pt"]
  );

  const [session, translations] = await Promise.all([
    sessionData,
    translationsData,
  ]);

  if (!session?.user) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {
      ...translations,
    },
  };
}
