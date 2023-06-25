import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { CreateCommentInput } from "@schema/comment.schema";
import { isStringEmpty } from "@server/utils";
import * as trpc from "@trpc/server";

type AddCommentOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: CreateCommentInput;
};

export const addCommentHandler = async ({ ctx, input }: AddCommentOptions) => {
  const { body, postId, parentId } = input;

  const { session } = ctx;

  if (isStringEmpty(body)) {
    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
      message: "Comment can't be empty",
    });
  }

  try {
    const comment = await ctx.prisma.comment.create({
      data: {
        body,
        Post: {
          connect: {
            id: postId,
          },
        },
        user: {
          connect: {
            id: session?.user?.id,
          },
        },
        ...(parentId && {
          parent: {
            connect: {
              id: parentId,
            },
          },
        }),
      },
    });

    const post = await ctx.prisma.post.findFirst({
      where: {
        id: input.postId,
      },
      select: {
        userId: true,
      },
    });

    const parentPostAuthorId = post?.userId;
    const userId = ctx?.session?.user?.id;

    // Notify author of post with a new comment
    if (parentPostAuthorId && userId !== parentPostAuthorId) {
      await ctx.prisma.notification.create({
        data: {
          postId: input.postId,
          commentId: comment.id,
          notifierId: userId,
          notifiedId: parentPostAuthorId,
          type: "COMMENT" as const,
        },
      });
    }

    if (input.parentId) {
      const parentComment = await ctx.prisma.comment.findFirst({
        where: {
          id: input.parentId,
        },
        select: {
          userId: true,
        },
      });

      const parentCommentAuthorId = parentComment?.userId;
      const userId = ctx?.session?.user?.id;

      // Notify parent comment author of new reply
      if (parentCommentAuthorId && userId !== parentCommentAuthorId) {
        await ctx.prisma.notification.create({
          data: {
            commentId: comment.id,
            postId: input.postId,
            notifierId: userId,
            notifiedId: parentCommentAuthorId,
            type: "REPLY" as const,
          },
        });
      }
    }

    return comment;
  } catch (e) {
    console.log(e);

    throw new trpc.TRPCError({
      code: "BAD_REQUEST",
    });
  }
};
