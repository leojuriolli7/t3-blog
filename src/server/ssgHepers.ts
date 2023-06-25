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

type Args = {
  req: RequestType;
  res: ResponseType;
  /** If true, will skip getting the server-side session. */
  skipSession?: boolean;
};

// We need the request and response to get the user session.
export const generateSSGHelper = async ({
  req,
  res,
  skipSession = false,
}: Args) =>
  createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext(
      {
        req: req as NextApiRequest,
        res: res as NextApiResponse,
      },
      skipSession
    ),
    transformer: SuperJSON,
  });
