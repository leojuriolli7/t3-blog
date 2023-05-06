import { Context } from "../createContext";
import { TRPCError } from "@trpc/server";
import { MiddlewareFunction } from "@trpc/server/dist/declarations/src/internals/middlewares";
import { Session } from "next-auth";

interface AuthenticatedRouterContext extends Context {
  session: Session;
}

interface Meta {}

/** Determine whether user is logged in before procceding. */
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

/** Determine whether user is an admin before procceding. */
export const isAdminMiddleware: MiddlewareFunction<
  Context,
  AuthenticatedRouterContext,
  Meta
> = async ({ ctx, next }) => {
  if (ctx.session?.user.isAdmin !== true) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be an admin to access this method.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
};
