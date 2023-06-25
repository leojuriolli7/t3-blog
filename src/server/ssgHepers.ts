import SuperJSON from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "./router/app.router";
import type { NextApiRequest, NextApiResponse } from "next";
import { createTRPCContext } from "@server/trpc";
import type { IncomingMessage, ServerResponse } from "http";

type RequestType = IncomingMessage & {
  cookies: Partial<{
    [key: string]: string;
  }>;
};

type ResponseType = ServerResponse;

// We need the request and response to get the user session.
export const generateSSGHelper = async (req: RequestType, res: ResponseType) =>
  createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext({
      req: req as NextApiRequest,
      res: res as NextApiResponse,
    }),
    transformer: SuperJSON,
  });
