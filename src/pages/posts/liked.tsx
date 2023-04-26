import React, { useEffect, useMemo, useRef, useState } from "react";
import MetaTags from "@components/MetaTags";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { trpc } from "@utils/trpc";
import useOnScreen from "@hooks/useOnScreen";
import PostCard from "@components/PostCard";
import ShouldRender from "@components/ShouldRender";
import EmptyMessage from "@components/EmptyMessage";
import SearchInput from "@components/SearchInput";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18nConfig from "@i18n-config";

const UserLikedPage: React.FC = () => {
  const { t } = useTranslation(["side-pages", "common"]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);
  const [queryValue, setQueryValue] = useState("");

  const {
    data: posts,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.useInfiniteQuery(
    [
      "posts.get-liked-posts",
      {
        limit: 6,
        query: queryValue,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const dataToShow = useMemo(
    () => posts?.pages.flatMap((page) => page.posts),
    [posts]
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
      <MetaTags title="Liked posts" />
      <div className="-mb-5 w-full">
        <h1 className="prose mb-2 w-full text-left text-2xl font-bold dark:prose-invert sm:text-3xl">
          {t("your-likes")}
        </h1>
        <SearchInput placeholder={t("search-likes")} setQuery={setQueryValue} />
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

      <ShouldRender if={noDataToShow}>
        <EmptyMessage
          message={!!queryValue ? t("no-posts-found") : t("no-likes")}
          redirect="/"
          hideRedirect={!!queryValue}
        />
      </ShouldRender>
    </>
  );
};

export default UserLikedPage;

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
