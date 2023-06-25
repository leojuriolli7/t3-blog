import {
  getNotificationsSchema,
  markAsReadSchema,
} from "@schema/notification.schema";
import { createTRPCRouter, protectedProcedure } from "@server/trpc";

type NotificationRouterHandlerCache = {
  getAll?: typeof import("./getAll.handler").getAllHandler;
  totalUnreads?: typeof import("./totalUnreads.handler").totalUnreadsHandler;
  markAsRead?: typeof import("./markAsRead.handler").markAsReadHandler;
};

const UNSTABLE_HANDLER_CACHE: NotificationRouterHandlerCache = {};

export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(getNotificationsSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.getAll) {
        UNSTABLE_HANDLER_CACHE.getAll = (
          await import("./getAll.handler")
        ).getAllHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.getAll) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.getAll({ input, ctx });
    }),

  totalUnreads: protectedProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.totalUnreads) {
      UNSTABLE_HANDLER_CACHE.totalUnreads = (
        await import("./totalUnreads.handler")
      ).totalUnreadsHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.totalUnreads) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.totalUnreads({ ctx });
  }),
  markAsRead: protectedProcedure
    .input(markAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.markAsRead) {
        UNSTABLE_HANDLER_CACHE.markAsRead = (
          await import("./markAsRead.handler")
        ).markAsReadHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.markAsRead) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.markAsRead({ ctx, input });
    }),
});
