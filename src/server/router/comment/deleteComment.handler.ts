import type { Session } from "next-auth";
import type { PrismaClient } from "@prisma/client";
import type { DeleteCommentInput } from "@schema/comment.schema";
import { deleteChildComments } from "@server/utils";
import * as trpc from "@trpc/server";

type DeleteCommentOptions = {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: DeleteCommentInput;
};

export const deleteCommentHandler = async ({
  ctx,
  input,
}: DeleteCommentOptions) => {
  try {
    const { commentId } = input;
    const isAdmin = ctx.session.user.isAdmin;

    const previousComment = await ctx.prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    });

    if (previousComment?.userId !== ctx.session.user.id && !isAdmin) {
      throw new trpc.TRPCError({
        code: "UNAUTHORIZED",
        message: "Cannot delete another user's comment",
      });
    }

    await deleteChildComments(commentId, ctx.prisma);

    return true;
  } catch (e) {
    console.log(e);

    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
    });
  }
};
