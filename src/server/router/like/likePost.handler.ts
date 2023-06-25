import type { PrismaClient } from "@prisma/client";
import type { LikePostInput } from "@schema/like.schema";
import type { Session } from "next-auth";

type LikePostOptions = {
  ctx: {
    prisma: PrismaClient;
    session: Session;
  };
  input: LikePostInput;
};

export const likePostHandler = async ({ ctx, input }: LikePostOptions) => {
  const { dislike, postId } = input;
  const isDislike = dislike;
  const isLike = !dislike;
  const userId = ctx?.session?.user?.id;

  const previousUserLikeOnPost = await ctx.prisma.like.findFirst({
    where: {
      userId,
      postId,
    },
  });

  const hasUserAlreadyLiked = !!previousUserLikeOnPost;

  if (!hasUserAlreadyLiked) {
    if (userId !== input.authorId && !isDislike) {
      await ctx.prisma.notification.create({
        data: {
          postId: input.postId,
          notifierId: userId,
          notifiedId: input.authorId,
          type: "LIKE" as const,
        },
      });
    }

    return ctx.prisma.like.create({
      data: {
        postId,
        userId: ctx?.session?.user.id as string,
        dislike,
      },
    });
  }
  if (hasUserAlreadyLiked) {
    if (isLike) {
      // User had already liked, undo like
      if (hasUserAlreadyLiked && !previousUserLikeOnPost.dislike) {
        return ctx.prisma.like.delete({
          where: {
            userId_postId: {
              postId,
              userId: ctx.session?.user.id as string,
            },
          },
        });
      }

      // User had previously disliked, update to like
      if (hasUserAlreadyLiked && previousUserLikeOnPost.dislike) {
        return ctx.prisma.like.update({
          data: {
            dislike: false,
          },
          where: {
            userId_postId: {
              postId,
              userId: ctx.session?.user.id as string,
            },
          },
        });
      }
    }

    if (isDislike) {
      // User had already disliked, undo dislike
      if (hasUserAlreadyLiked && previousUserLikeOnPost.dislike) {
        return ctx.prisma.like.delete({
          where: {
            userId_postId: {
              postId,
              userId: ctx.session?.user.id as string,
            },
          },
        });
      }

      // User had previously liked the post, update to dislike
      if (hasUserAlreadyLiked && !previousUserLikeOnPost.dislike) {
        return ctx.prisma.like.update({
          data: {
            dislike: true,
          },
          where: {
            userId_postId: {
              postId: input.postId,
              userId: ctx.session?.user.id as string,
            },
          },
        });
      }
    }
  }
};
