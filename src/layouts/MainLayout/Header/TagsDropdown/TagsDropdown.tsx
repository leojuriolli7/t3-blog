import Popover from "@components/Popover";
import SearchInput from "@components/SearchInput";
import Image from "@components/Image";
import { useMemo, useState } from "react";
import { AiFillTag } from "react-icons/ai";
import BeatLoader from "@components/BeatLoader";
import Link from "next/link";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import Skeleton from "@components/Skeleton";
import ShouldRender from "@components/ShouldRender";
import Button from "@components/Button";

type TagCardProps = {
  name?: string;
  image?: string;
  loading: boolean;
  id?: string;
};

const TagCard: React.FC<TagCardProps> = ({ name, image, loading, id }) => {
  return (
    <li className="w-full">
      <Link
        className="flex w-full px-6 py-4 transition-colors hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40"
        href={`/posts/tags/${id}`}
      >
        <Image
          src={image}
          isLoading={loading}
          className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
          alt={loading ? "Tag avatar" : `${name} tag avatar`}
          width={32}
          height={32}
        />

        {loading ? (
          <Skeleton width="w-full" height="h-[32px]" parentClass="ml-2" />
        ) : (
          <p className="ml-2 line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap text-lg text-zinc-700 dark:text-zinc-300">
            {name}
          </p>
        )}
      </Link>
    </li>
  );
};

const TagsDropdown: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const session = useSession();
  const user = session?.data?.user;

  const {
    data: tags,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.useInfiniteQuery(
    [
      "tags.subscribed",
      {
        limit: 6,
        query: searchQuery,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!user?.id,
    }
  );

  const dataToShow = useMemo(
    () => tags?.pages.flatMap((page) => page.tags),
    [tags]
  );

  const noDataToShow = !isLoading && !dataToShow?.length && !hasNextPage;

  const loadMore = () => fetchNextPage();

  return (
    <Popover.Main
      placement="bottom"
      strategy="fixed"
      rounded
      icon={
        <div className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full  border-[1px]  border-zinc-300 bg-white transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
          <AiFillTag className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
      }
    >
      <div className="flex w-full justify-end gap-2 p-3">
        <SearchInput
          setQuery={setSearchQuery}
          placeholder="Search your subscribed tags"
          replace={false}
        />
      </div>
      <ul className="grey-scrollbar mt-1 max-h-[450px] w-full overflow-y-auto scrollbar-thumb-rounded">
        {dataToShow?.map((tag) => (
          <TagCard
            key={tag?.id}
            name={tag?.name}
            image={tag?.avatar}
            id={tag?.id}
            loading={isLoading}
          />
        ))}

        <ShouldRender if={isLoading}>
          <div className="flex w-full justify-center py-2">
            <BeatLoader className="dark:fill-white" />
          </div>
        </ShouldRender>

        <ShouldRender if={noDataToShow}>
          <div className="w-full py-6 text-center">
            <p className="text-neutral-400">
              {searchQuery
                ? "No results found"
                : "You have not subscribed to any tags"}
            </p>

            {!searchQuery && (
              <Link className="text-emerald-500 underline" href="/posts/tags">
                Come explore some tags!
              </Link>
            )}
          </div>
        </ShouldRender>

        <ShouldRender if={!!dataToShow && hasNextPage}>
          <div className="flex w-full justify-center border-t border-neutral-300 p-3 dark:border-zinc-800">
            <Button
              loading={isFetchingNextPage}
              onClick={loadMore}
              className="flex w-full justify-center rounded-full"
              variant="primary"
              size="sm"
            >
              Load more
            </Button>
          </div>
        </ShouldRender>
      </ul>
    </Popover.Main>
  );
};

export default TagsDropdown;
