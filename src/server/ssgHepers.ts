import { createSSGHelpers } from "@trpc/react/ssg";
import SuperJSON from "superjson";
import { createContext } from "@server/createContext";
import { appRouter } from "./router/app.router";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingMessage, ServerResponse } from "http";

type RequestType = IncomingMessage & {
  cookies: Partial<{
    [key: string]: string;
  }>;
};

type ResponseType = ServerResponse;

// We need the request and response to get the user session.
export const generateSSGHelper = async (req: RequestType, res: ResponseType) =>
  createSSGHelpers({
    router: appRouter,
    ctx: await createContext({
      req: req as NextApiRequest,
      res: res as NextApiResponse,
    }),
    transformer: SuperJSON,
  });
