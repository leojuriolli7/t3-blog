import * as trpc from "@trpc/server";
import type { DeleteUserSchema } from "@schema/user.schema";
import type { Session } from "next-auth";
import type { PrismaClient } from "@prisma/client";

type DeleteUserOptions = {
  input: DeleteUserSchema;
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
};

export const deleteUserHandler = async ({ input, ctx }: DeleteUserOptions) => {
  const isAdmin = ctx?.session?.user?.isAdmin;

  if (ctx.session?.user.id !== input.userId && !isAdmin) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "You cannot delete another user's account.",
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
};
