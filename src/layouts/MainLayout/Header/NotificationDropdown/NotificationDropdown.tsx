import { useMemo, useState } from "react";
import { MdNotifications } from "react-icons/md";
import Popover from "@components/Popover";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import Button from "@components/Button";
import BeatLoader from "@components/BeatLoader";
import ShouldRender from "@components/ShouldRender";
import { NotificationCard } from "./NotificationCard";

type TabProps = {
  isActive: boolean;
  onClick: () => void;
  label: string;
};

const NotificationTab: React.FC<TabProps> = ({ isActive, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-neutral-500 dark:text-neutral-300",
        isActive ? "underline" : "text-neutral-400/70 dark:text-neutral-300/50"
      )}
    >
      {label}
    </button>
  );
};

type TabType = "new" | "old";

function getInputFromCurrentTab(tab: TabType) {
  return tab !== "new";
}

const emptyMessageLabel: Record<TabType, string> = {
  new: "new unreads.",
  old: "previous notifications.",
};

const NotificationDropdown = () => {
  const session = useSession();
  const user = session?.data?.user;
  const [currentTab, setCurrentTab] = useState<TabType>("new");

  const toggleTab = (value: TabType) => () => setCurrentTab(value);

  const { data: totalUnreads } = trpc.useQuery(["notification.total-unreads"], {
    enabled: !!user?.id,
  });

  const {
    data: notifications,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.useInfiniteQuery(
    [
      "notification.get-all",
      {
        limit: 6,
        read: getInputFromCurrentTab(currentTab),
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!user?.id,
    }
  );

  const dataToShow = useMemo(
    () => notifications?.pages.flatMap((page) => page.list),
    [notifications]
  );

  const noDataToShow = !isLoading && !dataToShow?.length && !hasNextPage;

  const loadMore = () => fetchNextPage();

  return (
    <Popover.Main
      placement="bottom"
      strategy="fixed"
      rounded
      icon={
        <div className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full  border-[1px]  border-zinc-300 bg-white transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">
          {!!totalUnreads && totalUnreads > 0 && (
            <label className="absolute right-0 top-0 flex h-5 w-5 animate-popIn items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {totalUnreads > 9 ? "9+" : totalUnreads}
            </label>
          )}

          <MdNotifications className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
      }
    >
      <div className="flex w-full justify-end gap-2 p-3">
        <NotificationTab
          isActive={currentTab === "new"}
          onClick={toggleTab("new")}
          label="Unreads"
        />

        <NotificationTab
          isActive={currentTab === "old"}
          onClick={toggleTab("old")}
          label="Old"
        />
      </div>
      <div className="grey-scrollbar mt-1 max-h-[450px] w-80 overflow-y-auto scrollbar-thumb-rounded">
        <ShouldRender if={!!dataToShow?.length}>
          {dataToShow?.map((notification) => (
            <NotificationCard key={notification.id} {...notification} />
          ))}
        </ShouldRender>

        <ShouldRender if={noDataToShow}>
          <div className="flex w-full justify-center py-6">
            <p className="text-neutral-400">
              You have no {emptyMessageLabel[currentTab]}
            </p>
          </div>
        </ShouldRender>

        <ShouldRender if={isLoading}>
          <div className="flex w-full justify-center py-2">
            <BeatLoader className="dark:fill-white" />
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
      </div>
    </Popover.Main>
  );
};

export default NotificationDropdown;
