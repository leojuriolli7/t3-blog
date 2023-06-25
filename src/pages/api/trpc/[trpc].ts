import { appRouter } from "@server/router/app.router";
import * as trpcNext from "@trpc/server/adapters/next";
import { createTRPCContext } from "@server/trpc";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError({ error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.error("Something went wrong", error);
    } else {
      console.log(error);
    }
  },
});
