import getUserDisplayName from "@utils/getUserDisplayName";
import Link from "next/link";
import Image from "next/future/image";
import HTMLBody from "@components/HTMLBody";
import Button from "@components/Button";
import { Notification } from "@utils/types";
import ShouldRender from "@components/ShouldRender";
import { trpc } from "@utils/trpc";
import { HiDotsVertical } from "react-icons/hi";
import Popover from "@components/Popover";
import { MouseEvent } from "react";

export const NotificationCard = (notification: Notification) => {
  const notificationHasComment = !!notification?.comment;
  const isFollowNotification = notification?.type === "follow";

  const username = getUserDisplayName(notification.notifier);
  const utils = trpc.useContext();

  const { mutate: markAsRead } = trpc.useMutation(
    ["notification.mark-as-read"],
    {
      onSettled: () => {
        utils.invalidateQueries(["notification.total-unreads"]);

        utils.invalidateQueries([
          "notification.get-all",
          {
            limit: 6,
            read: true,
          },
        ]);

        utils.invalidateQueries([
          "notification.get-all",
          {
            limit: 6,
            read: false,
          },
        ]);
      },
    }
  );

  const handleMarkAsRead = (preventDefault: boolean) => (e: MouseEvent) => {
    if (preventDefault) e.preventDefault();

    if (notification.read === false)
      markAsRead({ notificationId: notification.id });
  };

  const buttonLabels = {
    follow: "Follow back",
    reply: "Reply back",
    comment: "Read comment",
  };

  return (
    <Link
      href={notification?.href || "/"}
      className="p-3 text-sm flex gap-2 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors w-full"
      key={notification.id}
      onClick={handleMarkAsRead(false)}
    >
      <Image
        width={32}
        height={32}
        alt={notification.notifier?.name || "User"}
        src={notification.notifier?.image || "/static/default-profile.jpg"}
        className="rounded-full flex-shrink-0 object-cover h-[32px]"
      />

      <div className="w-full">
        <div className="w-full flex">
          <p className={notification.read ? "w-full" : "w-11/12"}>
            {`${username} ${notification.message}  ·  `}
            <span className="text-neutral-400">{notification.createdAt}</span>
          </p>

          <ShouldRender if={notification?.read === false}>
            <Popover.Main
              className="rounded-lg"
              placement="left"
              icon={
                <div className="w-1/12">
                  <HiDotsVertical className="w-4 h-4 dark:text-neutral-500" />
                </div>
              }
            >
              <button
                onClick={handleMarkAsRead(true)}
                type="button"
                className="hover:opacity-60 rounded-lg text-sm dark:hover:brightness-125 dark:hover:opacity-100 bg-inherit p-4 cursor-pointer"
              >
                Mark as read
              </button>
            </Popover.Main>
          </ShouldRender>
        </div>

        <ShouldRender if={notificationHasComment}>
          <div className="mt-2">
            <HTMLBody className="bg-neutral-300/60 text-neutral-700/90 dark:text-neutral-400 dark:bg-neutral-800/60 p-2 rounded-md text-ellipsis line-clamp-2">
              {notification?.comment?.body}
            </HTMLBody>
          </div>
        </ShouldRender>

        <ShouldRender if={isFollowNotification || notificationHasComment}>
          <Button
            className="w-full rounded-full mt-2 flex justify-center bg-white border border-neutral-400 dark:border-none dark:bg-neutral-700"
            variant="text"
            size="sm"
          >
            {notification?.type === "reply" && "Reply back"}
            {notification?.type === "comment" && "Read comment"}
            {notification?.type === "follow" && "Follow back"}
          </Button>
        </ShouldRender>
      </div>
    </Link>
  );
};
