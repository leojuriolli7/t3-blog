import { Comment } from "@prisma/client";
import { createRouter } from "@server/createRouter";
import * as trpc from "@trpc/server";
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
} from "src/schema/comment.schema";

export const commentRouter = createRouter()
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
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return comments;
      } catch (e) {
        console.log("e:", e);
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
        });
      }
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new trpc.TRPCError({
        code: "UNAUTHORIZED",
        message: "Login to post a comment",
      });
    }

    return next();
  })
  .mutation("add-comment", {
    input: createCommentSchema,
    async resolve({ ctx, input }) {
      const { body, postId, parentId } = input;

      const { user } = ctx;

      if (!body) {
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
                id: user?.id,
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

        const deleteChildComments = async (commentId: string) => {
          const oneLevelDownReplies = await ctx.prisma.comment.findMany({
            where: {
              parentId: commentId,
            },
          });

          // If no replies, delete comment.
          if (!oneLevelDownReplies.length) {
            return await ctx.prisma.comment.delete({
              where: {
                id: commentId,
              },
            });
          }

          // If has replies, check for other replies inside the replies.
          if (oneLevelDownReplies.length > 0) {
            for (const reply of oneLevelDownReplies) {
              await deleteChildComments(reply.id);
            }

            // After checking all replies, delete comment.
            await ctx.prisma.comment.delete({
              where: {
                id: commentId,
              },
            });
          }
        };

        await deleteChildComments(commentId);

        return true;
      } catch (e) {
        console.log(e);

        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
        });
      }
    },
  });
