import { MdNotifications } from "react-icons/md";
import Popover from "@components/Popover";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import { useState } from "react";
import clsx from "clsx";
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
        "text-neutral-300",
        isActive ? "underline" : "text-neutral-300/50"
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

/**
 * TO-DO:
 * 1. Empty state
 * 2. Set notification as 'read' on click.
 * 3. Infinite scrolling (`useInfiniteQuery`)
 * 4. Loading state with `NotificationCard`
 * 5. Mobile layout
 */
const NotificationDropdown = () => {
  const session = useSession();
  const user = session?.data?.user;
  const [currentTab, setCurrentTab] = useState<TabType>("new");

  const toggleTab = (value: TabType) => () => setCurrentTab(value);

  const { data: notifications } = trpc.useQuery(
    [
      "notification.get-all",
      {
        read: getInputFromCurrentTab(currentTab),
      },
    ],
    {
      enabled: !!user?.id,
      ssr: false,
    }
  );

  return (
    <Popover.Main
      rounded
      icon={
        <button
          className="relative flex items-center justify-center bg-white w-[50px] h-[50px] border-zinc-300 border-[1px] dark:border-neutral-800 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-full"
          type="button"
        >
          {!!notifications?.total && notifications?.total > 0 && (
            <label className="absolute top-0 right-0 bg-red-500 w-5 h-5 text-xs flex justify-center items-center rounded-full text-white">
              {notifications?.total > 9 ? "9+" : notifications?.total}
            </label>
          )}

          <MdNotifications className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
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

        {notifications?.list?.map((notification) => (
          <NotificationCard key={notification.id} {...notification} />
        ))}
      </div>
    </Popover.Main>
  );
};

export default NotificationDropdown;
