import * as trpc from "@trpc/server";
import { createRouter } from "@server/createRouter";
import {
  deleteUserSchema,
  getSingleUserSchema,
  updateUserSchema,
} from "src/schema/user.schema";
import { isStringEmpty } from "@utils/checkEmpty";

export const userRouter = createRouter()
  .query("single-post", {
    input: getSingleUserSchema,
    resolve({ ctx, input }) {
      return ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new trpc.TRPCError({
        code: "UNAUTHORIZED",
        message: "You need to be logged in to access this method.",
      });
    }

    return next();
  })
  .mutation("delete-user", {
    input: deleteUserSchema,
    async resolve({ ctx, input }) {
      if (ctx.session?.user.id !== input.userId) {
        throw new trpc.TRPCError({
          code: "UNAUTHORIZED",
          message: "You cannot delete another user's profile.",
        });
      }

      if (ctx.session?.user.id === input.userId) {
        const deleteUser = ctx.prisma.user.delete({
          where: {
            id: input.userId,
          },
          include: {
            accounts: true,
          },
        });

        await ctx.prisma.$transaction([deleteUser]);
      }
    },
  })
  .mutation("update-profile", {
    input: updateUserSchema,
    async resolve({ ctx, input }) {
      if (isStringEmpty(input.name)) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Name cannot be empty",
        });
      }

      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          name: input.name,
        },
      });
    },
  });
