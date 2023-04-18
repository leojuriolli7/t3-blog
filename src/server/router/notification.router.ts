import { createRouter } from "@server/createRouter";
import { isLoggedInMiddleware } from "@server/utils/isLoggedInMiddleware";

export const notificationRouter = createRouter()
  .middleware(isLoggedInMiddleware)
  .query("new", {
    async resolve({ ctx }) {
      const notifications = await ctx.prisma.notification.findMany({
        where: {
          notifiedId: ctx.session?.user?.id,
          read: false,
        },
        include: {
          comment: true,
          post: true,
          notifier: true,
        },
      });

      return notifications;
    },
  });
