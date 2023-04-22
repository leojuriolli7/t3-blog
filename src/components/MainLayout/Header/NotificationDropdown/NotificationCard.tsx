import getUserDisplayName from "@utils/getUserDisplayName";
import Link from "next/link";
import Image from "next/future/image";
import HTMLBody from "@components/HTMLBody";
import Button from "@components/Button";
import { Notification } from "@utils/types";
import { format, isToday } from "date-fns";
import ShouldRender from "@components/ShouldRender";
import { trpc } from "@utils/trpc";

function formatNotificationDate(date?: Date) {
  if (date) {
    const toDate = new Date(date);
    return format(toDate, isToday(toDate) ? "HH:mm" : "dd/MM/yyyy");
  }
}

// TO-DO: `Mark as read` button.
export const NotificationCard = (notification: Notification) => {
  const notificationHasComment = !!notification?.comment;
  const isReplyNotification = notification?.type === "reply";
  const isFollowNotification = notification?.type === "follow";

  const username = getUserDisplayName(notification.notifier);
  const formattedDate = formatNotificationDate(notification.createdAt);
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

  const handleClickCard = () => markAsRead({ notificationId: notification.id });

  return (
    <Link
      href={notification?.href || "/"}
      className="p-3 text-sm flex gap-2 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors w-full"
      key={notification.id}
      onClick={handleClickCard}
    >
      <Image
        width={32}
        height={32}
        alt={notification.notifier?.name || "User"}
        src={notification.notifier?.image || "/static/default-profile.jpg"}
        className="rounded-full object-cover h-[32px]"
      />

      <div className="w-full">
        <p>
          {`${username} ${notification.message}  ·  `}
          <span className="text-neutral-400">{formattedDate}</span>
        </p>
        <ShouldRender if={notificationHasComment}>
          <div className="mt-2">
            <HTMLBody className="content-mask bg-neutral-300/60 text-neutral-700/90 dark:text-neutral-400 dark:bg-neutral-800/60 p-2 rounded-md text-ellipsis line-clamp-2">
              {notification?.comment?.body}
            </HTMLBody>

            <Button
              className="w-full rounded-full mt-2 flex justify-center bg-gray-300 dark:bg-neutral-600"
              variant="transparent"
              size="sm"
            >
              {isReplyNotification ? "Reply back" : "Read comment"}
            </Button>
          </div>
        </ShouldRender>

        <ShouldRender if={isFollowNotification}>
          <Button
            className="w-full rounded-full mt-2 flex justify-center bg-gray-300 dark:bg-neutral-600"
            variant="transparent"
            size="sm"
          >
            Follow back
          </Button>
        </ShouldRender>
      </div>
    </Link>
  );
};
