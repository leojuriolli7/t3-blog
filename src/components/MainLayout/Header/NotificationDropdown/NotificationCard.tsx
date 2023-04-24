import getUserDisplayName from "@utils/getUserDisplayName";
import Link from "next/link";
import Image from "next/future/image";
import HTMLBody from "@components/HTMLBody";
import Button from "@components/Button";
import type { Notification } from "@utils/types";
import ShouldRender from "@components/ShouldRender";
import { trpc } from "@utils/trpc";
import { HiDotsVertical } from "react-icons/hi";
import Popover from "@components/Popover";
import { MouseEvent, useMemo } from "react";
import clsx from "clsx";

export const NotificationCard = (notification: Notification) => {
  const notificationHasComment = !!notification?.comment;
  const isFollowNotification = notification?.type === "follow";
  const isSystemNotification = notification?.isSystem === true;

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

  const handleMarkAsRead =
    ({ preventDefault }: { preventDefault: boolean }) =>
    (e: MouseEvent) => {
      if (preventDefault) e.preventDefault();

      if (notification.read === false)
        markAsRead({ notificationId: notification.id });
    };

  const imageProps = useMemo(() => {
    if (isSystemNotification)
      return {
        alt: "T3 Logo",
        src: "/static/small-logo.png",
      };

    return {
      alt: notification.notifier?.name || "User",
      src: notification.notifier?.image || "/static/default-profile.jpg",
    };
  }, [isSystemNotification, notification]);

  return (
    <Link
      href={notification?.href || "/"}
      className={clsx(
        "p-3 text-sm flex gap-2 transition-colors w-full",
        notification?.href &&
          "hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40"
      )}
      key={notification.id}
      onClick={handleMarkAsRead({ preventDefault: false })}
    >
      <Image
        width={32}
        height={32}
        alt={imageProps.alt}
        src={imageProps.src}
        className={clsx(
          "rounded-full flex-shrink-0 object-cover h-[32px]",
          isSystemNotification && "bg-white"
        )}
      />

      <div className="w-full">
        <div className="w-full flex">
          <p className={notification.read ? "w-full" : "w-11/12"}>
            {`${!isSystemNotification ? username : ""} ${
              notification.message
            }  ·  `}
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
                onClick={handleMarkAsRead({ preventDefault: true })}
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
