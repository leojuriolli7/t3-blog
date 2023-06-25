import { scrapePageSchema } from "@schema/scraper.schema";
import { createTRPCRouter, protectedProcedure } from "@server/trpc";

type ScraperRouterHandlerCache = {
  scrapeLink?: typeof import("./scrapeLink.handler").scrapeLinkHandler;
};

const UNSTABLE_HANDLER_CACHE: ScraperRouterHandlerCache = {};

export const scraperRouter = createTRPCRouter({
  scrapeLink: protectedProcedure
    .input(scrapePageSchema)
    .query(async ({ input }) => {
      if (!UNSTABLE_HANDLER_CACHE.scrapeLink) {
        UNSTABLE_HANDLER_CACHE.scrapeLink = (
          await import("./scrapeLink.handler")
        ).scrapeLinkHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.scrapeLink) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.scrapeLink({ input });
    }),
});
