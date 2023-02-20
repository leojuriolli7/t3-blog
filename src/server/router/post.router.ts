import { createRouter } from "@server/createRouter";
import * as trpc from "@trpc/server";
import { createPostSchema, getSinglePostSchema } from "src/schema/post.schema";

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
      });
    },
  });
