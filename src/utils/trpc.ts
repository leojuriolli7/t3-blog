import type { AppRouter } from "@server/router/app.router";
import type { OperationLink } from "@trpc/client/src/links/types";
import type { AnyRouter } from "@trpc/server";
import {
  type Operation,
  type OperationResultObservable,
  httpBatchLink,
  httpLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";
import { url } from "./constants";

// all `pages/api/**/[trpc].ts` paths.
const ENDPOINTS = [
  "attachments",
  "comments",
  "likes",
  "notification",
  "posts",
  "scraper",
  "search",
  "tags",
  "users",
] as const;

export type Endpoint = (typeof ENDPOINTS)[number];

type LinksType = Record<string, OperationLink<AnyRouter, unknown, unknown>>;

type ResolveEndpointContext = {
  op: Operation<unknown>;
  next: (
    op: Operation<unknown>
  ) => OperationResultObservable<AnyRouter, unknown>;
};

const resolveEndpoint = (links: LinksType) => {
  return (ctx: ResolveEndpointContext) => {
    const parts = ctx.op.path.split(".");
    let endpoint;
    let path = "";
    if (parts.length == 2) {
      endpoint = parts[0] as keyof typeof links;
      path = parts[1];
    } else {
      endpoint = parts[1] as keyof typeof links;
      path = parts.splice(2, parts.length - 2).join(".");
    }

    return links[endpoint]({ ...ctx, op: { ...ctx.op, path } });
  };
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    return {
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: () => process.env.NEXT_PUBLIC_ENVIRONMENT === "develop",
        }),
        splitLink({
          // check for context property `skipBatch`
          condition: (op) => !!op.context.skipBatch,
          // when condition is true, use normal request
          true: (runtime) => {
            const links = Object.fromEntries(
              ENDPOINTS.map((endpoint) => [
                endpoint,
                httpLink({ url: url + "/" + endpoint })(runtime),
              ])
            );
            return resolveEndpoint(links);
          },
          // when condition is false, use batch request
          false: (runtime) => {
            const links = Object.fromEntries(
              ENDPOINTS.map((endpoint) => [
                endpoint,
                httpBatchLink({ url: url + "/" + endpoint })(runtime),
              ])
            );
            return resolveEndpoint(links);
          },
        }),
      ],
      /**
       * @link https://trpc.io/docs/data-transformers
       */
      transformer: superjson,
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
});
