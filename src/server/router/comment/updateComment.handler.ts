import type { PrismaClient } from "@prisma/client";
import type { UpdateCommentInput } from "@schema/comment.schema";
import type { Session } from "next-auth";
import { isStringEmpty } from "@server/utils";
import * as trpc from "@trpc/server";

type UpdateCommentOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: UpdateCommentInput;
};

export const updateCommentHandler = async ({
  ctx,
  input,
}: UpdateCommentOptions) => {
  const isAdmin = ctx.session.user.isAdmin;

  if (isStringEmpty(input.body)) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Comment cannot be empty",
    });
  }

  const previousComment = await ctx.prisma.comment.findFirst({
    where: {
      id: input.commentId,
    },
  });

  if (previousComment?.userId !== ctx.session.user.id && !isAdmin) {
    throw new trpc.TRPCError({
      code: "UNAUTHORIZED",
      message: "You can only update comments created by you.",
    });
  }

  const comment = await ctx.prisma.comment.update({
    where: {
      id: input.commentId,
    },
    data: {
      ...(input.body && {
        body: input.body,
      }),
    },
  });

  return comment;
};
