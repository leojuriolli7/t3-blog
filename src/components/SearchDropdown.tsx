import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SearchFilterTypes } from "@schema/search.schema";
import { useRouter } from "next/router";
import { trpc } from "@utils/trpc";
import useOnClickOutside from "@hooks/useClickOutside";
import Link from "next/link";
import clsx from "clsx";
import { ButtonLink } from "./Button";
import Comment from "./Comment";
import CompactCard from "./CompactCard";
import BeatLoader from "./BeatLoader";
import SearchInput from "./SearchInput";
import ShouldRender from "./ShouldRender";
import Tab from "./Tab";
import UserPreview from "./UserPreview";
import Section from "./Section";

export const FILTERS: SearchFilterTypes[] = [
  "posts",
  "comments",
  "tags",
  "users",
];

const SearchDropdown: React.FC = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [listRef] = useAutoAnimate<HTMLDivElement>();
  const [animateRef] = useAutoAnimate<HTMLDivElement>();
  const clickAwayRef = useRef<HTMLDivElement>(null);

  const [currentFilter, setCurrentFilter] =
    useState<SearchFilterTypes>("posts");

  const toggleFilter = useCallback(
    (value: SearchFilterTypes) => () => setCurrentFilter(value),
    []
  );

  const router = useRouter();

  const handleClickOutside = () => {
    setOpen(false);
  };
  useOnClickOutside<HTMLDivElement>(clickAwayRef, handleClickOutside);

  const { data, isLoading } = trpc.useQuery(
    [
      "search.by-type",
      {
        query,
        type: currentFilter,
        limit: 4,
      },
    ],
    {
      enabled: !!query,
      refetchOnWindowFocus: false,
    }
  );

  const noDataToShow = !data?.[currentFilter]?.length && !isLoading;
  const hasDataToShow = !!data?.[currentFilter]?.length && !isLoading;

  const onValueChange = (value: string) => {
    setOpen(!!value);
  };

  useEffect(() => {
    const handleRouteChange = (
      url: string,
      { shallow }: { shallow: boolean }
    ) => {
      if (!shallow) setOpen(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if (query) setOpen(true);
  }, [query]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div ref={clickAwayRef}>
      <div ref={animateRef} className="relative z-50">
        <div>
          <SearchInput
            setQuery={setQuery}
            onValueChange={onValueChange}
            placeholder="Search posts, comments, users & tags"
            replace={false}
            className={clsx(
              `h-[50px] pr-2 rounded-full transition-all ease focus:w-96 max-w-[90vw]`,
              open ? "w-96" : "w-[50px]"
            )}
            full={false}
          />
        </div>
        <div
          className={clsx(
            `absolute z-50 top-16 shadow-2xl bg-white border-zinc-300 border-[1px] dark:border-neutral-800 dark:bg-neutral-900 p-8`,
            open ? "w-full" : "hidden"
          )}
        >
          <div className="w-full flex gap-2 items-center mb-4">
            {FILTERS.map((filter) => (
              <Tab
                key={filter}
                onClick={toggleFilter(filter)}
                active={currentFilter === filter}
                label={filter}
                className="capitalize"
              />
            ))}
          </div>

          <div
            ref={listRef}
            className="flex flex-col w-full items-center gap-3"
          >
            <ShouldRender if={data?.type === "posts" && !!data?.posts?.length}>
              {data?.posts?.map((post) => (
                <CompactCard key={post?.id} post={post} />
              ))}
            </ShouldRender>

            <ShouldRender
              if={data?.type === "comments" && !!data?.comments?.length}
            >
              {data?.comments?.map((comment) => (
                <Comment
                  hideReplies
                  outlined
                  compact
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
                    <CompactCard
                      key={`${tag?.id}-${post?.id}`}
                      post={post}
                      slide
                    />
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

          <div className="w-full flex flex-col items-center gap-2 mt-3">
            <ShouldRender if={hasDataToShow}>
              <Link
                href={`/search?q=${query}&type=${currentFilter}`}
                passHref
                legacyBehavior
              >
                <ButtonLink variant="primary" className="w-full justify-center">
                  {`See all results for "${query}"`}
                </ButtonLink>
              </Link>
            </ShouldRender>

            <ShouldRender if={isLoading}>
              <BeatLoader className="dark:fill-white" height={30} width={30} />
            </ShouldRender>

            <ShouldRender if={noDataToShow}>
              <p className="w-full flex justify-center">No results to show</p>
            </ShouldRender>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDropdown;
