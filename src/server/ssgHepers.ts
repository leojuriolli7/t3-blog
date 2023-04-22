import { createSSGHelpers } from "@trpc/react/ssg";
import SuperJSON from "superjson";
import { createContext } from "@server/createContext";
import { appRouter } from "./router/app.router";

export const generateSSGHelper = async () =>
  createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: SuperJSON,
  });
