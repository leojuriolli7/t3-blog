import { createRouter } from "@server/createRouter";
import { deleteChildComments } from "@server/utils/deleteChildComments";
import { isLoggedInMiddleware } from "@server/utils/isLoggedInMiddleware";
import { markdownToHtml } from "@server/utils/markdownToHtml";
import * as trpc from "@trpc/server";
import { isStringEmpty } from "@utils/checkEmpty";
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
} from "@schema/comment.schema";

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

        const formattedComments = await Promise.all(
          comments.map(async (comment) => {
            const formattedBody = await markdownToHtml(
              comment?.body || "",
              false,
              false
            );

            return {
              ...comment,
              body: formattedBody,
              // By also sendind the markdown body, we avoid having to
              // parse html back to MD when needed.
              markdownBody: comment?.body,
            };
          })
        );

        return formattedComments;
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
