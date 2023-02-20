import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@utils/prisma";
import { verifyJwt } from "@utils/jwt";

type ContextUser = {
  id: string;
  email: string;
  name: string;
  iat: string;
  exp: number;
};

const getUserFromRequest = (req: NextApiRequest) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const verifiedUser = verifyJwt<ContextUser>(token);

      return verifiedUser;
    } catch (e) {
      return null;
    }
  }

  return null;
};

export function createContext({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const user = getUserFromRequest(req);

  return { req, res, prisma, user };
}

export type Context = ReturnType<typeof createContext>;
