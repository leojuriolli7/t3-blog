import { MdNotifications } from "react-icons/md";
import Popover from "@components/Popover";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import BeatLoader from "@components/BeatLoader";
import { NotificationCard } from "./NotificationCard";
import useOnScreen from "@hooks/useOnScreen";
import ShouldRender from "@components/ShouldRender";

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
        "dark:text-neutral-300 text-neutral-500",
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

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

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <Popover.Main
      rounded
      icon={
        <div className="relative flex items-center justify-center bg-white w-[50px] h-[50px] border-zinc-300 border-[1px] dark:border-neutral-800 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-full">
          {!!totalUnreads && totalUnreads > 0 && (
            <label className="absolute top-0 right-0 bg-red-500 w-5 h-5 text-xs flex justify-center items-center rounded-full text-white">
              {totalUnreads > 9 ? "9+" : totalUnreads}
            </label>
          )}

          <MdNotifications className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
      }
    >
      <div className="w-80 max-h-[500px] overflow-y-auto">
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

        {dataToShow?.map((notification) => (
          <NotificationCard key={notification.id} {...notification} />
        ))}

        <ShouldRender if={noDataToShow}>
          <div className="w-full flex justify-center py-6">
            <p className="text-neutral-400">
              You have no {emptyMessageLabel[currentTab]}
            </p>
          </div>
        </ShouldRender>

        <ShouldRender if={isFetchingNextPage || isLoading}>
          <div className="w-full flex justify-center py-2">
            <BeatLoader className="dark:fill-white" />
          </div>
        </ShouldRender>

        <div ref={bottomRef} />
      </div>
    </Popover.Main>
  );
};

export default NotificationDropdown;
