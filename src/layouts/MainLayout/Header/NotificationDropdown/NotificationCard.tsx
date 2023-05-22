import getUserDisplayName from "@utils/getUserDisplayName";
import Link from "next/link";
import Image from "@components/Image";
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
    <li className="w-full">
      <Link
        href={notification?.href || "/"}
        className={clsx(
          "flex w-full gap-2 p-3 text-sm transition-colors",
          notification?.href &&
            "hover:bg-neutral-100/50 dark:hover:bg-zinc-800/40"
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
            "h-[32px] flex-shrink-0 rounded-full object-cover",
            isSystemNotification && "bg-white"
          )}
        />

        <div className="w-full">
          <div className="flex w-full">
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
                    <HiDotsVertical className="h-4 w-4 dark:text-neutral-500" />
                  </div>
                }
              >
                <button
                  onClick={handleMarkAsRead({ preventDefault: true })}
                  type="button"
                  className="cursor-pointer rounded-lg bg-inherit p-4 text-sm hover:opacity-60 dark:hover:opacity-100 dark:hover:brightness-125"
                >
                  Mark as read
                </button>
              </Popover.Main>
            </ShouldRender>
          </div>

          <ShouldRender if={notificationHasComment}>
            <div className="mt-2">
              <HTMLBody className="line-clamp-2 text-ellipsis rounded-md bg-neutral-300/60 p-2 text-neutral-700/90 dark:bg-zinc-800/60 dark:text-neutral-400">
                {notification?.comment?.body}
              </HTMLBody>
            </div>
          </ShouldRender>

          <ShouldRender if={isFollowNotification || notificationHasComment}>
            <Button
              className="mt-2 flex w-full justify-center rounded-full border border-neutral-400 bg-white dark:border-none dark:bg-neutral-700"
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
    </li>
  );
};
