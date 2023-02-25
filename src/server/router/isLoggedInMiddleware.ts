import { Context } from "@server/createContext";
import { TRPCError } from "@trpc/server";
import { MiddlewareFunction } from "@trpc/server/dist/declarations/src/internals/middlewares";
import { Session } from "next-auth";

interface AuthenticatedRouterContext extends Context {
  session: Session;
}

interface Meta {}

export const isLoggedInMiddleware: MiddlewareFunction<
  Context,
  AuthenticatedRouterContext,
  Meta
> = async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this method.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
};
