import { likePostSchema } from "@schema/like.schema";
import { createTRPCRouter, protectedProcedure } from "@server/trpc";

type LikeRouterHandlerCache = {
  likePost?: typeof import("./likePost.handler").likePostHandler;
};

const UNSTABLE_HANDLER_CACHE: LikeRouterHandlerCache = {};

export const likeRouter = createTRPCRouter({
  likePost: protectedProcedure
    .input(likePostSchema)
    .mutation(async ({ input, ctx }) => {
      if (!UNSTABLE_HANDLER_CACHE.likePost) {
        UNSTABLE_HANDLER_CACHE.likePost = (
          await import("./likePost.handler")
        ).likePostHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.likePost) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.likePost({ input, ctx });
    }),
});
