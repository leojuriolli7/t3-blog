import { createRouter } from "@server/createRouter";
import { getPostWithLikes } from "@server/utils";
import * as trpc from "@trpc/server";
import { isStringEmpty } from "@utils/checkEmpty";
import {
  createPostSchema,
  getPostsSchema,
  getSinglePostSchema,
  getUserPostsSchema,
  updatePostSchema,
} from "src/schema/post.schema";

export const postRouter = createRouter()
  .mutation("create-post", {
    input: createPostSchema,
    async resolve({ ctx, input }) {
      if (!ctx.session) {
        new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "Cannot create posts while not logged in",
        });
      }

      if (isStringEmpty(input.body) || isStringEmpty(input.title)) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Body and title are required",
        });
      }

      const post = await ctx.prisma.post.create({
        data: {
          ...input,
          user: {
            connect: {
              id: ctx?.session?.user?.id,
            },
          },
        },
      });

      return post;
    },
  })
  .query("posts", {
    input: getPostsSchema,
    async resolve({ ctx, input }) {
      const { limit, skip, cursor } = input;

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
          likes: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const postsWithLikes = posts.map((post) => getPostWithLikes(post));

      return {
        posts: postsWithLikes,
        nextCursor,
      };
    },
  })
  .query("single-post", {
    input: getSinglePostSchema,
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
        include: {
          user: true,
          likes: true,
        },
      });

      const postWithLikes = getPostWithLikes(post, ctx?.session);

      return postWithLikes;
    },
  })
  .query("user.posts", {
    input: getUserPostsSchema,
    async resolve({ ctx, input }) {
      const { limit, skip, cursor } = input;

      const posts = await ctx.prisma.post.findMany({
        where: {
          userId: input.userId,
        },
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
          likes: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const postsWithLikes = posts.map((post) => getPostWithLikes(post));

      return {
        posts: postsWithLikes,
        nextCursor,
      };
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new trpc.TRPCError({
        code: "UNAUTHORIZED",
        message: "Login to create a post",
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

      if (isStringEmpty(input.body) || isStringEmpty(input.title)) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Body and title cannot be empty",
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
