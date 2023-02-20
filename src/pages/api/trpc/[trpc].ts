import { appRouter } from "@server/router/app.router";
import * as trpcNext from "@trpc/server/adapters/next";
import { createContext } from "@server/createContext";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.error("Something went wrong", error);
    } else {
      console.log(error);
    }
  },
});
