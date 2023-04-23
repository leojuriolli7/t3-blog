import { createRouter } from "@server/createRouter";
import { BUCKET_NAME, s3 } from "src/config/aws";
import {
  deleteChildComments,
  getFiltersByInput,
  isLoggedInMiddleware,
  formatPosts,
  getPostWithLikes,
  markdownToHtml,
  formatDate,
  isStringEmpty,
} from "@server/utils/index";
import * as trpc from "@trpc/server";
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
  getLikedPostsSchema,
  voteOnPollSchema,
} from "@schema/post.schema";

export const postRouter = createRouter()
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
          posts: {
            take: 5,
            include: {
              user: true,
              likes: true,
              tags: true,
              link: true,
            },
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
          const posts = tag.posts;
          const formattedPosts = await formatPosts(posts);

          return {
            ...tag,
            posts: formattedPosts,
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
          // `jsonProtocol` preview feature broke this part of the query:
          // TO-DO: Add back when fixed.
          // OR: {
          //   title: {
          //     search: input.query,
          //   },
          // },
        },
        include: {
          user: true,
          likes: true,
          tags: true,
          link: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const formattedPosts = await formatPosts(posts);

      return {
        posts: formattedPosts,
        nextCursor,
      };
    },
  })
  .query("following-posts", {
    input: getFollowingPostsSchema,
    async resolve({ ctx, input }) {
      // No user logged in, so no following to get.
      if (!ctx.session?.user) return null;

      const posts = await ctx.prisma.post.findMany({
        where: {
          user: {
            followers: {
              some: {
                followerId: ctx?.session?.user?.id,
              },
            },
          },
        },
        include: {
          likes: true,
          user: true,
          link: true,
          tags: true,
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

      const formattedPosts = await formatPosts(posts);

      return {
        posts: formattedPosts,
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
          link: true,
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

      const formattedPosts = await formatPosts(posts);

      return {
        posts: formattedPosts,
        nextCursor,
      };
    },
  })
  .query("single-post", {
    input: getSinglePostSchema,
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        include: {
          user: true,
          likes: true,
          tags: true,
          link: true,
          attachments: true,
          poll: {
            include: {
              options: {
                include: {
                  voters: true,
                },
              },
            },
          },
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

      const voters = post?.poll?.options.flatMap((option) => option.voters);

      const alreadyVoted = voters?.some(
        (voter) => voter.id === ctx?.session?.user.id
      );

      const poll = post?.poll
        ? {
            ...post?.poll,
            alreadyVoted,
            voters: voters?.length || 0,
            options: post?.poll?.options.map((option) => ({
              ...option,
              ...(option.voters.some(
                (voter) => voter.id === ctx?.session?.user?.id
              ) && {
                votedByMe: true,
              }),
            })),
          }
        : null;

      const htmlBody = await markdownToHtml(post?.body || "", {
        removeLinksAndImages: false,
        truncate: false,
        linkifyImages: true,
      });

      const formattedDate = formatDate(post!.createdAt);

      return {
        ...postWithLikes,
        body: htmlBody,
        createdAt: formattedDate,
        // By also sendind the markdown body, we avoid having to
        // parse html back to MD when needed.
        markdownBody: post?.body,
        favoritedByMe: favoritedByUser,
        poll,
      };
    },
  })
  .query("get-favorite-posts", {
    input: getFavoritesSchema,
    async resolve({ ctx, input }) {
      const { userId, limit, skip, cursor } = input;
      const query = input?.query;

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          user: true,
          likes: true,
          tags: true,
          link: true,
        },
        where: {
          favoritedBy: {
            some: {
              userId,
            },
          },
          ...(query && {
            body: {
              search: query,
            },
            // `jsonProtocol` preview feature broke this part of the query:
            // TO-DO: Add back when fixed.
            // OR: {
            //   title: {
            //     search: query,
            //   },
            // },
          }),
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const formattedPosts = await formatPosts(posts);

      return {
        posts: formattedPosts,
        nextCursor,
      };
    },
  })
  .query("get-liked-posts", {
    input: getLikedPostsSchema,
    async resolve({ ctx, input }) {
      const query = input?.query;

      const { userId, limit, skip, cursor } = input;
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          user: true,
          likes: true,
          tags: true,
          link: true,
        },
        where: {
          likes: {
            some: {
              dislike: false,
              userId,
            },
          },
          ...(query && {
            body: {
              search: query,
            },
            // `jsonProtocol` preview feature broke this part of the query:
            // TO-DO: Add back when fixed.
            // OR: {
            //   title: {
            //     search: query,
            //   },
            // },
          }),
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const formattedPosts = await formatPosts(posts);

      return {
        posts: formattedPosts,
        nextCursor,
      };
    },
  })
  .middleware(isLoggedInMiddleware)
  .mutation("create-post", {
    input: createPostSchema,
    async resolve({ ctx, input }) {
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
          likes: {
            // Automatically like own post on creation.
            create: {
              userId: ctx?.session?.user?.id,
            },
          },
        },
      });

      if (!!input?.link) {
        await ctx.prisma.link.create({
          data: {
            postId: post.id,
            image: input.link?.image,
            title: input.link?.title,
            url: input.link.url,
            description: input.link?.description,
            ...(input.link?.publisher && {
              publisher: input.link?.publisher,
            }),
          },
        });
      }

      if (!!input?.poll?.title && !!input?.poll?.options) {
        await ctx.prisma.poll.create({
          data: {
            postId: post.id,
            title: input.poll.title,
            options: {
              createMany: {
                data: input.poll.options.map((option) => ({
                  color: option.color,
                  title: option.title,
                  postId: post.id,
                })),
              },
            },
          },
        });
      }

      const followers = await ctx.prisma.follows.findMany({
        where: {
          followingId: ctx.session.user.id,
        },
        select: {
          followerId: true,
        },
      });

      const userHasFollowers = !!followers?.length;

      if (userHasFollowers) {
        const followersId = followers?.map((user) => user.followerId);

        const notificationInfo = followersId?.map((id) => ({
          postId: post.id,
          type: "FOLLOWING-POST",
          notifiedId: id,
          notifierId: ctx.session.user.id,
        }));

        // Notify all followers of a new post.
        await ctx.prisma.notification.createMany({
          data: notificationInfo,
        });
      }

      return post;
    },
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

      if (post?.userId !== ctx.session.user.id) {
        throw new trpc.TRPCError({
          code: "UNAUTHORIZED",
          message: "Cannot delete another user's post.",
        });
      }

      if (post?.attachments?.length) {
        await Promise.all(
          post.attachments.map(async (file) => {
            await s3
              .deleteObject({
                Bucket: BUCKET_NAME,
                Key: file.id,
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
          link: true,
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

      if (previousPost?.userId !== ctx.session.user.id) {
        throw new trpc.TRPCError({
          code: "UNAUTHORIZED",
          message: "You can only update posts created by you.",
        });
      }

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

      const previousLink = previousPost?.link?.url;
      const userIsDeletingLink = !input?.link?.url && !!previousLink;
      const userIsAddingNewLink = !!input?.link?.url && !!previousLink;
      const userIsCreatingLink = !!input?.link?.url && !previousLink;

      if (userIsDeletingLink || userIsAddingNewLink) {
        await ctx.prisma.link.delete({
          where: {
            postId: input.postId,
          },
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
          link: {
            ...((userIsAddingNewLink || userIsCreatingLink) &&
              !!input?.link?.url && {
                create: {
                  image: input.link?.image,
                  title: input.link?.title,
                  url: input.link.url,
                  description: input.link?.description,
                  ...(input.link?.publisher && {
                    publisher: input.link?.publisher,
                  }),
                },
              }),
          },
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
        await ctx.prisma.notification.create({
          data: {
            postId: input.postId,
            notifierId: ctx?.session?.user?.id,
            notifiedId: input.authorId,
            type: "FAVORITE" as const,
          },
        });

        await ctx.prisma.favoritesOnUsers.create({
          data: {
            postId,
            userId,
          },
        });
      }
    },
  })
  .mutation("vote-on-poll", {
    input: voteOnPollSchema,
    async resolve({ ctx, input }) {
      const poll = await ctx.prisma.poll.findUnique({
        where: {
          postId: input.postId,
        },
        include: {
          options: {
            include: {
              voters: true,
            },
          },
        },
      });

      const voters = poll?.options.flatMap((option) => option.voters);

      if (voters?.find((voter) => voter.id === ctx.session.user.id)) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "You have already voted on this poll.",
        });
      }

      return await ctx.prisma.pollOption.update({
        data: {
          voters: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        where: {
          id: input.optionId,
        },
      });
    },
  });
