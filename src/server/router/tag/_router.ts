import {
  deleteTagSchema,
  getSingleTagSchema,
  getSubscribedTagsSchema,
  subscribeToTagSchema,
  updateTagSchema,
} from "@schema/tag.schema";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@server/trpc";

type ScraperRouterHandlerCache = {
  all?: typeof import("./all.handler").allHandler;
  singleTag?: typeof import("./singleTag.handler").singleTagHandler;
  subscribe?: typeof import("./subscribe.handler").subscribeHandler;
  subscribed?: typeof import("./subscribed.handler").subscribedHandler;
  update?: typeof import("./update.handler").updateHandler;
  delete?: typeof import("./delete.handler").deleteHandler;
};

const UNSTABLE_HANDLER_CACHE: ScraperRouterHandlerCache = {};

export const tagRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.all) {
      UNSTABLE_HANDLER_CACHE.all = (await import("./all.handler")).allHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.all) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.all({ ctx });
  }),

  singleTag: publicProcedure
    .input(getSingleTagSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.singleTag) {
        UNSTABLE_HANDLER_CACHE.singleTag = (
          await import("./singleTag.handler")
        ).singleTagHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.singleTag) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.singleTag({ ctx, input });
    }),

  subscribe: protectedProcedure
    .input(subscribeToTagSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.subscribe) {
        UNSTABLE_HANDLER_CACHE.subscribe = (
          await import("./subscribe.handler")
        ).subscribeHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.subscribe) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.subscribe({ ctx, input });
    }),

  subscribed: protectedProcedure
    .input(getSubscribedTagsSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.subscribed) {
        UNSTABLE_HANDLER_CACHE.subscribed = (
          await import("./subscribed.handler")
        ).subscribedHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.subscribed) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.subscribed({ ctx, input });
    }),
  update: adminProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.update) {
        UNSTABLE_HANDLER_CACHE.update = (
          await import("./update.handler")
        ).updateHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.update) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.update({ ctx, input });
    }),

  delete: adminProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.delete) {
        UNSTABLE_HANDLER_CACHE.delete = (
          await import("./delete.handler")
        ).deleteHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.delete) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.delete({ ctx, input });
    }),
});
