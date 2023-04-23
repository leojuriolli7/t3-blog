import { createRouter } from "@server/createRouter";
import {
  formatComments,
  markdownToHtml,
  isLoggedInMiddleware,
  deleteChildComments,
  getFiltersByInput,
  formatDate,
  isStringEmpty,
} from "@server/utils";
import * as trpc from "@trpc/server";
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  getUserCommentsSchema,
  updateCommentSchema,
} from "@schema/comment.schema";

export const commentRouter = createRouter()
  .query("user-comments", {
    input: getUserCommentsSchema,
    async resolve({ ctx, input }) {
      const { userId, limit, skip, cursor } = input;

      try {
        const comments = await ctx.prisma.comment.findMany({
          take: limit + 1,
          skip: skip,
          cursor: cursor ? { id: cursor } : undefined,
          where: {
            userId,
          },
          include: {
            user: true,
            Post: {
              select: {
                userId: true,
                title: true,
              },
            },
          },
          ...(input?.filter
            ? { orderBy: getFiltersByInput(input?.filter, true) }
            : {
                orderBy: {
                  createdAt: "desc",
                },
              }),
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (comments.length > limit) {
          const nextItem = comments.pop(); // return the last item from the array
          nextCursor = nextItem?.id;
        }

        const withFormattedBody = await Promise.all(
          comments.map(async (comment) => {
            const formattedDate = formatDate(comment.createdAt);

            const formattedBody = await markdownToHtml(comment?.body || "", {
              removeLinksAndImages: false,
              truncate: false,
              linkifyImages: true,
            });

            return {
              ...comment,
              body: formattedBody,
              createdAt: formattedDate,
              markdownBody: comment.body,
              authorIsOP: comment?.Post?.userId === comment?.userId,
              children: [],
            };
          })
        );

        return { comments: withFormattedBody, nextCursor };
      } catch (e) {
        console.log("e:", e);
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
        });
      }
    },
  })
  .query("all-comments", {
    input: getCommentsSchema,
    async resolve({ ctx, input }) {
      const { postId } = input;

      try {
        const comments = await ctx.prisma.comment.findMany({
          where: {
            Post: {
              id: postId,
            },
          },
          include: {
            user: true,
            Post: {
              select: {
                userId: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        const withFormattedBody = await Promise.all(
          comments.map(async (comment) => {
            const formattedDate = formatDate(comment.createdAt);

            const formattedBody = await markdownToHtml(comment?.body || "", {
              removeLinksAndImages: false,
              truncate: false,
              linkifyImages: true,
            });

            return {
              ...comment,
              body: formattedBody,
              createdAt: formattedDate,
              // By also sendind the markdown body, we avoid having to
              // parse html back to MD when needed.
              markdownBody: comment?.body,
              authorIsOP: comment?.Post?.userId === comment?.userId,
            };
          })
        );

        type CommentType = (typeof withFormattedBody)[0];
        const withChildren = formatComments<CommentType>(withFormattedBody);

        return withChildren;
      } catch (e) {
        console.log("e:", e);
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
        });
      }
    },
  })
  .middleware(isLoggedInMiddleware)
  .mutation("add-comment", {
    input: createCommentSchema,
    async resolve({ ctx, input }) {
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

        // Notify author of post with a new comment
        if (parentPostAuthorId) {
          await ctx.prisma.notification.create({
            data: {
              postId: input.postId,
              commentId: comment.id,
              notifierId: ctx?.session?.user?.id,
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

          // Notify parent comment author of new reply
          if (parentCommentAuthorId) {
            await ctx.prisma.notification.create({
              data: {
                commentId: comment.id,
                postId: input.postId,
                notifierId: ctx?.session?.user?.id,
                notifiedId: parentCommentAuthorId as string,
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
    },
  })
  .mutation("delete-comment", {
    input: deleteCommentSchema,
    async resolve({ ctx, input }) {
      try {
        const { commentId } = input;

        const previousComment = await ctx.prisma.comment.findFirst({
          where: {
            id: commentId,
          },
        });

        if (previousComment?.userId !== ctx.session.user.id) {
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
    },
  })
  .mutation("update-comment", {
    input: updateCommentSchema,
    async resolve({ ctx, input }) {
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

      if (previousComment?.userId !== ctx.session.user.id) {
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
    },
  });
