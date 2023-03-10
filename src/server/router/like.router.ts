import { createRouter } from "@server/createRouter";
import * as trpc from "@trpc/server";
import { likePostSchema } from "@schema/like.schema";

export const likeRouter = createRouter().mutation("like-post", {
  input: likePostSchema,
  async resolve({ ctx, input }) {
    if (!ctx.session) {
      throw new trpc.TRPCError({
        code: "UNAUTHORIZED",
        message: "Login to like a post",
      });
    }

    const { dislike, postId } = input;
    const isDislike = dislike;
    const isLike = !dislike;

    const previousUserLikeOnPost = await ctx.prisma.like.findFirst({
      where: {
        userId: ctx.session?.user.id,
        postId,
      },
    });

    const hasUserAlreadyLiked = !!previousUserLikeOnPost;

    if (!hasUserAlreadyLiked) {
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
  },
});
