import * as trpcNext from "@trpc/server/adapters/next";
import { createTRPCContext } from "@server/trpc";
import { AnyRouter } from "@trpc/server";

export const createNextApiHandler = (router: AnyRouter) =>
  trpcNext.createNextApiHandler({
    router,
    createContext: createTRPCContext,
    batching: {
      enabled: true,
    },
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("Something went wrong", error);
      } else {
        console.log(error);
      }
    },
  });
