import ShouldRender from "@components/ShouldRender";
import Tab from "@components/Tab";
import UserPreview from "@components/UserPreview";
import Link from "next/link";
import clsx from "clsx";
import { ButtonLink } from "@components/Button";
import TagPreview from "@components/TagPreview";
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

  const { data, isLoading } = trpc.search.byType.useQuery(
    {
      query,
      type: currentFilter,
      limit: 4,
      truncateComments: true,
    },
    {
      enabled: !!query,
      refetchOnWindowFocus: false,
    }
  );

  function isSearchType(type: SearchFilterTypes) {
    return data?.type === type && !!data?.[type]?.length;
  }

  const noDataToShow = !data?.[currentFilter]?.length && !isLoading;
  const hasDataToShow = !!data?.[currentFilter]?.length && !isLoading;

  return (
    <div
      className={clsx(
        `absolute top-16 z-50 rounded-lg border-[1px] border-zinc-300 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-neutral-800 dark:bg-zinc-900/70`,
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
        <ShouldRender if={isSearchType("posts")}>
          {data?.posts?.map((post) => (
            <CompactCard
              key={post?.id}
              post={post}
              bgClass="bg-white dark:bg-zinc-800/70"
            />
          ))}
        </ShouldRender>

        <ShouldRender if={isSearchType("comments")}>
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

        <ShouldRender if={isSearchType("tags")}>
          {data?.tags?.map((tag) => (
            <TagPreview key={tag?.id} tag={tag} loading={isLoading} />
          ))}
        </ShouldRender>

        <ShouldRender if={isSearchType("users")}>
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
