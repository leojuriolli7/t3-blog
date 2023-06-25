import { searchSchema } from "@schema/search.schema";
import { createTRPCRouter, publicProcedure } from "@server/trpc";

type SearchRouterHandlerCache = {
  byType?: typeof import("./byType.handler").byTypeHandler;
};

const UNSTABLE_HANDLER_CACHE: SearchRouterHandlerCache = {};

export const searchRouter = createTRPCRouter({
  byType: publicProcedure.input(searchSchema).query(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.byType) {
      UNSTABLE_HANDLER_CACHE.byType = (
        await import("./byType.handler")
      ).byTypeHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.byType) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.byType({ ctx, input });
  }),
});
