import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  getUserCommentsSchema,
  updateCommentSchema,
} from "@schema/comment.schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@server/trpc";

type CommentRouterHandlerCache = {
  userComments?: typeof import("./userComments.handler").userCommentsHandler;
  allComments?: typeof import("./allComments.handler").allCommentsHandler;
  addComment?: typeof import("./addComment.handler").addCommentHandler;
  deleteComment?: typeof import("./deleteComment.handler").deleteCommentHandler;
  updateComment?: typeof import("./updateComment.handler").updateCommentHandler;
};

const UNSTABLE_HANDLER_CACHE: CommentRouterHandlerCache = {};

export const commentRouter = createTRPCRouter({
  userComments: publicProcedure
    .input(getUserCommentsSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.userComments) {
        UNSTABLE_HANDLER_CACHE.userComments = (
          await import("./userComments.handler")
        ).userCommentsHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.userComments) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.userComments({ ctx, input });
    }),

  allComments: publicProcedure
    .input(getCommentsSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.allComments) {
        UNSTABLE_HANDLER_CACHE.allComments = (
          await import("./allComments.handler")
        ).allCommentsHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.allComments) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.allComments({ ctx, input });
    }),
  addComment: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.addComment) {
        UNSTABLE_HANDLER_CACHE.addComment = (
          await import("./addComment.handler")
        ).addCommentHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.addComment) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.addComment({ ctx, input });
    }),

  deleteComment: protectedProcedure
    .input(deleteCommentSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.deleteComment) {
        UNSTABLE_HANDLER_CACHE.deleteComment = (
          await import("./deleteComment.handler")
        ).deleteCommentHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.deleteComment) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.deleteComment({ ctx, input });
    }),

  updateComment: protectedProcedure
    .input(updateCommentSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.updateComment) {
        UNSTABLE_HANDLER_CACHE.updateComment = (
          await import("./updateComment.handler")
        ).updateCommentHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.updateComment) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.updateComment({ ctx, input });
    }),
});
