import { createRouter } from "@server/createRouter";
import { Prisma } from "@prisma/client";
import * as trpc from "@trpc/server";
import {
  createUserSchema,
  requestOtpSchema,
  verifyOtpSchema,
} from "src/schema/user.schema";
import { sendLoginEmail } from "@utils/mailer";
import { baseUrl } from "../../constants";
import { decode, encode } from "@utils/base64";
import { signJwt } from "@utils/jwt";
import { serialize } from "cookie";

export const userRouter = createRouter()
  .mutation("register-user", {
    // Validates the input & trpc will infer the types from here.
    input: createUserSchema,
    async resolve({ ctx, input }) {
      const { email, name } = input;

      try {
        const user = await ctx.prisma.user.create({
          data: {
            email,
            name,
          },
        });

        return user;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // Violated an unique constraint
          if (e.code === "P2002") {
            throw new trpc.TRPCError({
              code: "CONFLICT",
              message: "User already exists",
            });
          }
        }

        throw new trpc.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    },
  })
  // One-time-password login
  .mutation("request-otp", {
    input: requestOtpSchema,
    async resolve({ ctx, input }) {
      const { redirect, email } = input;

      const user = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const token = await ctx.prisma.loginToken.create({
        data: {
          redirect,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      await sendLoginEmail({
        token: encode(`${token.id}:${user.email}`),
        url: baseUrl,
        email: user.email,
      });

      return true;
    },
  })
  .query("verify-otp", {
    input: verifyOtpSchema,
    async resolve({ input, ctx }) {
      const decodedToken = decode(input.hash).split(":");

      const [id, email] = decodedToken;

      const token = await ctx.prisma.loginToken.findFirst({
        where: {
          id,
          user: {
            email,
          },
        },
        include: {
          // Token object will return the user also.
          user: true,
        },
      });

      if (!token) {
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "Invalid token",
        });
      }

      const jwt = signJwt({
        // Omitting any private information (password, etc.)
        email: token.user.email,
        id: token.user.id,
      });

      ctx.res.setHeader("Set-Cookie", serialize("token", jwt, { path: "/" }));

      return {
        redirect: token.redirect,
      };
    },
  })
  .query("me", {
    resolve({ ctx }) {
      return ctx.user;
    },
  });
