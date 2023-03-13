import { createRouter } from "@server/createRouter";
import { BUCKET_NAME, s3 } from "src/config/aws";
import {
  deleteChildComments,
  getFiltersByInput,
  getPostWithLikes,
} from "@server/utils";
import * as trpc from "@trpc/server";
import { isStringEmpty } from "@utils/checkEmpty";
import {
  createPostSchema,
  favoritePostSchema,
  getFavoritesSchema,
  getPostsByTagsSchema,
  getPostsSchema,
  getFollowingPostsSchema,
  getSinglePostSchema,
  updatePostSchema,
  searchPostsSchema,
} from "@schema/post.schema";

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

      const inputHasNoTags = !input?.tags?.length;

      if (
        isStringEmpty(input.body) ||
        isStringEmpty(input.title) ||
        inputHasNoTags
      ) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Body, title and tag are required",
        });
      }

      const tooManyTags = input?.tags?.length > 5;
      if (tooManyTags) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum of 5 tags per post",
        });
      }

      const post = await ctx.prisma.post.create({
        data: {
          title: input.title,
          body: input.body,
          ...(input?.link && {
            link: input.link,
          }),
          tags: {
            connectOrCreate: input.tags.map((tag) => ({
              create: {
                name: tag,
              },
              where: {
                name: tag,
              },
            })),
          },
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
  .query("tags", {
    resolve({ ctx }) {
      const tags = ctx.prisma.tag.findMany();

      return tags;
    },
  })
  .query("posts-by-tags", {
    input: getPostsByTagsSchema,
    async resolve({ ctx, input }) {
      const { tagLimit, cursor, skip } = input;

      const query = input?.query;

      const tags = await ctx.prisma.tag.findMany({
        take: tagLimit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: {
          posts: {
            _count: "desc",
          },
        },
        ...(query && {
          where: {
            name: {
              search: query,
            },
          },
        }),
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (tags.length > tagLimit) {
        const nextItem = tags.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const tagsWithPosts = await Promise.all(
        tags.map(async (tag) => {
          const posts = await ctx.prisma.post.findMany({
            where: {
              tags: {
                some: {
                  id: tag.id,
                },
              },
            },
            take: 5,
            include: {
              user: true,
              likes: true,
              tags: true,
            },
          });

          const postsWithLikes = posts.map((post) => getPostWithLikes(post));
          return {
            ...tag,
            posts: postsWithLikes,
          };
        })
      );

      return {
        tags: tagsWithPosts,
        nextCursor,
      };
    },
  })
  .query("search-posts", {
    input: searchPostsSchema,
    async resolve({ ctx, input }) {
      const { limit, skip, cursor } = input;
      if (!input?.query) return null;

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        ...(input?.filter
          ? { orderBy: getFiltersByInput(input?.filter) }
          : {
              orderBy: {
                createdAt: "desc",
              },
            }),
        where: {
          body: {
            search: input.query,
          },
          OR: {
            title: {
              search: input.query,
            },
          },
        },
        include: {
          user: true,
          likes: true,
          tags: true,
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
  .query("following-posts", {
    input: getFollowingPostsSchema,
    async resolve({ ctx, input }) {
      // No user logged in, so no following to get.
      if (!ctx.session?.user) return null;

      const following = await ctx.prisma.user.findFirst({
        where: { id: ctx?.session?.user?.id },
        select: { following: { select: { followingId: true } } },
      });

      // No posts from following.
      if (!following?.following?.length) return null;

      const posts = await ctx.prisma.post.findMany({
        where: {
          user: {
            id: {
              in: [...following.following.map((user) => user.followingId)],
            },
          },
        },
        include: {
          likes: true,
          user: true,
        },
        take: input.limit + 1,
        skip: input.skip,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        ...(input?.filter
          ? { orderBy: getFiltersByInput(input?.filter) }
          : {
              orderBy: {
                createdAt: "desc",
              },
            }),
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > input.limit) {
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
  .query("posts", {
    input: getPostsSchema,
    async resolve({ ctx, input }) {
      const { limit, skip, cursor, filter } = input;

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        ...(filter
          ? { orderBy: getFiltersByInput(filter) }
          : {
              orderBy: {
                createdAt: "desc",
              },
            }),
        include: {
          user: true,
          likes: true,
          tags: true,
        },
        ...(input.userId && {
          where: {
            userId: input.userId,
          },
        }),
        ...(input.tagId && {
          where: {
            tags: {
              some: {
                id: input.tagId,
              },
            },
          },
        }),
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
          tags: true,
          ...(ctx.session?.user?.id && {
            favoritedBy: {
              where: {
                userId: ctx.session.user.id,
              },
            },
          }),
        },
      });

      const postWithLikes = getPostWithLikes(post, ctx?.session);
      const favoritedByUser = postWithLikes.favoritedBy?.some(
        (favorite) => favorite.userId === ctx?.session?.user?.id
      );

      return {
        ...postWithLikes,
        favoritedByMe: favoritedByUser,
      };
    },
  })
  .query("get-favorite-posts", {
    input: getFavoritesSchema,
    async resolve({ ctx, input }) {
      const { userId, limit, skip, cursor } = input;
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          user: true,
          likes: true,
          tags: true,
        },
        where: {
          favoritedBy: {
            some: {
              userId,
            },
          },
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
        message: "You need to be logged in to do this.",
      });
    }

    return next();
  })
  .mutation("delete-post", {
    input: getSinglePostSchema,
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        include: {
          attachments: true,
          Comment: true,
          tags: {
            include: {
              _count: {
                select: {
                  posts: true,
                },
              },
            },
          },
        },
      });

      if (post?.attachments?.length) {
        await Promise.all(
          post.attachments.map(async (file) => {
            await s3
              .deleteObject({
                Bucket: BUCKET_NAME,
                Key: `${post.id}/${file.id}`,
              })
              .promise();
          })
        );
      }

      if (post?.Comment?.length) {
        await Promise.all(
          post.Comment.map(async (comment) => {
            await deleteChildComments(comment.id, ctx.prisma);
          })
        );
      }

      await ctx.prisma.post.delete({
        where: {
          id: input.postId,
        },
      });

      const tagsToDelete = post?.tags.filter((tag) => tag._count.posts === 1);

      await ctx.prisma.tag.deleteMany({
        where: {
          name: {
            in: tagsToDelete?.map((tag) => tag.name),
          },
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

      const previousPost = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        include: {
          tags: {
            include: {
              _count: {
                select: {
                  posts: true,
                },
              },
            },
          },
        },
      });

      // Find which tags were on the post previously, but are now removed.
      const previousPostTags = previousPost?.tags.map((tag) => tag.name) || [];

      // Tags that will have no posts after current post is deleted must be deleted aswell.
      const tagsToDelete = previousPost?.tags.filter(
        (tag) => tag._count.posts === 1 && input.tags.indexOf(tag.name) === -1
      );

      const tagsToRemove = previousPostTags.filter(
        (tag) => input.tags.indexOf(tag) === -1
      );

      // Filter for all new/existing tags who remain on the post.
      const tagsToCreateOrConnect = input.tags.filter(
        (tag) => tagsToRemove.indexOf(tag) < 0
      );

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
          tags: {
            ...(tagsToCreateOrConnect?.length && {
              connectOrCreate: tagsToCreateOrConnect.map((tag) => ({
                create: {
                  name: tag,
                },
                where: {
                  name: tag,
                },
              })),
            }),
            ...(tagsToRemove?.length && {
              disconnect: tagsToRemove.map((tag) => ({ name: tag })),
            }),
          },
        },
      });

      if (tagsToDelete?.length) {
        await ctx.prisma.tag.deleteMany({
          where: {
            name: {
              in: tagsToDelete.map((tag) => tag.name),
            },
          },
        });
      }

      return post;
    },
  })
  .mutation("favorite-post", {
    input: favoritePostSchema,
    async resolve({ input, ctx }) {
      const { postId, userId } = input;

      const userHasAlreadyFavoritedPost =
        await ctx.prisma.favoritesOnUsers.findUnique({
          where: {
            userId_postId: {
              postId,
              userId,
            },
          },
        });

      // User is unfavoriting post.
      if (!!userHasAlreadyFavoritedPost) {
        await ctx.prisma.favoritesOnUsers.delete({
          where: {
            userId_postId: {
              postId,
              userId,
            },
          },
        });
      }

      // User is favoriting post.
      if (!userHasAlreadyFavoritedPost) {
        await ctx.prisma.favoritesOnUsers.create({
          data: {
            postId,
            userId,
          },
        });
      }
    },
  });
