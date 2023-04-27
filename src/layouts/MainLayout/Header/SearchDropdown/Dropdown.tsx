import ShouldRender from "@components/ShouldRender";
import Tab from "@components/Tab";
import UserPreview from "@components/UserPreview";
import Section from "@components/Section";
import Link from "next/link";
import clsx from "clsx";
import { ButtonLink } from "@components/Button";
import Comment from "@components/Comment";
import CompactCard from "@components/CompactCard";
import { trpc } from "@utils/trpc";
import BeatLoader from "@components/BeatLoader";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useCallback, useState } from "react";
import { SearchFilterTypes } from "@schema/search.schema";
import { SEARCH_FILTERS } from "@utils/constants";

type Props = {
  query: string;
  open: boolean;
};

const Dropdown: React.FC<Props> = ({ query, open }) => {
  const toggleFilter = useCallback(
    (value: SearchFilterTypes) => () => setCurrentFilter(value),
    []
  );
  const [listRef] = useAutoAnimate<HTMLDivElement>();

  const [currentFilter, setCurrentFilter] =
    useState<SearchFilterTypes>("posts");

  const { data, isLoading } = trpc.useQuery(
    [
      "search.by-type",
      {
        query,
        type: currentFilter,
        limit: 4,
        truncateComments: true,
      },
    ],
    {
      enabled: !!query,
      refetchOnWindowFocus: false,
    }
  );

  const noDataToShow = !data?.[currentFilter]?.length && !isLoading;
  const hasDataToShow = !!data?.[currentFilter]?.length && !isLoading;

  return (
    <div
      className={clsx(
        `absolute top-16 z-50 rounded-lg border-[1px] border-zinc-300 bg-white p-8 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900`,
        open ? "w-full" : "hidden"
      )}
    >
      <div className="mb-4 flex w-full items-center gap-2">
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

      <div ref={listRef} className="flex w-full flex-col items-center gap-3">
        <ShouldRender if={data?.type === "posts" && !!data?.posts?.length}>
          {data?.posts?.map((post) => (
            <CompactCard
              key={post?.id}
              post={post}
              bgClass="bg-white dark:bg-zinc-800"
            />
          ))}
        </ShouldRender>

        <ShouldRender
          if={data?.type === "comments" && !!data?.comments?.length}
        >
          {data?.comments?.map((comment) => (
            <Comment
              hideReplies
              variant="outlined"
              compact
              linkToPost
              key={comment?.id}
              comment={comment}
            />
          ))}
        </ShouldRender>

        <ShouldRender if={data?.type === "tags" && !!data?.tags?.length}>
          {data?.tags?.map((tag) => (
            <Section
              compact
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

        <ShouldRender if={data?.type === "users" && !!data?.users?.length}>
          {data?.users?.map((user) => (
            <UserPreview key={user?.id} user={user} />
          ))}
        </ShouldRender>
      </div>

      <div className="mt-3 flex w-full flex-col items-center gap-2">
        <ShouldRender if={hasDataToShow}>
          <Link
            href={`/search?q=${query}&type=${currentFilter}`}
            passHref
            legacyBehavior
          >
            <ButtonLink
              variant="primary"
              className="w-full justify-center rounded-md text-center"
            >
              {`See all results for "${query}"`}
            </ButtonLink>
          </Link>
        </ShouldRender>

        <ShouldRender if={isLoading}>
          <BeatLoader className="dark:fill-white" height={30} width={30} />
        </ShouldRender>

        <ShouldRender if={noDataToShow}>
          <p className="flex w-full justify-center">No results to show</p>
        </ShouldRender>
      </div>
    </div>
  );
};

export default Dropdown;
