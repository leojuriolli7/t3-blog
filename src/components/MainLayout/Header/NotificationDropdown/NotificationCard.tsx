import getUserDisplayName from "@utils/getUserDisplayName";
import Link from "next/link";
import Image from "next/future/image";
import HTMLBody from "@components/HTMLBody";
import Button from "@components/Button";
import { Notification } from "@utils/types";
import { format, isToday } from "date-fns";
import ShouldRender from "@components/ShouldRender";

function formatNotificationDate(date?: Date) {
  if (date) {
    const toDate = new Date(date);
    return format(toDate, isToday(toDate) ? "HH:mm" : "dd/MM/yyyy");
  }
}

export const NotificationCard = (notification: Notification) => {
  const notificationHasComment = !!notification?.comment;
  const isReplyNotification = notification?.type === "reply";
  const isFollowNotification = notification?.type === "follow";

  const username = getUserDisplayName(notification.notifier);
  const formattedDate = formatNotificationDate(notification.createdAt);

  return (
    <Link
      href={notification?.href || "/"}
      className="p-3 text-sm flex gap-2 hover:bg-neutral-800/40 transition-colors w-full"
      key={notification.id}
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
            <HTMLBody className="text-neutral-400 bg-neutral-800/60 p-2 rounded-md text-ellipsis line-clamp-2">
              {notification?.comment?.body}
            </HTMLBody>

            <Button
              className="w-full rounded-full mt-2 flex justify-center bg-neutral-600"
              variant="transparent"
              size="sm"
            >
              {isReplyNotification ? "Reply back" : "Read comment"}
            </Button>
          </div>
        </ShouldRender>

        <ShouldRender if={isFollowNotification}>
          <Button
            className="w-full rounded-full mt-2 flex justify-center bg-neutral-600"
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
