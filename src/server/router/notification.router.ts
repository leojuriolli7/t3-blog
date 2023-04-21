import { Notification } from "@prisma/client";
import { getNotificationsSchema } from "@schema/notification.schema";
import { createRouter } from "@server/createRouter";
import { isLoggedInMiddleware } from "@server/utils/isLoggedInMiddleware";

type NotificationTypes = "reply" | "comment" | "like" | "favorite" | "follow";

// Get the main notification text.
const notificationText: Record<NotificationTypes, string> = {
  comment: "commented on your post {{postName}}",
  favorite: "favorited your post {{postName}}",
  follow: "just followed you",
  like: "liked your post {{postName}}",
  reply: "replied to your comment in {{postName}}",
};

// Get the notification redirect link.
function getHref(notification: Notification) {
  const { postId, commentId, notifierId } = notification || {};

  const currentType = notification.type.toLowerCase() as NotificationTypes;

  const postTypes = ["favorite", "like"];
  const commentTypes = ["reply", "comment"];
  const userTypes = ["follow"];

  if (postTypes.includes(currentType)) return `/posts/${postId}`;

  if (commentTypes.includes(currentType))
    return `/posts/${postId}?highlightedComment=${commentId}`;

  if (userTypes.includes(currentType)) return `/users/${notifierId}`;
}

export const notificationRouter = createRouter()
  .middleware(isLoggedInMiddleware)
  .query("get-all", {
    input: getNotificationsSchema,
    async resolve({ ctx, input }) {
      const notifications = await ctx.prisma.notification.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          notifiedId: ctx.session?.user?.id,
          read: input.read,
        },
        include: {
          comment: true,
          post: true,
          notifier: true,
        },
      });

      const filteredNotifications = notifications?.map((notification) => {
        const currentType =
          notification.type.toLowerCase() as NotificationTypes;

        const href = getHref(notification);

        return {
          ...notification,
          type: currentType,
          message: notificationText[currentType].replace(
            "{{postName}}",
            notification?.post?.title || ""
          ),
          href,
        };
      });

      return {
        list: filteredNotifications,
        total: notifications?.length || 0,
      };
    },
  });
