import {
  createPresignedUrlSchema,
  createPresignedAvatarUrlSchema,
  createPresignedTagUrlSchema,
  deleteAttachmentSchema,
} from "@schema/attachment.schema";

import { createTRPCRouter, protectedProcedure } from "@server/trpc";

type AttachmentsRouterHandlerCache = {
  createPresignedUrl?: typeof import("./createPresignedUrl.handler").createPresignedUrlHandler;
  createPresignedPostBodyUrl?: typeof import("./createPresignedPostBodyUrl.handler").createPresignedPostBodyUrlHandler;
  createPresignedTagUrl?: typeof import("./createPresignedTagUrl.handler").createPresignedTagUrlHandler;
  createPresignedAvatarUrl?: typeof import("./createPresignedAvatarUrl.handler").createPresignedAvatarUrlHandler;
  deleteAttachment?: typeof import("./deleteAttachment.handler").deleteAttachmentHandler;
};

const UNSTABLE_HANDLER_CACHE: AttachmentsRouterHandlerCache = {};

export const attachmentsRouter = createTRPCRouter({
  createPresignedUrl: protectedProcedure
    .input(createPresignedUrlSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.createPresignedUrl) {
        UNSTABLE_HANDLER_CACHE.createPresignedUrl = (
          await import("./createPresignedUrl.handler")
        ).createPresignedUrlHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.createPresignedUrl) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.createPresignedUrl({ ctx, input });
    }),

  createPresignedPostBodyUrl: protectedProcedure.mutation(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.createPresignedPostBodyUrl) {
      UNSTABLE_HANDLER_CACHE.createPresignedPostBodyUrl = (
        await import("./createPresignedPostBodyUrl.handler")
      ).createPresignedPostBodyUrlHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.createPresignedPostBodyUrl) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.createPresignedPostBodyUrl({ ctx });
  }),
  createPresignedTagUrl: protectedProcedure
    .input(createPresignedTagUrlSchema)
    .mutation(async ({ input }) => {
      if (!UNSTABLE_HANDLER_CACHE.createPresignedTagUrl) {
        UNSTABLE_HANDLER_CACHE.createPresignedTagUrl = (
          await import("./createPresignedTagUrl.handler")
        ).createPresignedTagUrlHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.createPresignedTagUrl) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.createPresignedTagUrl({ input });
    }),
  createPresignedAvatarUrl: protectedProcedure
    .input(createPresignedAvatarUrlSchema)
    .mutation(async ({ input }) => {
      if (!UNSTABLE_HANDLER_CACHE.createPresignedAvatarUrl) {
        UNSTABLE_HANDLER_CACHE.createPresignedAvatarUrl = (
          await import("./createPresignedAvatarUrl.handler")
        ).createPresignedAvatarUrlHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.createPresignedAvatarUrl) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.createPresignedAvatarUrl({ input });
    }),

  deleteAttachment: protectedProcedure
    .input(deleteAttachmentSchema)
    .mutation(async ({ input }) => {
      if (!UNSTABLE_HANDLER_CACHE.deleteAttachment) {
        UNSTABLE_HANDLER_CACHE.deleteAttachment = (
          await import("./deleteAttachment.handler")
        ).deleteAttachmentHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.deleteAttachment) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.deleteAttachment({ input });
    }),
});
