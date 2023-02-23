import { createRouter } from "@server/createRouter";
import * as trpc from "@trpc/server";
import {
  createPostSchema,
  getSinglePostSchema,
  updatePostSchema,
} from "src/schema/post.schema";

export const postRouter = createRouter()
  .mutation("create-post", {
    input: createPostSchema,
    async resolve({ ctx, input }) {
      if (!ctx.user) {
        new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "Cannot create posts while not logged in",
        });
      }

      const post = await ctx.prisma.post.create({
        data: {
          ...input,
          user: {
            connect: {
              id: ctx?.user?.id,
            },
          },
        },
      });

      return post;
    },
  })
  .query("posts", {
    resolve({ ctx }) {
      return ctx.prisma.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      });
    },
  })
  .query("single-post", {
    input: getSinglePostSchema,
    resolve({ ctx, input }) {
      return ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
        include: {
          user: true,
        },
      });
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
  .mutation("delete-post", {
    input: getSinglePostSchema,
    async resolve({ ctx, input }) {
      await ctx.prisma.post.delete({
        where: {
          id: input.postId,
        },
      });
    },
  })
  .mutation("update-post", {
    input: updatePostSchema,
    async resolve({ ctx, input }) {
      if (!input?.title && !input.body) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "At least one field must be updated",
        });
      }

      const post = await ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          ...(input.body && {
            body: input.body,
          }),
          ...(input.title && {
            title: input.title,
          }),
        },
      });

      return post;
    },
  });
